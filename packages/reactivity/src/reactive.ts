import { ITERATE_KEY, track, trigger, TriggerType } from './effect'

import { createReactiveObject } from './baseHandlers'

import { isArray, isObject } from '@coderwei-mini-vue3/shared'

/**
 *
 * @param isReadonly 是否为只读对象
 * @param isShallow 是否为shallowReadonly对象
 * @returns
 */
export function createGetter<T extends object>(isReadonly = false, isShallow = false) {
  return function get(target: T, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    } else if (key === ReactiveFlags.IS_RAW) {
      return target
    }

    // 只读对象不需要收集依赖
    if (!isReadonly) {
      track(target, key)
    }

    //  判断是否为嵌套对象 如果是嵌套对象并且isShallow为默认值false  根据isReadonly判断递归调用readonly还是reactive
    if (isObject(res) && !isShallow) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

export function createSetter<T extends object>() {
  return function set(target: T, key: string | symbol, val: any, receiver: object) {
    // 判断当前是新增属性还是修改属性
    const type = isArray(target)
      ? Number(key) < target.length
        ? TriggerType.SET
        : TriggerType.ADD
      : Object.prototype.hasOwnProperty.call(target, key)
      ? TriggerType.SET
      : TriggerType.ADD
    let oldValue = target[key]
    const res = Reflect.set(target, key, val, receiver)
    if (receiver[ReactiveFlags.IS_RAW] === target) {
      // 排除NaN的情况
      if (oldValue !== val && (oldValue === oldValue || val === val))
        trigger(target, key, type, val)
    }
    return res
  }
}

export function createHas() {
  return function (target, key) {
    track(target, key)
    return Reflect.has(target, key)
  }
}

export function createOwnKeys() {
  return function (target) {
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
}

export function createDeleteProperty() {
  return function (target, key) {
    const res = Reflect.deleteProperty(target, key)
    trigger(target, key, TriggerType.DELETE)
    return res
  }
}

// 执行一次createGetter/createSetter函数，避免每次调用一次
const get = createGetter()
const set = createSetter()
const has = createHas()
const ownKeys = createOwnKeys()
const deleteProperty = createDeleteProperty()
const readonlyGet = createGetter(true)

// reactive响应式对象的handle捕获器
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  has,
  ownKeys,
  deleteProperty
}

// readonly只读对象的handle捕获器
export const readonlyHandlers: ProxyHandler<object> = {
  get: readonlyGet,
  set(target, key, val) {
    console.warn(`${target} do not set ${String(key)} value ${val}, because it is readonly`)

    return true
  }
}

// reactive 对象
export function reactive<T extends object>(raw: T) {
  return createReactiveObject<T>(raw, mutableHandlers)
}

//readonly对象
export function readonly<T extends object>(raw: T) {
  return createReactiveObject<T>(raw, readonlyHandlers)
}

// 统一管理isReadonly&isReactive状态
export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  IS_RAW = '__v_raw'
}

// 为value类型做批注，让value有属性可选，必选使用的时候提示value没有xxx属性
export interface ITarget {
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.IS_RAW]?: unknown
}

// 判断是否是一个只读对象
export function isReadonly<T extends object>(value: unknown) {
  return !!(value as ITarget)[ReactiveFlags.IS_READONLY]
}

// 判断是否是一个响应式对象
export function isReactive<T extends object>(value: unknown) {
  return !!(value as ITarget)[ReactiveFlags.IS_REACTIVE]
}

// 判断是否是一个shallow对象
export function isShallow(value: unknown) {
  return !!(value as ITarget)[ReactiveFlags.IS_SHALLOW]
}

// 检查对象是否是由 reactive 或 readonly 创建的 proxy。
export function isProxy(value: unknown) {
  return isReactive(value) || isReadonly(value)
}

// toRaw方法
export function toRaw(value) {
  const raw = value && (value as ITarget)[ReactiveFlags.IS_RAW]
  return raw ? raw : value
}

// 定义shallowReadonly的handlers
export const shallowReadonlyHandlers: ProxyHandler<Object> = {
  get: createGetter(true, true),
  set(target, key, val) {
    console.warn(`${target} do not set ${String(key)} value ${val}, because it is readonly`)

    return true
  }
}

// shallowReadonly的实现
export function shallowReadonly<T extends object>(value: T) {
  return createReactiveObject(value, shallowReadonlyHandlers)
}

// 定义shallowReactive的handlers
export const shallowReactiveHandlers: ProxyHandler<Object> = {
  get: createGetter(false, true),
  set
}

// shallowReactive的实现
export function shallowReactive<T extends object>(value: T) {
  return createReactiveObject(value, shallowReactiveHandlers)
}
