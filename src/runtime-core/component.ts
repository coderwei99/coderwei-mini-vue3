import { emit } from "./componentEmit";
import { shallowReadonly } from "../reactive/reactive";
import { publicInstanceProxyHandlers } from "./commonsetupState";
import { isObject, isFunction, isString } from "../shared/index";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

// 保存组件实例  便于getCurrentInstance 中返回出去
export let currentInstance = null;

// 设置组件实例函数
export function setCurrentInstance(instance: any) {
  currentInstance = instance;
}

// 获取当期组件实例
export function getCurrentInstance(): any {
  return currentInstance;
}

// 创建组件实例 本质上就是个对象 vnode+type
export function createComponentInstance(vnode: any, parentComponent: any) {
  const type = vnode.type;
  const instance = {
    type,
    vnode,
    props: {},
    emit: () => {},
    slots: {},
    provides: parentComponent
      ? parentComponent.provides
      : ({} as Record<string, any>), //父组件提供的数据
    parent: parentComponent, //父组件实例
  };
  // console.log("vnode", instance);
  // console.log("emit", emit);
  // emit初始化
  instance.emit = emit.bind(null, instance) as any;
  // console.log(instance);

  return instance;
}

// 安装组件函数
export function setupComponent(instance: any) {
  // console.log("setupComponent instance", instance);

  // 初始化props
  initProps(instance, instance.vnode.props);

  // 初始化slots
  // console.log("初始化slots之前", instance.vnode.children);

  initSlots(instance, instance.vnode.children);
  // console.log(instance);

  // 初始化组件状态
  setupStateFulComponent(instance);
}

// 初始化组件状态函数
function setupStateFulComponent(instance: any) {
  // type是我们创建实例的时候自己手动加上的  -->createComponentInstance函数
  const Component = instance.type;
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
  // console.log("instance", instance);

  const { setup } = Component;

  // 考虑用户没有使用setup语法

  if (setup) {
    // console.log("instance emit", instance.emit);
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

    // 这里考虑两种情况，一种是setup返回的是一个对象，那么可以将这个对象注入template上下文渲染，另一种是setup返回的是一个h函数，需要走render函数
    handleSetupResult(instance, setupResult);
    setCurrentInstance(null);
  }
  // 结束组件安装
  finishComponentSetup(instance);
}

function handleSetupResult(instance: any, setupResult: any) {
  if (isFunction(setupResult)) {
    // TODO setup返回值是h函数的情况
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }
}

function finishComponentSetup(instance: any) {
  const component = instance.type;
  if (instance) {
    instance.render = component.render;
  }
}

// provide 函数的实现
export function provide<T>(key: string | number, value: T) {
  let currentInstance = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent?.provides;
    console.log("provides", provides);
    console.log("parentProvides", parentProvides);

    if (provides === parentProvides) {
      // 把provide原型指向父组件的provide
      provides = currentInstance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}

// inject 函数的实现
export function inject(key: string | any) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const parentProvide = currentInstance.parent.provides;

    return parentProvide[key];
  }
}
