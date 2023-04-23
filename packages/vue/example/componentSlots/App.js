import { h } from '../../lib/vue3.esm.js'
import Foo from './foo.js'
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
      h(Foo, {}, {
        header: ({ age }) => h('p', {}, '我是header slot1--年龄：' + age),
        footer: () => h('p', {}, '我是footer slot1')
      })
    ])
  },
  setup() {
    return {
      name: 'hi my vue',
    }
  }
}

