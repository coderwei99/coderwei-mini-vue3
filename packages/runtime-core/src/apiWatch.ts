import { EffectDepend, isReactive, isRef, Ref } from '@coderwei-mini-vue3/reactivity'
import { extend, isArray, isFunction, isObject } from '@coderwei-mini-vue3/shared'
import { queuePosstFlushCb, queuePreFlushCb } from './scheduler'

export interface watchEffectOptions {
  flush?: 'pre' | 'post' | 'sync'
  onTrack?: (event) => void
  onTrigger?: (event) => void
}

type WatchSourceType<T = any> =
  | Ref<T> // ref
  | (() => T) // getter
  | T extends object
  ? T
  : never // 响应式对象

export interface watchOptions extends watchEffectOptions {
  deep?: boolean
  immediate?: boolean
}

export type watchFnTypes = (onCleanup?) => void

export function watchEffect(source: watchFnTypes, options: watchEffectOptions = {}) {
  return doWatch(source, null, options)
}

// watchPostEffect就是watchEffect的options传递了post
export function watchPostEffect(source: watchFnTypes, options: watchEffectOptions = {}) {
  return doWatch(source, null, extend({}, options, { flush: 'post' }))
}

// watchSyncEffect就是watchEffect的options传递了sync
export function watchSyncEffect(source: watchFnTypes, options: watchEffectOptions = {}) {
  return doWatch(source, null, extend({}, options, { flush: 'sync' }))
}
type vtype = (...arg) => void
function doWatch(source: any, fn: vtype | null, options: watchOptions) {
  let oldVal, newVal

  const job = () => {
    if (fn) {
      newVal = effect.run()
      fn(newVal, oldVal, onCleanup)
      // 将新的value赋值给oldVal作为旧值
      oldVal = newVal
    } else {
      effect.run()
    }
  }

  let scheduler: (...arg) => void
  if (options.flush === 'post') {
    scheduler = scheduler = () => {
      queuePosstFlushCb(job)
    }
  } else if (options.flush === 'sync') {
    scheduler = job
  } else {
    // pre需要放在最后，因为用户不传和主动传递pre都是走这里
    scheduler = () => {
      queuePreFlushCb(job)
    }
  }
  let cleanup
  // 这个clearup函数就是用户调用的onCleanup,用户在调用这个函数的时候会传递一个函数，用于做用户属于自己的操作，他会在每次watchEffect执行的时候先执行一次(不包括第一次,第一次是默认执行的)
  const onCleanup = (cb) => {
    cleanup = () => {
      // console.log('Calls the function passed in by the user')
      cb()
    }
  }
  let getter

  getter = () => {
    if (cleanup) {
      cleanup()
    }
    // fn有值说明是watch调用的dowatch
    if (fn) {
      if (isRef(source)) {
        return source.value
      } else if (isReactive(source)) {
        const res = traverse(source)
        options.deep = true //当传递一个reactive的时候默认开启深度模式
        return res
      } else if (isFunction(source)) {
        return source()
      }
    } else {
      // 否则的话就是watchEffect调用的dowatch
      source(onCleanup)
    }
  }

  if (options.deep && fn) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  const effect = new EffectDepend(getter, scheduler)

  //当用户没有传入fn的时候，代表用户使用的是watchEffect 执行一次用户传入的source  watchEffect是会默认执行一次的
  // 当用户传入的时候，说明使用的是watch 它在immediate为false的时候是不需要执行一次的
  if (fn) {
    // 这里需要清楚，watch既然不执行，那他下次执行的时候就是依赖发生变化的时候，如果依赖发生变化，用户就需要拿到一个旧值，这个旧值(oldVal)不就是getter函数的返回值(这里需要考虑的情况有点多，我这里进行笼统的概括)
    // watch的第一个依赖集合(source)可以使多种类型的，比如说ref、reactive、function、甚至是一个Array，区分类型是在getter里面区分好了，我们在这里只需要确定: 我这里执行getter 就能拿到对应类型的返回值
    if (options.immediate) {
      job()
    } else {
      oldVal = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}

export function watch<T>(source: WatchSourceType, fn, WatchSource: watchOptions = {}) {
  return doWatch(source, fn, WatchSource)
}

// 递归访问注册依赖
export function traverse(value, seen?) {
  if (!isObject(value)) {
    return value
  }
  seen = seen || new Set()
  if (seen.has(value)) {
    return value
  }
  seen.add(value)
  if (isRef(value)) {
    traverse(value, seen)
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (Object.prototype.toString.call(value)) {
    for (const key in value) {
      traverse(value[key], seen)
    }
    // TODO  map  set object
  }

  return value
}
