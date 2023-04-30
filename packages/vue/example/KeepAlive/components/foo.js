import { h, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref,onActivated,onDeactivated } from '../../../lib/vue3.esm.js'

export default {
  name: 'foo',
  setup() {
    onMounted(() => {
      console.log('foo onMounted is call ');
    })
    onUpdated(() => {
      console.log('foo onUpdated is call ');
    })
    onBeforeMount(() => {
      console.log('foo onBeforeMount is call ');
    })
    onBeforeUpdate(() => {
      console.log('foo onBeforeUpdate is call ');
    })
    onBeforeUnmount(() => {
      console.log('foo onBeforeUnmount is call ');
    })
    onUnmounted(() => {
      console.log('foo onUnmounted is call ');
    })
    onActivated(() => {
      console.log('foo onActivated');
    })
    onDeactivated(() => {
      console.log('foo onDeactivated');
    })
    return {
    }
  },
  render() {
    return h('div', {}, 'foo')
  },
}