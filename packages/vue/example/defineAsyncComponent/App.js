import {h,defineAsyncComponent} from '../../lib/vue3.esm.js'
import Child from './asyncComponent.js'
import Loading from './defaultPlaceholder.js'
import ErrorComponent from './Error.js'
export default {
  name:"App",
  setup(){
    return {}
  },
  
  render(){
    let flag =true
    const fetchComponent  = () =>{
      return new Promise((resolve,reject) =>{
        setTimeout(() =>{
          if(flag){
            reject('请求出错啦')
            flag = false
          }else{
            console.log('请求成功');
            resolve(Child)
          }
        },4000)
      })
    }

    const testError = (err, userRetry, userFail, retries ) =>{
      console.log(retries,'次数');
      userRetry()
    }
    const com = defineAsyncComponent({
      loader:fetchComponent,
      loadingComponent:Loading,
      errorComponent:ErrorComponent,
      delay:200,
      timeout:3000,
      onError:testError
    })
    return h(com)
  }
}