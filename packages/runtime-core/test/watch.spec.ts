import { watchEffect } from '../src/apiWatch'
import { ref } from '@coderwei-mini-vue3/reactive'

describe('watch', () => {
  it('watchEffect', () => {
    const count = ref(1)
    expect(count.value).toBe(1)
  })
})
