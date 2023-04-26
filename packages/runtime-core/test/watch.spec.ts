import { watch, watchEffect, watchPostEffect, watchSyncEffect } from '../src/apiWatch'
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

    it('options flush is sync', () => {
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
    it('watchSyncEffect', () => {
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

  describe('watch', () => {
    it('watch happy path', async () => {
      let count = ref(1)
      watch(count, (value, oldVal) => {
        console.log('watch is run', value, oldVal)
        // 这里取巧了: 这里的count.value和count.value-1只是为了确定断言的内容，因为触发了两次依赖，每次断言的值是不同的 但是我们确定新值就是count.value的值 我们的操作时++ 所以旧值就是原有基础上-1
        expect(value).toBe(count.value)
        expect(oldVal).toBe(count.value - 1)
        count.value
      })
      count.value++
      await nextTick()
      count.value++
    })

    it('watch is called several times in a row', () => {
      let count = ref(1)
      watch(count, (value, oldVal) => {
        console.log('watch is run', value, oldVal)
        // 连续更改两次依赖，在任务队列中做了去重处理，只执行最后一次 拿到最终值(不处理也问题不大，不影响核心逻辑，这里只是为了更加契合官方watch的表现)
        expect(value).toBe(3)
        expect(oldVal).toBe(1)
        count.value
      })
      count.value++
      count.value++
    })

    it('watch onCleanup', async () => {
      let count = ref(1)
      let fn = vi.fn(() => {
        console.log('onCleanup is be call')
      })
      watch(count, (value, oldVal, onCleanup) => {
        console.log('watch is be call')
        onCleanup(() => {
          console.log('onCleanup is be call')
        })
      })

      count.value++
      await nextTick
      console.log('视图渲染完毕')
      count.value++
      await nextTick
      console.log('视图渲染完毕')
      count.value++
    })

    describe('source type', () => {
      // watch第一个参数的监听源 会有多种类型的参数  不同的参数有着不同的处理方式
      it('ref type', () => {
        // 上面实现watch核心逻辑的时候就是以ref类型为基础的 所以是已经实现的  这里可以跳过
      })

      it('reactive type', async () => {
        // 根据官网的说法 当给watch的第一个监听源传递的是一个reactive类型的时候 应该会自动开启深度监听 也就是deep:true
        let obj = reactive({
          age: 18,
          foo: {
            count: 99
          }
        })

        // 注意点: 这里的newVal和oldVal是同一个对象 下面是官网的解释 https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers
        /**
         * 当使用 getter 函数作为源时，回调只在此函数的返回值变化时才会触发。如果你想让回调在深层级变更时也能触发，
         * 你需要使用 { deep: true } 强制侦听器进入深层级模式。**在深层级模式时，如果回调函数由于深层级的变更而被触发，那么新值和旧值将是同一个对象**
         */
        watch(obj, (newVal, oldVal) => {
          console.log('watch is be call', newVal.foo.count, oldVal.foo.count)
          expect(newVal).toBe(oldVal)
        })
        obj.foo.count++
      })

      it('function type', () => {
        let count = ref(1)
        let obj = reactive({
          age: 19
        })
        watch(
          // () => count.value,
          () => obj.age,
          (newVal, oldVal) => {
            console.log('watch is be call', newVal, oldVal)
          }
        )
        obj.age++
      })
    })
  })
})
