import { h, reactive, ref } from '../../lib/vue3.esm.js'
import Foo from './foo.js'
export default {
  render() {
    return h('div', { class: 'red' }, [
      h(
        Foo,
        {
          count: 1,
          onMyemitClick: this.myemitClick
        },
        ''
      )
    ])
  },
  setup() {
    const myemitClick = () => {
      console.log('app接收到foo发射的事件')
    }

    const foo = ref(1)
    const obj = reactive({ foo })
    console.log(obj.foo, '11111111') // 1);

    // 返回对象或者h()渲染函数
    return {
      name: 'hi my app',
      myemitClick
    }
  }
}
