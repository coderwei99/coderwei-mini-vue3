import { isObject, isFunction } from "../shared";

export function patch(vnode: any, container: any) {
  if (typeof vnode.type == "string") {
    // TODO 字符串 普通dom元素的情况
  } else if (isObject(vnode.type)) {
    // TODO 组件的情况
    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container: any) {
  // 创建组件实例
  const instance = createComponentInstance(vnode);

  // 安装组件
  setupComponent(instance);
}

// 创建组件实例 本质上就是个对象 vnode+type
function createComponentInstance(vnode: any) {
  const type = vnode.type;
  const instance = {
    type,
    vnode,
  };
  return instance;
}

// 安装组件函数
function setupComponent(instance: any) {
  // 初始化组件状态
  setupStateFulComponent(instance);
}

// 初始化组件状态函数
function setupStateFulComponent(instance: any) {
  // type是我们创建实例的时候自己手动加上的  -->createComponentInstance函数
  const Component = instance.type;
  const { setup } = Component;

  // 考虑用户没有使用setup语法
  if (setup) {
    const setupResult = setup();

    // 这里考虑两种情况，一种是setup返回的是一个对象，那么可以将这个对象注入template上下文渲染，另一种是setup返回的是一个h函数，需要走render函数
    handleSetupResult(instance, setupResult);
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
