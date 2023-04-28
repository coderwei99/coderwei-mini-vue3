import { h, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from '../../../lib/vue3.esm.js'

export default {
  name: 'foo',
  setup() {
    onMounted(() =>{
      console.log('onMounted is call ');
    })
    onUpdated(() =>{
      console.log('onUpdated is call ');
    })
    onBeforeMount(() =>{
      console.log('onBeforeMount is call ');
    })
    onBeforeUpdate(() =>{
      console.log('onBeforeUpdate is call ');
    })
    onBeforeUnmount(() =>{
      console.log('onBeforeUnmount is call ');
    })
    onUnmounted(() =>{
      console.log('onUnmounted is call ');
    })
    return {
    }
  },
  render() {
    return h('div', {}, 'foo')
  },
}