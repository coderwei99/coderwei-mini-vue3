import { emit } from './componentEmit'
import { shallowReadonly, proxyRefs } from '@coderwei-mini-vue3/reactivity'
import { publicInstanceProxyHandlers } from './commonsetupState'
import { isObject, isFunction, isString } from '@coderwei-mini-vue3/shared'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'

// 保存组件实例  便于getCurrentInstance 中返回出去
export let currentInstance = null

// 设置组件实例函数
export function setCurrentInstance(instance: any) {
  currentInstance = instance
}

// 获取当期组件实例
export function getCurrentInstance(): any {
  return currentInstance
}

// 创建组件实例 本质上就是个对象
export function createComponentInstance(vnode: any, parentComponent: any) {
  const type = vnode.type
  const instance = {
    type,
    vnode,
    props: {},
    emit: () => {},
    slots: {},
    provides: parentComponent ? parentComponent.provides : ({} as Record<string, any>), //父组件提供的数据
    parent: parentComponent, //父组件实例
    isMouted: false, //标志组件是否挂载  后续用于判断是更新还是挂载
    subTree: {}, //子树的虚拟节点
    propsOptions: type.props || {}, //组件的props选项，在组件内部会通过defineProps来定义props，因为在使用组件的直接绑定属性不一定全都是props
    setupState: {},
    next: null,
    // 生命周期
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    ctx: {}
  }
  // console.log("vnode", instance);
  // console.log("emit", emit);
  // emit初始化
  instance.emit = emit.bind(null, instance) as any
  instance.ctx = { _: instance }
  // console.log(instance);

  return instance
}

// 安装组件函数
export function setupComponent(instance: any) {
  // console.log("setupComponent instance", instance);

  // 初始化props
  initProps(instance, instance.vnode.props)

  // 初始化slots
  // console.log("初始化slots之前", instance.vnode.children);

  initSlots(instance, instance.vnode.children)
  // console.log(instance);

  // 初始化组件状态
  setupStateFulComponent(instance)
}

// 创建setup上下文
export function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose: (exposed) => (instance.exposed = exposed || {})
  }
}

// 初始化组件状态函数
function setupStateFulComponent(instance: any) {
  // type是我们创建实例的时候自己手动加上的  -->createComponentInstance函数
  const Component = instance.type
  instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers)
  // console.log("instance", instance);

  const { setup } = Component

  // 考虑用户没有使用setup语法

  if (setup) {
    // console.log("instance emit", instance.emit);
    setCurrentInstance(instance)
    const instanceContext = createSetupContext(instance)
    const setupResult = setup(shallowReadonly(instance.props), instanceContext)

    // 这里考虑两种情况，一种是setup返回的是一个对象，那么可以将这个对象注入template上下文渲染，另一种是setup返回的是一个h函数，需要走render函数
    handleSetupResult(instance, setupResult)
    setCurrentInstance(null)
  }
  // 结束组件安装
  finishComponentSetup(instance)
}

function handleSetupResult(instance: any, setupResult: any) {
  if (isFunction(setupResult)) {
    // TODO setup返回值是h函数的情况
    if (instance.render) console.warn('setup返回一个函数,忽略render函数')
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    instance.setupState = proxyRefs(setupResult)
  }
}

function finishComponentSetup(instance: any) {
  const component = instance.type
  // console.log('---------------------------------')
  if (!instance.render) {
    if (compiler && !component.rennder) {
      if (component.template) {
        component.render = compiler(component.template)
      }
    }
    instance.render = component.render
  }
}

let compiler
export function createCompiler(_compiler) {
  compiler = _compiler
}
