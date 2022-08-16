import { h, ref } from '../../lib/vue3.esm.js'


export default {
  name: 'app',
  setup() {
    const isChange = ref(true)
    window.isChange = isChange
    return {
      isChange
    }
  },
  render() {
    return this.isChange ? h('div', {}, [
      h('div', {}, 'new array'),
      h('div', {}, 'new array'),
    ]) : h('div', {}, [
      h('div', {}, 'old array'),
      h('div', {}, 'old array'),
    ])
  },
}