import { enableTracking, pauseTracking } from './effect'
import { ReactiveFlags } from './reactive'

/**
 *
 * @param target 源对象
 * @param handlers get/set等方法
 * @returns
 */

export const arrayInstrumentations = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach((key: string) => {
  const originalIncludes = Array.prototype[key]
  arrayInstrumentations[key] = function (...args: any) {
    let res = originalIncludes.apply(this, args)
    if (!res || res === -1) {
      res = originalIncludes.apply(this![ReactiveFlags.IS_RAW], args)
    }
    return res
  }
})
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach((key: string) => {
  const originalIncludes = Array.prototype[key]
  arrayInstrumentations[key] = function (...args: any) {
    pauseTracking()
    const res = originalIncludes.apply(this, args)
    enableTracking()
    return res
  }
})
