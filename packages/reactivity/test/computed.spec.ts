import { computed } from '../src/computed'
import { reactive } from '../src/reactive'
import { vi } from 'vitest'

describe('computed', () => {
  it('should return updated value', () => {
    const value = reactive({ foo: 1 })
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(1)
  })

  it('should compute lazily', () => {
    const value = reactive({ foo: 1 }) // 创建一个reactive对象
    const getter = vi.fn(() => value.foo) // 通过vi.fn()创建一个模拟函数，后续会检测被调用该函数次数
    const cValue = computed(getter) // 创建一个computed对象，并传入getter函数

    // lazy功能
    expect(getter).not.toHaveBeenCalled() // 因为还没触发cValue的get操作，所以getter是不会被调用的。

    expect(cValue.value).toBe(1) // cValue的get操作被触发，getter执行
    expect(getter).toHaveBeenCalledTimes(1) // getter被调用一次
    // 缓存功能
    // should not compute again
    cValue.value // cValue的get操作被触发，又因为value.foo并没有发生改变
    expect(getter).toHaveBeenCalledTimes(1) // 这里的getter还是被调用了一次

    // should not compute until needed
    value.foo = 2 // 这里的value.foo发生了改变，但是cValue的get操作还没被触发
    expect(getter).toHaveBeenCalledTimes(1) // 所以这里getter仍然只会被调用一次

    // now it should compute
    expect(cValue.value).toBe(2) // 这里的cValue的get操作被触发，getter执行
    expect(getter).toHaveBeenCalledTimes(2) // 这里getter被调用了两次
    // should not compute again
    cValue.value // cValue的get操作被触发，又因为value.foo并没有发生改变
    expect(getter).toHaveBeenCalledTimes(2) // 这里的getter还是被调用了两次
  })
})
