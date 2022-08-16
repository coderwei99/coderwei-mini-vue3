import { h, ref } from '../../lib/vue3.esm.js'


export default {
  name: 'app',
  setup() {
    let colors = ref('red')
    let _foo = ref('_foo')
    const count = ref(0)
    const click = () => {
      // colors.value = "change"
      count.value++
    }
    const removeClass = () => {
      colors.value = undefined
    }

    const removeFoo = () => {
      _foo.value = undefined
    }
    return {
      count,
      click,
      colors,
      removeClass,
      removeFoo,
      _foo
    }
  },
  render() {
    return h('div', { class: this.colors, foo: this._foo }, [
      h('p', {}, `count: ${this.count}`),
      h('button', { onClick: this.click }, '点击更新'),
      h('button', { onClick: this.removeClass }, '点击移除class'),
      h('button', { onClick: this.removeFoo }, '点击移除foo'),
    ])
  },
}