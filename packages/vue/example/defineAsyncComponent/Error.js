import { effect, h,toRef } from "../../lib/vue3.esm.js"

export default {
  name:"ErrorComponent",
  setup(props){
    console.log(props.error.message,'props');
    let message = toRef(props,'error'); 
    return {
      message
    }
  },
  render(props){
    // return h('div',{},this.message.message)
    return h('div',{},'error component')
  }
}