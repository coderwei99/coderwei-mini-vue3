import { h, ref } from '../../lib/vue3.esm.js'

import TextToText from './TextToText.js'
import TextToArray from './TextToArray&ArrayToText.js'
import ArrayToArray from './ArrayToArray.js'
import ComponentToComponent from './components/index.js'
export default {
  name: 'app',
  setup() {
    return {
    }
  },
  render() {
    const res =  h('div', {}, [
      h("div", {
        onClick:function(){
          window.isChange.value = !window.isChange.value
          console.log(123);
        }
      }, '主页'),
      // h(TextToText)
      h(TextToArray),
      // h(ArrayToArray)
      h(ComponentToComponent),
    ])
console.log(res,'res');
    return res
  },
}