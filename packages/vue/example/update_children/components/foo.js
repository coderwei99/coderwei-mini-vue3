import { h, ref } from '../../../lib/vue3.esm.js'

export default {
  name: 'foo',
  setup() {
    console.log('foo 的setup执行');

    return {
    }
  },
  render() {
    return h('div', {}, 'foo')
  },
}