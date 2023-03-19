import { h, reactive, ref, effect, stop } from '../../lib/vue3.esm.js'

export default {
  render() {
    return h('div', {
      id: 'root',
      class: ['flex', 'container-r'],
      onClick: this.aclick
    }, [
      h('p', { class: 'red' }, 'hello'),
      h('p', { class: 'blue' }, ` ${this.wei.age}`),
    ])
  },
  setup() {
    // 返回对象或者h()渲染函数
    let wei = reactive({
      age: 18
    })
    let age;
    const runner = effect(() => {
      age = wei.age
    })

    const aclick = () => {
      debugger
      wei.age++

      // console.log(wei.age);
      // console.log(age);
      stop(runner)

    }

    return {
      name: 'hi my app',
      wei,
      aclick
    }
  }
}

