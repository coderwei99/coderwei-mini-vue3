import { h, ref } from '../../lib/vue3.esm.js'
import Child from './cpns/Child.js'
export default {
  name: 'App',
  setup() {
    const age = ref(18)
    const handleClick = () => {
      console.log(111)
      age.value++
    }
    return { handleClick, age }
  },
  render() {
    return h('div', {}, [
      h('div', 'text App'),
      h(Child, {
        // 这里会进行了统一的规范: name & age 如果是props 则会在组件内部通过defineProps进行定义  其余的属性统一当做attrs(即不属于props的都会被当成attrs)
        name: 'coderwei',
        age: 19,
        number: this.age,
        cart: 'bar'
      }),
      h('button', { onClick: this.handleClick }, 'add')
    ])
  }
}
