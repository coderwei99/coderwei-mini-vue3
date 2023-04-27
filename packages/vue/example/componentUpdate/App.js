// 在 render 中使用 proxy 调用 emit 函数
// 也可以直接使用 this
// 验证 proxy 的实现逻辑
import { h, ref,onBeforeMount,onMounted,
  onUpdated,
  onBeforeUpdate, } from '../../lib/vue3.esm.js'

import Child from "./Child.js";

export default {
  name: "App",
  setup() {
    const msg = ref("123");
    let count = ref(1);
    window.msg = msg

    const changeChildProps = () => {
      msg.value = "456";
    };

    const changeCount = () => {
      count.value++
    }
    onMounted(() => {
      console.log('挂载完成');
    })
    onUpdated(() => {
      console.log('更新完成');
    })
    onBeforeMount(() =>{
      console.log('挂载前');
    })
    onBeforeUpdate(() => {
      console.log('更新前');
    })

    return {
      msg,
      count,
      changeChildProps,
      changeCount,
    };
  },

  render() {
    return h("div", {}, [
      h("div", {}, "你好"),
      h(
        "button",
        {
          onClick: this.changeChildProps,
        },
        "change child props"
      ),
      h(Child, {
        msg: this.msg,
      }),
      h('p', {}, `count:${this.count}`),
      h('button', { onClick: this.changeCount }, `addBtn`)
    ]);
  },
};