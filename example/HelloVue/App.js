import { h } from '../../lib/vue3.esm.js'

export default {
  render() {
    return h('div', {
      id: 'root',
      class: ['flex', 'container-r']
    }, [
      h('p', { class: 'red' }, 'hello'),
      h('p', { class: 'blue' }, 'my vue'),
    ])
  },
  setup() {
    // 返回对象或者h()渲染函数
    return {
      name: 'hi my app'
    }
  }
}

