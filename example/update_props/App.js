import { h, ref } from '../../lib/vue3.esm.js'


export default {
  name: 'app',
  setup() {
    let colors = ref('red')
    const count = ref(0)
    const click = () => {
      colors.value = '1'
      console.log(colors);
      count.value++
      console.log(count);

    }
    return {
      count,
      click,
      colors
    }
  },
  render() {
    return h('div', { class: this.colors }, [
      h('p', {}, `count: ${this.count}`),
      h('button', { onClick: this.click }, '点击更新'),
    ])
  },
}