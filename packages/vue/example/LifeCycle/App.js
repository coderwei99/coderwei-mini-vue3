import { h, ref } from '../../lib/vue3.esm.js'

import Foo from './components/foo.js'
import Bar from './components/bar.js'
import ComponentToComponent from './components/index.js'
export default {
  name: 'app',
  setup() {
    const isChange = ref(true)
    const count =ref(1)
    window.isChange = isChange
    return {
      isChange,
      count
    }
  },
  render() {
    const res =  h('div', {}, 
     [
      h("div", {
        onClick:function(){
          window.isChange.value = !window.isChange.value
          console.log(window.isChange.value);
        }
      }, '主页'),
      h('div', {}, this.isChange ? h(Foo) : h(Bar)),
      h('div', {}, this.count),
      h('div', {}, '213')
    ]
    )
    // const res = h(ComponentToComponent)
    return res
  },
}