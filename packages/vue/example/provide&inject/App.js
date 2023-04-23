import { h, provide } from '../../lib/vue3.esm.js'
import Bar from './bar.js'
export default {
  name: 'App',
  render() {
    return h('div', {
      id: 'root',
      class: ['flex', 'container-r'],
    }, [
      h('p', {
        class: 'red'
      }, 'red'),
      h('p', {
        class: 'blue'
      }, this.name),
      h(Bar, {}, [
      ])
    ])
  },
  setup() {
    provide('foo', 'fooVal')
    provide('bar', 'barVal')
    return {
      name: 'hi my vue',
    }
  }
}

