import { h, ref } from '../../../lib/vue3.esm.js'

export default {
  name: 'bar',
  setup() {
    console.log('bar 的setup执行');
    return {
    }
  },
  render() {
    return h('div', {}, 'bar')
  },
}