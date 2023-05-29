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

export const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach((key: string) => {
  arrayInstrumentations[key] = function (...args: any) {
    const originalIncludes = Array.prototype[key]
    let res = originalIncludes.apply(this, args)
    if (!res || res === -1) {
      res = originalIncludes.apply(this![ReactiveFlags.IS_RAW], args)
    }
    return res
  }
})
