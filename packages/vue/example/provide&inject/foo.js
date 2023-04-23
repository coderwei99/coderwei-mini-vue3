import { h, renderSlot, getCurrentInstance } from '../../lib/vue3.esm.js'
export default {
  name: "Foo",
  render() {
    const foo = h('p', {}, '原本就在Foo里面的元素')
    return h('div', {}, [foo])
  },
  setup(props, { emit }) {

    console.log('当前组件实例', getCurrentInstance());
    return {
    }
  }
}

