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
  setup() {},
  render() {
    return h('div', `age:${this.age}`)
  }
}
