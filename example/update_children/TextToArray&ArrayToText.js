import { h, ref } from '../../lib/vue3.esm.js'


export default {
  name: 'app',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange
    return {
      isChange
    }
  },
  render() {
    return this.isChange ? h('div', {}, "string") : h('div', {}, [
      h('div', {}, 'array')
    ])
  },
}