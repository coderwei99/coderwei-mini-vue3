import { h, inject, provide } from '../../lib/vue3.esm.js'
import Foo from './foo.js'
export default {
  name: "bar",
  render() {
    return h(Foo, {}, [])
  },
  setup(props, { emit }) {
    provide('foo', 'fooVal-bar')
    provide('bar', 'barVal-bar')
    const foo = inject('foo')
    const bar = inject('bar')
    console.log('foo', foo);
    console.log('bar', bar);
    return {
    }
  }
}

