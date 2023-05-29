import { isObject } from '@coderwei-mini-vue3/shared'
import { enableTracking, ITERATE_KEY, pauseTracking, track, trigger, TriggerType } from './effect'
import { reactive, ReactiveFlags } from './reactive'

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
    const hasKey = target.has(key)
    const res = target.delete(key)
    //只有存在这个key的时候再去触发依赖  开发者随便删除一个不存在的元素 是不需要触发依赖的
    if (hasKey) {
      trigger(target, key, TriggerType.DELETE)
    }
    return res
  },
  // Map function
  get(key) {
    const target = this[ReactiveFlags.IS_RAW]
    const res = target.get(key)
    track(target, key)
    return isObject(res) ? reactive(res) : res
  },
  set(key, value) {
    const target = this[ReactiveFlags.IS_RAW]
    const hasKey = target.has(key)
    const rawVal = value[ReactiveFlags.IS_RAW] || value
    target.set(key, rawVal)
    if (hasKey) {
      // 如果key存在 说明是修改操作
      trigger(target, key, TriggerType.SET, value)
    } else {
      // 不存在是新增操作 新增会影响size属性的 要触发size的依赖
      trigger(target, key, TriggerType.ADD, value)
    }
    return this
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
