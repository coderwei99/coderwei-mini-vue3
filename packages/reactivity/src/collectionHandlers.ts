import { enableTracking, ITERATE_KEY, pauseTracking, track, trigger, TriggerType } from './effect'
import { ReactiveFlags } from './reactive'

const mutableInstrumentations = {
  add(key) {
    const target = this[ReactiveFlags.IS_RAW]
    // 因为Set不会出现重复的元素 所以如果开发者传入了相同的项 就没必要重新触发依赖了
    const hasKey = target.has(key)
    const res = target.add(key)
    if (!hasKey) {
      trigger(target, key, TriggerType.ADD)
    }
    return res
  },
  delete(key) {
    const target = this[ReactiveFlags.IS_RAW]
    const res = target.delete(key)
    trigger(target, key, TriggerType.DELETE)
    return res
  }
}

function createInstrumentationGetter(isReadonly, isShallow) {
  return (target, key, receiver) => {
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return isShallow
    } else if (key === ReactiveFlags.IS_RAW) {
      return target
    }

    // 如果是Set 访问size属性
    if (key === 'size') {
      track(target, ITERATE_KEY)
      return Reflect.get(target, 'size', target)
    }
    return mutableInstrumentations[key]
  }
}

// 集合类型的handles Set Map WeakMap WeakSet
export const mutableCollectionHandlers = {
  get: createInstrumentationGetter(false, false),
  set() {}
}
