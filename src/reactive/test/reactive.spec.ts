import { reactive, toRaw } from '../reactive'

describe('reactive', () => {
  it('happy path', () => {
    let original = { age: 1 }
    let observed = reactive(original)
    expect(original).not.toBe(observed)
    expect(observed.age).toBe(1)
  })

  it('toRaw', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    // 输出的结果必须要等于原始值
    expect(toRaw(observed)).toBe(original)
    expect(toRaw(original)).toBe(original)
  })
  it('nested reactive toRaw', () => {
    const original = {
      foo: {
        name: 'ghx'
      }
    }
    const observed = reactive(original)
    const raw = toRaw(observed)
    expect(raw).toBe(original)
    expect(raw.foo).toBe(original.foo)
  })
})
