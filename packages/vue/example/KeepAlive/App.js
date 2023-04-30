import { h, ref, KeepAlive } from '../../lib/vue3.esm.js'

import Foo from './components/foo.js'
import Bar from './components/bar.js'
import Child from './components/child.js'
export default {
  name: 'app',
  setup() {
    const count = ref(0)
    window.count = count
    return {
      count
    }
  },
  render() {
    const components = [h(Foo),h(Bar),h(Child)]
    const res = h('div', {},
      h(KeepAlive, {max:2}, components[this.count]),
      // h(KeepAlive, {max:2}, 'undefined'),
    )
    return res
  },
}