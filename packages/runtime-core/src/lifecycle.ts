import { currentInstance } from './component'

export const enum LifeCycleHooks {
  BEFORE_CREATE = 'bc', //渲染前
  CREATED = 'c', //渲染后
  BEFORE_MOUNT = 'bm', //挂载前
  MOUNTED = 'm', //挂载后
  BEFORE_UPDATE = 'bu', //更新前
  UPDATED = 'u', //更新后
  BEFORE_UNMOUNT = 'bum', //卸载前
  UNMOUNTED = 'um', //卸载后
  DEACTIVATED = 'da', //keepAlive 特有的周期  失活状态 就是离开当前组件的瞬间会触发 但是被缓存的组件不会销毁 所以不会走前面的任何一个声明周期
  ACTIVATED = 'a' //keepAlive 特有的周期 活跃状态  离开当前组件又回来那个瞬间会触发 同上
}

// 注入生命周期
export function injectHook(type, hook, target) {
  if (target) {
    const hooks = target[type] || (target[type] = [])
    hooks.push(hook)
  } else {
    console.error('生命周期钩子只能在setup函数里面使用')
  }
}

/**
 * 工厂函数: 我们需要清楚我们是如何使用这几个生命周期的
 * beforeUpdate(() =>{
 *  code..
 * })
 * 几个生命周期的使用方式是一样的，他是一个函数，接受一个回调函数，会在适当的情况下执行这个回调函数，所以我们就知道createHook这个工厂函数必须返回一个函数
 *
 * target是一个可选的,我们试想一下,我们在使用生命周期钩子的时候,并没有传递对应的target,我们可以试想,一个项目中会有多个组件,执行injectHook的时候,他是如何区分他该将这个生命周期注入到那个组件实例呢?
 * result: 我们需要非常清楚vue的执行逻辑 当代码会走到这里的时候 那就说明一定是在setup函数里面 我们并不允许在其他地方调用生命周期函数(vue3 compostion api的情况下) 所以我们回顾执行setup函数的时候
 * 是不是在执行之前将当前组件实例赋值给了一个currentInstance变量(./component的setupStateFulComponent函数) 走到这里的时候就说明在执行setup函数 那么这个时候currentInstance变量一定储存着当前组件实例
 * 我们就可以确定该将生命周期函数注入到哪个组件实例了
 *  */
export function createHook(type) {
  return (hook, target = currentInstance) => {
    injectHook(type, hook, target)
  }
}

// 这里注意点: 用户实际上调用的是createHook返回的函数，而返回的函数我们使用闭包留存了type，也就是这里传递进去标志是哪个生命周期的变量
export const onBeforeMount = createHook(LifeCycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifeCycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifeCycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifeCycleHooks.UPDATED)
export const onBeforeUnmount = createHook(LifeCycleHooks.BEFORE_UNMOUNT)
export const onUnmounted = createHook(LifeCycleHooks.UNMOUNTED)
