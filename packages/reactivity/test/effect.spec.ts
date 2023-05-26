import { reactive } from '../src/reactive'
import { effect, stop } from '../src/effect'
import { vi } from 'vitest'

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    user.age++
    expect(nextAge).toBe(12)
  })

  it('should return runner when effect call', () => {
    let foo = 1
    let runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(2)
    let resultValue = runner()
    expect(foo).toBe(3)
    expect(resultValue).toBe('foo')
  })

  it('scheduler', () => {
    /**
     * 1. 用户可以在effect选择性传入一个options 配置对象  其中有一个scheduler，val是一个函数
     * 2. 当用户传入一个scheduler的时候 第一次继续执行effect的回调函数
     * 3. 之后触发的依赖是执行用户传入的scheduler函数
     * 4. 当用户执行effect返回的runner之后，触发依赖的时候正常执行effect的回调函数
     */
    let dummy
    let run: any
    const scheduler = vi.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger set操作的时候,也就是说在trigger被调用的时候
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run  会触发effect的回调函数
    run()
    // should have run
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    // 执行proxy的set操作，触发trigger()
    obj.prop = 3
    expect(dummy).toBe(2)
    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    const obj = reactive({ foo: 1 })
    const onStop = vi.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )
    stop(runner)
    // 被调用1次
    expect(onStop).toBeCalledTimes(1)
  })

  it('skip unnecessary update', () => {
    // 在下面的例子,已经不需要在去触发依赖
    let obj = reactive({
      ok: true,
      text: 'hello world'
    })
    let fn = vi.fn(() => {
      dummy = obj.ok ? obj.text : 'not'
    })
    let dummy
    effect(fn)

    expect(fn).toBeCalledTimes(1) //第一次默认执行
    expect(dummy).toBe('hello world')
    obj.ok = false
    expect(fn).toBeCalledTimes(2) // 当obj.ok发生变化  执行一次获取新值
    expect(dummy).toBe('not')

    // should not update 按道理来说 在obj.ok为false的情况下  无论obj.text如何发生变化  依赖都不应该会去重新执行  因为永远都不会去读取obj.text的值 所以不需要去触发依赖
    obj.text = 'hi'
    expect(fn).toBeCalledTimes(2) //这个时候 就不需要执行fn来获取最新的值了 因为没有意义
  })

  // 嵌套的effect函数
  /* 
    为什么要考虑effect处于嵌套的情况?
    这完全是由于vue的设计所造成的 可能这样说不太准确 换个角度说 是组件化就需要effect支持嵌套逻辑
    举个例子
      当我们的组件进行嵌套的情况下 vue在内部会进行组件的渲染 也就是说会执行组件的render函数 具体的表现形式类似入下
      // Child.vue
      const Child = {
        name:'Child',
        render(){
          return h('div',{},'Child')
        }
      }
      // App.vue
      const App = {
        name:'App',
        render(){
          return h('div',{},[h(Child)])
        }
      }

      他们在渲染的时候会被实际上是在一个effet函数内部执行的 类似于下面这种
      effect(()=>{
        App.render()
        effect(()=>{
          Child.render()
        })
      )}
    
    这也是为什么要考虑effect嵌套的情况
   */
  it('nesting effect funtion', () => {
    let obj = reactive({
      temp1: 1,
      temp2: 2
    })

    let temp1, temp2
    effect(() => {
      effect(() => {
        temp2 = obj.temp2
      })
      temp1 = obj.temp1
    })

    expect(temp1).toBe(1)
    expect(temp2).toBe(2)
    obj.temp1 = 3
    expect(temp1).toBe(3)
    expect(temp2).toBe(2)
  })
})
