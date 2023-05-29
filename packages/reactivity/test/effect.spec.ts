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

  it('reflect on proxy', () => {
    // 在谈论proxy的时候 都会说到reflect 总感觉这两个api是形影不离的 那是为何?
    /* 
      在这里不关心他们在别的场景下 是如何如何的 我们只关心在vue的响应式系统中 他们是如何配合的
      先说总结: 其实就是在proxy的set操作中 通过reflect去触发依赖 至于为何  就是担心所谓的this指向的问题  可以看下面例子 我这里先做解释
      1. 我们定义一个普通对象obj  但是同时还定义了一个访问器属性bar
      2. 然后我们通过reactive去代理这个对象
      3. 当我们在effect中去访问这个访问器属性的时候  会触发get操作  也就是说会收集依赖
      ok,我们先不谈后面的事情 先搞清楚一个问题 我们使用effect去访问这个访问器属性的时候  收集依赖 到底应该收集谁呢? bar? foo? 我们仔细看看代码 先下结论 按照逻辑来说 foo和bar都应该被收集 dummy依赖于bar bar依赖于foo
      不就相当于dummy依赖于foo? foo发生变化的时候 dummy理论上也需要发生变化 搞清楚这个我们再看下面
      按照以往的逻辑来说  是做不到这一点的 为什么? 说白了就是bar中的这个this问题  他的this指向的谁?
      function reactive(target){
        return new Proxy(target,{
          get(target,key,receiver){
            track(target,key)
            return target[key] 问题就出现在这里  当我们访问bar的时候  他的this指向的是obj  而不是proxy 所以我们无法去触发依赖
          },
          set(target,key,value,receiver){
            const result = (target[key] = value)
            trigger(target,key)
            return result
          } 
        })
      }
    */
    let obj = {
      foo: 1,
      get bar() {
        return this.foo
      },
      set bar(value) {
        this.foo = value
      }
    }
    const user = reactive(obj)
    let dummy
    let fn = vi.fn(() => {
      dummy = user.bar
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    expect(dummy).toBe(1)
    user.foo = 2
    expect(fn).toBeCalledTimes(2)
    expect(dummy).toBe(2)
  })

  it('effect with in', () => {
    // in 操作符 不会触发get和set操作 所以不会触发依赖  我们需要在proxy中新增一个handler.has的操作 就可以正常触发依赖了
    let obj = reactive({
      foo: 1
    })
    let fn = vi.fn(() => {
      'foo' in obj
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    obj.foo = 2
    expect(fn).toBeCalledTimes(2)
  })

  it('for in with reactive', () => {
    /* 
    for in 也是不会触发get和set操作的  所以也需要在proxy中新增一个handler.ownKeys的操作
    注意我说的是for in循环而已 在for in循环内部操作代理对象(修改属性或者添加属性)是会触发get和set操作的 
    如果我们想的片面一点 其实都不需要去拦截for in拦截器 因为我们在使用for in的时候 一般都是在遍历对象的属性 
    那么拦截for in 操作的意义在哪里?
    ~~~typescript
      let obj = reactive({
        foo: 1
      })
      effect(()=>{
        for(let key in obj){
          console.log(key)
        }
      })
      obj.bar = 2
    ~~~
    看上面demo 我们给响应式对象新增了一个属性 但是for in循环并没有重新执行 为什么? 很简单 effect内部的for in循环并没有收集依赖 因为我们添加了属性,for in循环就变成了两次 我们需要for in循环重新执行
      那么我们该如何让他收集依赖呢?
      很简单:上面说了for in循环会触发ownKeys拦截器 我们在这里做事情就好了
    
    但是上面demo还有一个性能问题 我们在新增属性 for in循环重新执行了 没问题  但是我如果修改呢? for in循环还是会重新执行 但是我们并不需要这样的效果 这就属于没意义的更新 我们需要for in循环重新执行 只是为了用户在for in循环
    内部每次都能拿到正确数量的key罢了 修改的时候key的数量并不会发生变化 这个解决方案就更简单了 我们在set的时候判断一下 如果是新增属性 我们就不触发依赖 如果是修改属性 我们就触发依赖
    */

    interface Obj {
      foo: number
      [key: string]: any
    }
    let obj: Obj = reactive({
      foo: 1
    })
    let res: string[] = []
    let fn = vi.fn(() => {
      // 当调用for in 循环的时候 我们希望他也能够收集依赖 并且在响应式数据发生变化的时候 也能够触发依赖
      res = []
      for (let key in obj) {
        res.push(key)
        console.log(key)
      }
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    expect(res).toEqual(['foo'])
    obj.bar = 2 //注意 我们是新增了一个属性  for in循环需要重新执行
    expect(fn).toBeCalledTimes(2)
    expect(res).toEqual(['foo', 'bar'])
  })

  it('for in with delete', () => {
    // 同上 delete操作也会影响for in循环
    interface Obj {
      foo?: number
      [key: string]: any
    }
    let obj: Obj = reactive({
      foo: 1
    })
    let res: string[] = []
    let fn = vi.fn(() => {
      // 当调用for in 循环的时候 我们希望他也能够收集依赖 并且在响应式数据发生变化的时候 也能够触发依赖
      res = []
      for (let key in obj) {
        res.push(key)
        console.log(key)
      }
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    expect(res).toEqual(['foo'])
    delete obj.foo
    expect(fn).toBeCalledTimes(2)
    expect(res).toEqual([])
  })

  it('same value is not trigger effect', () => {
    let obj = reactive({
      foo: 1,
      bar: NaN
    })
    let dummy
    let fn = vi.fn(() => {
      dummy = obj.bar
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    // obj.foo = 1
    obj.bar = 2
    expect(dummy).toBe(2)
    expect(fn).toBeCalledTimes(2)
  })

  it('proto object trigger effect', () => {
    let proto = reactive({
      foo: 1
    })
    let obj = reactive(Object.create(proto))
    let dummy
    let fn = vi.fn(() => {
      dummy = obj.foo
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    obj.foo = 2
    expect(fn).toBeCalledTimes(2)
  })

  // proxy Array
  it('modify array length,effect legnth is trigger', () => {
    // effect函数 依赖数组的legnth属性的时候 当我们修改数组长度 比如说新增一项 删除一项的时候 依赖也需要重新执行
    const arr = reactive([1])
    let dummy
    let ret
    effect(() => {
      ret = arr[0]
      dummy = arr.length
    })
    expect(dummy).toBe(1)
    arr[1] = 2 //修改数组的长度 依赖应该会重新执行
    expect(dummy).toBe(2)
    expect(ret).toBe(1)
    arr.length = 0
    expect(ret).toBe(undefined)
  })

  it('set array length max effect length', () => {
    // 只有当重新设置数组的长度大于依赖的index的时候 依赖才会重新执行 比如
    /* 
      let arr = reactive([1,2,3])
      let dummy
      effect(() =>{
        dummy = arr[0]
      })
      arr.length = 1000
      依赖需要重新执行吗? 这里明显不需要吧 所以我们很容易得出结论 当我们设置length属性的时候 只有这个length属性大于依赖的index的时候 依赖才会重新执行
      */
    let arr = reactive([1, 2, 3])
    let dummy
    let fn = vi.fn(() => {
      dummy = arr[0]
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    arr.length = 1000 //依赖不应该重新执行
    expect(fn).toBeCalledTimes(1)
  })

  it('for in with array', () => {
    let arr = reactive([1, 2, 3])
    let dummy: string[] = []
    effect(() => {
      dummy = []
      for (const key in arr) {
        dummy.push(key)
      }
    })

    expect(dummy).toEqual(['0', '1', '2'])
    arr[3] = 4
    expect(dummy).toEqual(['0', '1', '2', '3'])
    arr.length = 0
    expect(dummy).toEqual([])
  })

  // array functions
  it('array include function with Seven data types that are primitives', () => {
    let arr = reactive([1, 2, 3])
    let dummy
    let fn = vi.fn(() => {
      dummy = arr.includes(4)
    })
    effect(fn)
    expect(dummy).toBe(false)
    arr[3] = 4
    expect(dummy).toBe(true)
  })

  it('array include function with Object', () => {
    /* 
      这里做个简单的解释: 我们知道我的proxy在get的时候 会判断值是不是一个对象 如果是一个对象的话 会对这个对象再次进行reactive操作 于是就有一个问题
      arr[0] !== arr[0] 为什么呢? 因为我们在每次访问下标为0的项都会触发get 于是每次都会返回一个新的proxy对象 问题就出现在下面这部分代码
      if (isObject(res) && !isShallow) {
        return isReadonly ? readonly(res) : reactive(res)
      }

      解决方案: 
      我们在reactive函数中加入一个判断 判断当前对象是否被代理过 如果被代理过的话 就不需要再次代理了 反之则需要代理 然后将其存起来
     */
    let obj = { foo: 1 }
    let arr = reactive([obj])
    let ret = arr.includes(arr[0])
    // 重写includes方法 因为我们arr数组中的项是一个proxy对象 而includes方法是根据值来判断的 所以我们需要重写这个方法 开发者拿着obj对象来判断是否在arr数组中 也是正常的
    let ret1 = arr.includes(obj)
    expect(ret).toBe(true)
    expect(ret1).toBe(true)
  })

  it('array indexOf function and lastIndexOf', () => {
    let obj = {}
    let arr = reactive([1, 2, obj])
    let i = arr.indexOf(obj)
    let j = arr.lastIndexOf(obj)
    let k = arr.indexOf(arr[0])
    let l = arr.lastIndexOf(arr[2])
    expect(i).toBe(2)
    expect(j).toBe(2)
    expect(k).toBe(0)
    expect(l).toBe(2)
  })

  it('array push pop shift unshift splice function', () => {
    let arr = reactive([1, 2, 3])
    let dummy
    let fn = vi.fn(() => {
      dummy = arr[0]
    })
    effect(() => {
      arr.push(4)
    })
    effect(() => {
      arr.push(5)
    })
    expect(arr).toEqual([1, 2, 3, 4, 5])
    effect(fn)
    arr.pop()
    expect(dummy).toBe(1)
    arr.shift()
    expect(dummy).toBe(2)
    arr.shift()
    expect(dummy).toBe(3)
  })

  //  Set
  it('Set reactive', () => {
    const set = reactive(new Set([1, 2, 3]))
    let dummy
    let fn = vi.fn(() => {
      dummy = set.size
    })
    effect(fn)
    expect(dummy).toBe(3)
    set.add(4)
    expect(dummy).toBe(4)
    set.delete(1)
    expect(dummy).toBe(3)
    set.add(4) //添加相同的项 不会触发依赖
    expect(fn).toBeCalledTimes(3)
    set.delete(999) //删除一个不存在的项 不会触发依赖
    expect(fn).toBeCalledTimes(3)
  })

  // Map
  it('Map reactive', () => {
    const map = reactive(new Map([['foo', 1]]))
    let dummy
    effect(() => {
      dummy = map.get('foo')
    })
    expect(dummy).toBe(1)
    map.set('foo', 2)
    expect(dummy).toBe(2)

    const m = new Map()
    const map1 = reactive(m)
    const p2 = reactive(new Map())
    map1.set('p2', p2)
    let dummy1
    let fn = vi.fn(() => {
      dummy1 = m.get('p2').size
    })
    effect(fn)
    m.get('p2').set('k', 99) //通过原始数据 不应该触发依赖 [vuejs的设计与实现]中 p140 提到了这个问题(避免污染原始数据)
    expect(fn).toBeCalledTimes(1)
  })

  it('Map with forEach', () => {
    const s = new Set([1, 2])
    const m = new Map([['s', s]])
    const map = reactive(m)
    let dummy
    let fn = vi.fn(() => {
      map.forEach((value, key) => {
        dummy = value.size
      })
    })
    effect(fn)
    expect(dummy).toBe(2)
    map.get('s').add(3)
    expect(dummy).toBe(3)
  })

  it('Map with forEach set same key', () => {
    const map = reactive(new Map([['foo', 1]]))
    let dummy
    const fn = vi.fn(() => {
      map.forEach((value, key) => {
        dummy = value
      })
    })
    effect(fn)
    expect(fn).toBeCalledTimes(1)
    map.set('foo', 1)
    expect(fn).toBeCalledTimes(1)
    expect(dummy).toBe(1)
  })
})
