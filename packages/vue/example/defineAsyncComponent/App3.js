import {h,defineAsyncComponent} from '../../lib/vue3.esm.js'
import Child from './asyncComponent.js'
import Loading from './defaultPlaceholder.js'
import ErrorComponent from './Error.js'
// 当timeout 超时后 渲染错误组件，然后网络请求成功了，能够请求下来异步组件的时候，又会渲染异步组件，按道理来说异步组件就不渲染了。
export default {
  name:"App",
  setup(){
    return {}
  },
  
  render(){
    const fetchComponent  = () =>{
      return new Promise((resolve,reject) =>{
        setTimeout(() =>{
            console.log('请求成功');
            resolve(Child)
        },5000)
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