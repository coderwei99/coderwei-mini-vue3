import { h, ref } from '../../lib/vue3.esm.js'

import Foo from './foo.js'
export default {
  name: 'app',
  setup() {
    return {
    }
  },
  render() {
    return h('div', {}, [
      h("div", {}, '主页'),
      h(Foo)
    ])
  },
}