import { h, renderSlot, createTextVNode } from '../../lib/vue3.esm.js'
export default {
  name: "Foo",
  render() {
    //这里的this指向组件的instance 我们需要在setup函数中做文章，vue官网允许setup函数第二个参数可以使emit 同样也可以是slots  所以
    // 我们需要在内部执行setup函数的时候 将instance下的slot手动传给setup第二个参数  插槽说白了就是一个函数 返回了一个h函数，到这里我们就可以清楚renderSlot函数的职责  就是执行h函数罢了
    const foo = h('p', {}, '原本就在Foo里面的元素')
    return h('div', {}, [renderSlot(this.$slots, 'header', { age: 18 }), foo, renderSlot(this.$slots, 'footer')])
  },
  setup(props, { emit }) {
    return {
    }
  }
}

