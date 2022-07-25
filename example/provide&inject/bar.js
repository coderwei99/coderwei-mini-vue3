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
    const foo = inject('foo1', '默认值')
    const bar = inject('bar')
    const bar1 = inject('bar1', () => '函数默认值')
    console.log('foo1', foo);
    console.log('bar1', bar1);
    return {
    }
  }
}

