import { isReactive, isReadonly, shallowReadonly, shallowReactive } from '../src/reactive'

it('shallowReadonly basic test', () => {
  let original = {
    foo: {
      name: 'ghx'
    }
  }
  let obj = shallowReadonly(original)
  expect(isReadonly(obj)).toBe(true)
  // 因为只做表层的readonly，深层的数据还不是proxy
  expect(isReadonly(obj.foo)).toBe(false)
  expect(isReactive(obj)).toBe(false)

  const state = shallowReactive({
    foo: 1,
    nested: {
      bar: 2
    }
  })
  expect(isReactive(state)).toBe(true)
  expect(isReactive(state.nested)).toBe(false) //返回false  因为使用shallowReactive代理不到nested这一层
})
