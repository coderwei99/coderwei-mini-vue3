// 在 render 中使用 proxy 调用 emit 函数
// 也可以直接使用 this
// 验证 proxy 的实现逻辑
import { h, ref,watchEffect } from '../../lib/vue3.esm.js'


export default {
  name: "App",
  setup() {
    let count = ref(1);
    let p =document.querySelector('#app')
    const changeCount = () => {
      // p = 
      count.value++
    }
    watchEffect(() =>{
      count.value
      console.log('watchEffect is call',p?.innerHTML);
    },{
      flush:'post'
    })

    return {
      count,
      changeCount,
    };
  },

  render() {
    return h("div", {}, [
      h('p', {}, `count:${this.count}`),
      h('button', { onClick: this.changeCount }, `addBtn`)
    ]);
  },
};