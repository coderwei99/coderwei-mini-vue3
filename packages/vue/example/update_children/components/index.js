import Foo from './foo.js'
import Bar from './bar.js'
import { h, ref } from '../../../lib/vue3.esm.js'


export default {
  name: 'componetToComponent',
  setup() {
    const isChange = window.isChange
    return {
      isChange
    }
  },
  render() {
    console.log('被重新执行咯',this.isChange);
    return this.isChange ? h(Foo,{},'') : h(Bar,{},'')
  },
}