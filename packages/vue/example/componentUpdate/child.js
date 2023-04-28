import {
  h,
  ref,
  onBeforeMount,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onBeforeUpdate,
} from '../../lib/vue3.esm.js'

export default {
  name: "Child",
  setup(props, { emit }) { 

    onMounted(() => {
      console.log('children onMounted is call ');
    })
    onUpdated(() => {
      console.log('children onUpdated is call ');
    })
    onBeforeMount(() => {
      console.log('children onBeforeMount is call ');
    })
    onBeforeUpdate(() => {
      console.log('children onBeforeUpdate is call ');
    })
    onBeforeUnmount(() => {
      console.log('children onBeforeUnmount is call ');
    })
    onUnmounted(() => {
      console.log('children onUnmounted is call ');
    })

  },
  render(proxy) {
    return h("div", {}, h("div", {}, "child" + this.$props.msg));
  },
};