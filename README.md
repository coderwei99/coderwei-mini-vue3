# VUE-NEXT-3.x
手写 vue3 核心源码，理解其原理 by myself

## 🙌 目的
我想进大厂

## ✏ 相关参考
[Vue3 核心原理代码解构](https://juejin.cn/column/7089244418703622175)

[崔学社](https://github.com/cuixiaorui/mini-vue)

[Vue.js 的设计与实现](https://item.jd.com/13611922.html)

## 🛠 功能清单

reactivity 部分
- [x] 实现 effect & reactive 依赖收集和依赖触发
- [x] 实现 effect 返回 runner
- [x] 实现 effect 的 scheduler 功能
- [x] 实现 effect 的 stop 功能
- [x] 优化 stop 功能
- [x] 实现 readonly 功能
- [x] 实现 isReactive 和 isReadonly 功能
- [x] readonly 和 reactive 嵌套对象功能
- [x] 实现 shallowReadonly 功能
- [x] 实现 shallowReactive 功能
- [x] 实现 isProxy 功能
- [x] 实现 isShallow 功能
- [x] 实现 ref 功能
- [x] 实现 isRef 和 unRef 功能
- [x] 实现 proxyRefs 功能
- [x] 实现 computed 计算属性功能

runtime-core 部分
- [x] 实现初始化 component 主流程
- [x] 实现初始化 element 主流程 （通过递归 patch 拆箱操作，最终都会走向 mountElement 这一步）
- [x] 实现组件代理对象 （instance.proxy 解决`render()`函数的 this 指向问题）
- [x] 实现 shapeFlags （利用位运算 左移运算 对 vnode 添加标识，标识是什么类型：子级文本，子级数组，组件，HTML 元素）
- [x] 实现注册事件功能 （通过在 vnode.props 识别 props 对象的 key 是以 on 开头并且后一个字母是大写来判断是否是事件）
- [x] 实现组件 props 功能 （在 render 的 h 函数中可以用 this 访问到，并且是 shallowReadonly）
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
- [x] nextTick 的实现 (vue3 视图更新是异步的，如果我们想在组件更新的时候拿到当前组件的实例或者是操作当前组件的某些数据、dom，正常情况下是拿不到的，因为我们写在 script 标签内的代码都是同步的，那个时候视图还没有更新，拿到的自然都是旧数据)
- [x] 实现 watch 功能
- [x] 实现 watchEffect 功能
- [x] 实现 watchPostEffect 功能
- [x] 实现 watchSyncEffect 功能


compiler-core 部分
- [x] 实现 parse 模块
- [x] 实现 transform 模块
- [x] 实现 codegen 模块
- [x] 定义统一的出口(定义 baseCompiler 函数)

monorepo
- [x] 使用monorepo重构整个项目

## 遗留 bug
> 先走完整个流程，这里记录调试过程中发现的小 bug，走完整个流程在处理这些 bug，顺便迫使自己重新梳理整个流程

- [x] 目前处理子组件 children 的逻辑有问题，当子组件的 children 为字符串的时候，渲染会出错
