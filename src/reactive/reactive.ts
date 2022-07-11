import { track, trigger } from "./effect";

import { createReactiveObject } from "./baseHandlers";

export function createGetter<T extends object>(isReadonly = false) {
  return function get(target: T, key: string | symbol) {
    const res = Reflect.get(target, key);
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    if (!isReadonly) {
      // track
      track(target, key);
    }
    return res;
  };
}

export function createSetter<T extends object>() {
  return function set(target: T, key: string | symbol, val: any) {
    const res = Reflect.set(target, key, val);
    trigger(target, key);
    return res;
  };
}

// reactive响应式对象的handle捕获器
export const mutableHandlers: ProxyHandler<object> = {
  get: createGetter(),
  set: createSetter(),
};

// readonly只读对象的handle捕获器
export const readonlyHandlers: ProxyHandler<object> = {
  get: createGetter(true),
  set(target, key, val) {
    console.warn(
      `${target} do not set ${String(key)} value ${val}, because it is readonly`
    );

    return true;
  },
};

// reactive 对象
export function reactive<T extends object>(raw: T) {
  return createReactiveObject<T>(raw, mutableHandlers);
}

//readonly对象
export function readonly<T extends object>(raw: T) {
  return createReactiveObject<T>(raw, readonlyHandlers);
}

// 统一管理isReadonly&isReactive状态
export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

// 为value类型做批注，让value有属性可选，必选使用的时候提示value没有xxx属性
export interface ITarget {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_REACTIVE]?: boolean;
}

// 判断是否是一个只读对象
export function isReadonly<T extends object>(value: unknown) {
  return !!(value as ITarget)[ReactiveFlags.IS_READONLY];
}

// 判断是否是一个响应式对象
export function isReactive<T extends object>(value) {
  return !!(value as ITarget)[ReactiveFlags.IS_REACTIVE];
}
