import { h, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from '../../../lib/vue3.esm.js'

export default {
  name: 'child',
  setup() {
    onMounted(() =>{
      console.log('child onMounted is call ');
    })
    onUpdated(() =>{
      console.log('child onUpdated is call ');
    })
    onBeforeMount(() =>{
      console.log('child onBeforeMount is call ');
    })
    onBeforeUpdate(() =>{
      console.log('child onBeforeUpdate is call ');
    })
    onBeforeUnmount(() =>{
      console.log('child onBeforeUnmount is call ');
    })
    onUnmounted(() =>{
      console.log('child onUnmounted is call ');
    })
    return {
    }
  },
  render() {
    return h('div', {}, 'child')
  },
}