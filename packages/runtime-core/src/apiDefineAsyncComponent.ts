import { ref } from '@coderwei-mini-vue3/reactivity'
import { isFunction } from '@coderwei-mini-vue3/shared'
import { h } from './h'
import { createVNode } from './vnode'

export type AsyncComponentLoader<T = any> = () => Promise<T>

interface AsyncComponentOptions {
  loader: AsyncComponentLoader
  loadingComponent?: any
  errorComponent?: any
  delay?: number
  timeout?: number
  suspensible?: boolean
  onError?: (error: Error, retry: () => void, fail: () => void, attempts: number) => any
}

export function defineAsyncComponent(option: AsyncComponentOptions | AsyncComponentLoader) {
  // 处理兼容性 用户可能只是需要最为基础的异步组件的功能而已 不需要超时、错误组件等等
  if (isFunction(option)) {
    // 如果是一个函数 就说明用户直接传入了一个loader加载函数
    option = {
      loader: option as AsyncComponentLoader
    }
  }
  const { loader } = option as AsyncComponentOptions
  console.log(loader)
  // debugger
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      // 定义异步组件实例
      let instance
      // 标志的异步组件是否加载完成
      let loaded = ref(false)
      loader().then((c) => {
        debugger
        instance = c
        loaded.value = true
      })

      /*
       定义默认的占位符 用户可能不传入加载异步组件中使用的组件 那么我们下面返回出去的函数(也就是render函数)在执行的时候就拿到一个undefined作为子树 去进行渲染 会导致拿不到shapeFlag等属性的错误
       简而言之 render函数一定要保证返回出去一个虚拟节点 
       重点: 异步组件本质就是先渲染一个组件 等这个组件回来的时候我拿着这个组件的实例和一开始默认组件进行patch操作  本质是更新 并不是说等异步组件来了 直接进行挂载的操作 我们用的ref定义的布尔值 等异步组件
       回来的时候 我们修改这个响应式数据  他就会触发视图的更新(或者说重新执行render函数)然后会返回拿到的异步组件出去进行渲染
       */
      const defaultPlaceholder = h('div', {}, 'loading...')
      /* 
        这里为什么要返回一个函数? 目前我们通过defineAsyncComponent定义的组件 是没有render函数的  
        component文件中的handleSetupResult处理函数是处理setup返回值的 那里我们就已经定义了 如果setup函数返回的是一个函数 那么就作为当前组件的render函数 
      */
      return () => {
        if (loaded.value) {
          // 如果loaded为true  表示异步组件已经加载下来了
          return createVNode(instance)
        } else {
          return defaultPlaceholder
        }
      }
    }
  }
}
