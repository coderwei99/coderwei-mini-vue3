import { h } from '../../../lib/vue3.esm.js'
export default {
  name: 'child',
  props: {
    name: {
      type: String,
      default: 'coder'
    },
    age: {
      type: Number
    }
  },
  setup(props, ctx) {
    const handleClick = () => {
      console.log(ctx.attrs.number)
    }
    return {
      handleClick
    }
  },
  render() {
    return h(
      'div',
      {},
      h('div', `age:${this.age}`),
      h('button', { onClick: this.handleClick }, 'add3')
    )
  }
}
