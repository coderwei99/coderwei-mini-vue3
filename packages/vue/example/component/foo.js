import { h } from '../../lib/vue3.esm.js'

export default {
  render() {
    return h('div', {
      onClick: this.myClick
    }, 'foo' + this.count)
  },
  setup(props, { emit }) {
    const myClick = () => {
      console.log('Foo - click');

      emit("myemitClick", props.count)
    }
    console.log('foo--- props', props);
    props.count++ //不允许操作的   控制度应该提示props是只读属性
    console.log('foo--- props', props);
    return {
      myClick
    }
  }
}

