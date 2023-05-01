import {h,defineAsyncComponent} from '../../lib/vue3.esm.js'
import Child from './asyncComponent.js'
import Loading from './defaultPlaceholder.js'
import ErrorComponent from './Error.js'
// 异步组件去请求已经失败了 超时的功能就没意义了  内部就不需要在继续计算超时的状态了
export default {
  name:"App",
  setup(){
    return {}
  },
  
  render(){
    const fetchComponent  = () =>{
      return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            reject('请求出错啦')
        },3000)
      })
    }

    const com = defineAsyncComponent({
      loader:fetchComponent,
      loadingComponent:Loading,
      errorComponent:ErrorComponent,
      delay:200,
      timeout:5000,
    })
    return h(com)
  }
}