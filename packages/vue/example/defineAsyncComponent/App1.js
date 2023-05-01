import {h,defineAsyncComponent} from '../../lib/vue3.esm.js'
import Child from './asyncComponent.js'
import Loading from './defaultPlaceholder.js'
import ErrorComponent from './Error.js'
export default {
  name:"App",
  setup(){
    return {}
  },
  // 三秒的超时时间，超时后 先渲染错误组件  然后再过一秒 网络请求回来了  是失败的状态  也无所谓  内部会重新渲染这个component组件 (update 更新的操作) 保证最终传给用户定义的异步组件内部的props.error是网络请求失败的原因
  render(){
    const fetchComponent  = () =>{
      return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            reject('请求出错啦')
        },4000)
      })
    }

    const com = defineAsyncComponent({
      loader:fetchComponent,
      loadingComponent:Loading,
      errorComponent:ErrorComponent,
      delay:200,
      timeout:3000,
    })
    return h(com)
  }
}