import { reactive, readonly, isReadonly, isReactive, isProxy } from '../reactive'

describe('readonly', () => {
  it('readonly not set', () => {
    let original = {
      foo: {
        fuck: {
          name: 'what'
        }
      },
      arr: [{ color: '#fff' }]
    }
    let warper = readonly(original)
    expect(warper).not.toBe(original)
    expect(isReadonly(warper)).toBe(true)
    expect(isReadonly(original)).toBe(false)
    // 测试嵌套对象的reactive状态
    expect(isReadonly(warper.foo.fuck)).toBe(true)
    // expect(isReadonly(warper.foo.fuck.name)).toBe(true)
    // 因为name是一个基本类型所以isObject会是false，暂时对name生成不了readonly，涉及到往后的知识点 isRef
    expect(isReadonly(warper.arr)).toBe(true)
    expect(isReadonly(warper.arr[0])).toBe(true)
    expect(isProxy(warper)).toBe(true)
    expect(warper.foo.fuck.name).toBe('what')
  })

  it('warning when it be call set operation', () => {
    let original = {
      username: 'ghx'
    }
    let readonlyObj = readonly(original)
    const warn = jest.spyOn(console, 'warn')
    // 给readonly做set操作，将会得到一个warning
    // readonlyObj.username = "danaizi";
    // expect(warn).toHaveBeenCalled();
  })

  it('nested reactive', () => {
    let original = {
      foo: {
        name: 'ghx'
      },
      arr: [{ age: 23 }]
    }
    const nested = reactive(original)
    expect(isReactive(nested.foo)).toBe(true)
    expect(isReactive(nested.arr)).toBe(true)
    expect(isReactive(nested.arr[0])).toBe(true)
    expect(isReactive(nested.foo)).toBe(true)
    // expect(isReactive(nested.foo.name)).toBe(true)  // 涉及到往后的知识点 isRef
  })
})
