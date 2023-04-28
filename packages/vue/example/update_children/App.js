import { h, ref } from '../../lib/vue3.esm.js'

import TextToText from './TextToText.js'
import TextToArray from './TextToArray&ArrayToText.js'
import ArrayToArray from './ArrayToArray.js'
import Foo from './components/foo.js'
import Bar from './components/bar.js'
import ComponentToComponent from './components/index.js'
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
    const res =  h('div', {}, 
      h("div", {
        onClick:function(){
          window.isChange.value = !window.isChange.value
          console.log(window.isChange.value);
        }
      }, '主页'),
      // h(TextToText)
      // h(TextToArray),
      h(ArrayToArray)
      // h(ComponentToComponent),
      // h('div', {}, this.isChange ? h(Foo) : h(Bar))
    )
    // const res = h(ComponentToComponent)
console.log(res,'res');
    return res
  },
}