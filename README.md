# coderwei-mini-vue3

手写 vue3 核心源码，理解其原理 by myself。

项目包含大量注释，在核心且具有跳跃性的点进行了注释，站着阅读者的视角，特别是关联其他模块某个方法or用到其他
方法处理的结果，在该位置备注处理函数名及函数位置。保证每个阅读者都能跟着流程走完能够在心里对vue的整个流程有大致的认知。

无论是应付面试，还是希望通过有一个跷板进入vue3源码的世界，希望本项目都能够给到你帮助。项目还在持续更新中，力争完成vue的所有核心逻辑，进度在功能清单。

## 🕳️ 声明
项目是通过阅读[vue3](https://github.com/vuejs/core/tree/main)源码，函数名、代码组织方式都与vue3官方保持一致，抽离一切非vue的核心逻辑。**如果大家在阅读过程中发现任何问题，欢迎在issue中提出，同时也欢迎大家提交PR。当然如果在阅读过程中有什么疑惑，也欢迎在issue中提出。**

## 🙌 使用方式

项目采取monorepo结构，打包入口和打包出口已配置好，甚至包含我进行测试的example和打包后的文件，可以直接去/packages/vue/example直接运行index.html文件

当然也可以选择自己打包
~~~shell
  pnpm run build
  or
  nr build 
~~~
## 🗯️ 插件
1. 这里推荐大家使用[ni](https://github.com/antfu/ni)

2. 在运行index.html文件的时候同样推荐大家安装vscode插件[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)



## ✏ 相关参考
1. [Vue3 核心原理代码解构](https://juejin.cn/column/7089244418703622175)

2. [崔学社](https://github.com/cuixiaorui/mini-vue)

3. [Vue.js 的设计与实现](https://item.jd.com/13611922.html)

## 🛠 功能清单

### reactivity 部分
- [x] 实现 effect & reactive 依赖收集和依赖触发
- [x] 实现拦截in操作符(xx in obj  是不会触发 get 和 set 操作的 他会触发 has 操作 所以需要针对in操作符在 proxy 完善 has 拦截器)
- [x] 实现拦截 delete 操作符(delete obj.xxx  是不会触发 get 和 set 操作的 他会触发 deleteProperty 操作 所以需要针对 delete 操作符在 proxy 完善 deleteProperty 拦截器)
- [x] 实现拦截 for in 语句(for(let key in obj){your code...}  是不会触发get和set操作的 他会触发 ownKeys 操作 所以需要针对 in 操作符在 proxy 完善 ownKeys 拦截器)
- [x] 屏蔽由于原型引起的无意义更新
- [x] 实现数组 for in 循环的依赖收集与触发 && length 属性的依赖收集与触发
- [x] 重写 array 的 includes & indexOf & lastIndexOf 方法
- [x] 重写 array 的 push & pop & shift & unshift & splice 方法 (这几个方法会影响数组的length属性 如果不屏蔽对length属性的依赖会造成死循环)
- [x] 针对 Set 类型的 size 属性进行依赖收集与触发 
- [x] 重写 Set 类型的 add & delete 方法 
- [x] 重写 Map 类型的 set & get & forEach 方法 
- [x] 实现 effect 返回 runner
- [x] 实现 effect 的 scheduler 功能
- [x] 实现 effect 的 stop 功能
- [x] 优化 stop 功能
- [x] 实现 readonly 功能
- [x] 实现 isReactive 和 isReadonly 功能
- [x] 实现 readonly 和 reactive 嵌套对象功能
- [x] 实现 shallowReadonly 功能
- [x] 实现 shallowReactive 功能
- [x] 实现 isProxy 功能
- [x] 实现 isShallow 功能
- [x] 实现 ref 功能
- [x] 实现 isRef 和 unRef 功能
- [x] 实现 proxyRefs 功能
- [x] 实现 computed 计算属性功能
- [x] 实现 toRef 功能
- [x] 实现 toRefs 功能
- [x] 实现 cleanup 功能 & 分支切换 功能 (避免无意义的更新 见/packages/reactivity/test/effect.spec.ts的skip unnecessary update测试)
- [x] 实现嵌套 effect 函数


### runtime-core 部分
- [x] 实现初始化 component 主流程
- [x] 实现初始化 element 主流程 （通过递归 patch 拆箱操作，最终都会走向 mountElement 这一步）
- [x] 实现组件代理对象 （instance.proxy 解决`render()`函数的 this 指向问题）
- [x] 实现 shapeFlags （利用位运算 左移运算 对 vnode 添加标识，标识是什么类型：子级文本，子级数组，组件，HTML 元素）
- [x] 实现注册事件功能 （通过在 vnode.props 识别 props 对象的 key 是以 on 开头并且后一个字母是大写来判断是否是事件）
- [x] 实现组件 props 功能 （在 render 的 h 函数中可以用 this 访问到，并且是 shallowReadonly）
- [x] 实现组件 attrs 功能
- [x] 实现组件 emit 功能 （获取组件的 props 并判断 props 的'on+事件名'是否是 emit 的第一个参数：事件名匹配，是的话就执行 props 的里面的事件）
- [x] 实现组件 slots 功能 (具名插槽&作用域插槽)
- [x] 实现 Fragment 和 Text 类型节点 (避免固定死外层嵌套某个元素 比如说 div，使用 Fragment/Text 标识符 直接不渲染外层的 div，直接走 mountChildren 函数 处理 children 外层用户需要什么节点进行包裹自行选择)
- [x] 实现 getCurrentInstance
- [x] 实现 provide-inject 功能
- [x] 实现自定义渲染器 custom renderer
- [x] 更新 element 流程搭建
- [x] 更新 element 的 props
- [x] 更新 element 的 children
- [x] 更新 element 的双端对比 diff 算法
- [x] 实现组件更新功能
- [x] 实现更新组件props功能
- [x] 实现更新组件attrs功能
- [x] nextTick 的实现 (vue3 视图更新是异步的，如果我们想在组件更新的时候拿到当前组件的实例或者是操作当前组件的某些数据、dom，正常情况下是拿不到的，因为我们写在 script 标签内的代码都是同步的，那个时候视图还没有更新，拿到的自然都是旧数据)
- [x] 实现 watch 功能
- [x] 实现 watchEffect 功能
- [x] 实现 watchPostEffect 功能
- [x] 实现 watchSyncEffect 功能
- [x] 实现 defineComponent 功能
- [x] 实现 defineAsyncComponent 功能
- [ ] 实现 defineCustomElement 功能
- [x] 实现 KeepAlive 组件
- [x] 实现 Teleport 组件
- [ ] 实现 Suspense 组件
- [x] 实现 vue3的生命周期

### runtime-dom
- [x] 实现浏览器端的渲染逻辑(插入节点、删除节点、更新节点等等)
- [ ] 实现 Transition 组件
- [ ] 实现 TransitionGroup 组件

### compiler-core 部分
- [x] 实现 parse 模块
- [x] 实现 transform 模块
- [x] 实现 codegen 模块
- [x] 定义统一的出口(定义 baseCompiler 函数)

### 兼容vue2部分
- [ ] 兼容options api
- [ ] 兼容vue2的生命周期 (beforeCreate、created等)

### 内置指令
- [ ] v-text 
- [ ] v-html
- [ ] v-show
- [ ] v-if
- [ ] v-else
- [ ] v-else-if
- [ ] v-for
- [ ] v-on
- [ ] v-bind
- [ ] v-model
- [ ] v-slot
- [ ] v-pre
- [ ] v-once
- [ ] v-memo
- [ ] v-cloak


### monorepo
- [x] 使用monorepo重构整个项目
- [x] 使用vitest进行TDD测试

## 遗留 bug
> 先走完整个流程，这里记录调试过程中发现的小 bug，走完整个流程在处理这些 bug，顺便迫使自己重新梳理整个流程

- [x] 目前处理子组件 children 的逻辑有问题，当子组件的 children 为字符串的时候，渲染会出错
- [x] 组件的切换无法正常切换，初步估计是前面的代码不兼容组件销毁的操作
- [x] h函数children参数传递数字不渲染 (包括使用变量但是变量是一个数字类型) 在进行patchChildren的时候都不成立 patchFlag为1  需要单独处理
- [x] h函数传递两个参数不渲染  h('div','hello word') 
- [x] 渲染普通element元素 props传入style 最终生成的dom是style="object Object"的形式 需要在设置属性的时候进行区分(style、class)
