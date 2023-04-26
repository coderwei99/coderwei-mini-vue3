import { watchEffect, watchPostEffect, watchSyncEffect } from '../src/apiWatch'
import { reactive, ref } from '@coderwei-mini-vue3/reactive'
import { nextTick } from '@coderwei-mini-vue3/runtime-core'
import { count } from 'console'

describe('apiWatch', () => {
  it('watchEffect', async () => {
    /**
     * let count = ref(1)
     * let age;
     * watchEffect(() =>{
     *  age = count.value+1
     * })
     *
     * count.value => 1 && age => 2
     * count.value++
     * count.value => 2 && age => 3
     */
    const count = ref(1)
    let dummy
    watchEffect(
      () => {
        console.log('watch is call')
        dummy = count.value + 1
      }
      // {
      //   flush: 'post'
      // }
    )
    expect(dummy).toBe(2)
    count.value++
    await nextTick() //watchEffect默认情况下是在组件渲染之前执行的。是由watchEffect的第二个参数控制的: type: {  flush?: 'pre'(默认:组件渲染之前执行) | 'post'(组件渲染之后执行) | 'sync'(依赖触发后立即执行) }
    expect(dummy).toBe(3)
  })

  it('watchEffect first parameter is function, it have a onCleanup function', async () => {
    // 利用vitest的vi工具模拟一个函数，断言他的调用次数
    let count = ref(1)
    let dummy
    const fn = vi.fn(() => {
      console.log('---')
    })
    watchEffect((onCleanup) => {
      // 第一次onCleanup函数不会执行
      // 后续由于依赖发生变化，导致watchEffect执行的时候，就会先调用一次这个onCleanup函数
      dummy = count.value //简单触发一个count的get操作，收集下依赖
      console.log('watchEffect is call')
      onCleanup(fn)
    })
    expect(fn).toHaveReturnedTimes(0)
    count.value++
    await nextTick() //这里注意 因为我们触发依赖都是异步触发的(在微任务中触发的，他会在同步任务执行完之后才轮到他执行) 所以下面的代码会比触发依赖先执行，如果不等待视图渲染完成，下面断言函数执行一次的测试将永远不会成立
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('watchEffect can return a function to stop monitor', async () => {
    let count = ref(1)
    let dummy
    const fn = vi.fn(() => {
      dummy = count.value
    })
    const stop = watchEffect(fn)
    expect(fn).toBeCalledTimes(1)
    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(2)

    stop()
    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(2)
    count.value++
    await nextTick()
    expect(fn).toBeCalledTimes(2)
  })

  describe('watchEffect options', () => {
    it('options flush is post', () => {
      // 当flush的值为post的时候，回调函数会在组件更新之后执行
      let count = ref(1)
      watchEffect(
        () => {
          count.value
          console.log('watchEffect callback is run')
        },
        {
          flush: 'post'
        }
      )
      console.log('开始触发依赖')
      count.value++
    })
    it('watchPostEffect', () => {
      // 当flush的值为post的时候，回调函数会在组件更新之后执行
      let count = ref(1)
      watchPostEffect(() => {
        count.value
        console.log('watchEffect callback is run')
      })
      console.log('开始触发依赖')
      count.value++
    })

    it.only('options flush is sync', () => {
      // 当flush的值为sync的时候，依赖发生变化后立刻执行回调函数
      let obj = reactive({
        count: 1
      })
      watchEffect(
        () => {
          obj.count
          console.log('watchEffect callback is call')
        },
        {
          flush: 'sync'
        }
      )
      obj.count++
    })
    it.only('watchSyncEffect', () => {
      let obj = reactive({
        count: 1
      })
      watchSyncEffect(
        () => {
          obj.count
          console.log('watchEffect callback is call')
        },
        {
          flush: 'sync'
        }
      )
      obj.count++
    })
  })
})
