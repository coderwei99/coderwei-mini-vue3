// 在 render 中使用 proxy 调用 emit 函数
// 也可以直接使用 this
// 验证 proxy 的实现逻辑
import { h, ref,watchEffect,watch ,reactive} from '../../lib/vue3.esm.js'


export default {
  name: "App",
  setup() {
    let count = ref(1);
    let p =document.querySelector('#app')
    const changeCount = () => {
      // p = 
      // count.value++
      info.age++
    }
    watchEffect(() =>{
      count.value
      console.log('watchEffect is call',p?.innerHTML);
    },{
      flush:'post'
    })

    let info =  reactive({
      age:19
    })
    debugger
    watch(()=>info.age,() =>{
      console.log('watch is be call');
    })

    return {
      count,
      info,
      changeCount,
    };
  },

  render() {
    return h("div", {}, [
      h('p', {}, `count:${this.info.age}`),
      h('button', { onClick: this.changeCount }, `addBtn`)
    ]);
  },
};