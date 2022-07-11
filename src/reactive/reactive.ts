import { track, trigger } from "./effect";

import { createReactiveObject } from "./baseHandlers";

// reactive响应式对象的handle捕获器
export const mutableHandlers: ProxyHandler<object> = {
  get(target, key: string | symbol) {
    const res = Reflect.get(target, key);
    // 收集依赖
    track(target, key);
    return res;
  },
  set(target, key: string | symbol, val: any) {
    const res = Reflect.set(target, key, val);
    // 触发依赖
    trigger(target, key);
    return res;
  },
};

// readonly只读对象的handle捕获器
export const readonlyHandlers: ProxyHandler<object> = {
  get(target, key) {
    return Reflect.get(target, key);
  },
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
