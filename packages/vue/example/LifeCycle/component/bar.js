import { h, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from '../../../lib/vue3.esm.js'

export default {
  name: 'bar',
  setup() {
    onMounted(() =>{
      console.log('bar onMounted is call ');
    })
    onUpdated(() =>{
      console.log('bar onUpdated is call ');
    })
    onBeforeMount(() =>{
      console.log('bar onBeforeMount is call ');
    })
    onBeforeUpdate(() =>{
      console.log('bar onBeforeUpdate is call ');
    })
    onBeforeUnmount(() =>{
      console.log('bar onBeforeUnmount is call ');
    })
    onUnmounted(() =>{
      console.log('bar onUnmounted is call ');
    })
    return {
    }
  },
  render() {
    return h('div', {}, 'bar')
  },
}