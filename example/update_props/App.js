import { h, ref } from '../../lib/vue3.esm.js'


export default {
  name: 'app',
  setup() {
    const count = ref(0)
    const click = () => {
      count.value++
    }
    return {
      count,
      click,
    }
  },
  render() {
    return h('div', {}, [
      h('p', {}, `count: ${this.count}`),
      h('button', { onClick: this.click }, '点击更新'),
    ])
  },
}