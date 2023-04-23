import { h, ref, getCurrentInstance, nextTick } from "../../lib/vue3.esm.js"

export default {
  setup() {
    const count = ref(1)
    const instance = getCurrentInstance()
    const click = () => {
      for (let i = 0; i < 100; i++) {
        count.value++
      }
      nextTick(() => {
        console.log(instance, 'instance');
      })
    }
    return {
      count,
      click
    }
  },
  render() {
    return h('div', {}, [
      h('div', {}, `count:${this.count}`),
      h('button', { onClick: this.click }, 'button'),
    ])
  },
}