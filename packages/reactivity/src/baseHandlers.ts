import { ReactiveFlags } from './reactive'

/**
 *
 * @param target 源对象
 * @param handlers get/set等方法
 * @returns
 */
export function createReactiveObject<T extends object>(target: T, handlers) {
  return new Proxy(target, handlers)
}

export const arrayInstrumentations = {
  includes: function (...args: any) {
    const originalIncludes = Array.prototype['includes']
    let res = originalIncludes.apply(this, args)
    if (!res) {
      res = originalIncludes.apply(this[ReactiveFlags.IS_RAW], args)
    }
    return res
  }
}
