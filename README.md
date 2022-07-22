# VUE-NEXT-3.x

手写 vue3 核心源码，理解其原理 by myself

## 🙌 目的

我想进大厂

## ✏ 相关参考
[Vue3核心原理代码解构](https://juejin.cn/column/7089244418703622175)

[崔学社](https://github.com/cuixiaorui/mini-vue)

[Vue.js的设计与实现](https://item.jd.com/13611922.html)

## 🛠 功能清单
reactivity部分

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


runtime-core部分

- [x] 实现初始化 component 主流程
- [x] 实现初始化 element 主流程  （通过递归patch拆箱操作，最终都会走向mountElement这一步）
- [x] 实现组件代理对象  （instance.proxy解决`render()`函数的this指向问题）
- [x] 实现 shapeFlags  （利用位运算 左移运算 对vnode添加标识，标识是什么类型：子级文本，子级数组，组件，HTML元素）
- [x] 实现注册事件功能     （通过在vnode.props识别 props对象的key是以on开头并且后一个字母是大写来判断是否是事件）
- [x] 实现组件 props 功能   （在render的h函数中可以用this访问到，并且是shallowReadonly）
- [x] 实现组件 emit 功能   （获取组件的props并判断props的'on+事件名'是否是emit的第一个参数：事件名匹配，是的话就执行props的里面的事件）
- [x] 实现组件 slots 功能
- [x] 实现 Fragment 和 Text 类型节点  
- [ ] 实现 getCurrentInstance
- [ ] 实现 provide-inject 功能
- [ ] 实现自定义渲染器 custom renderer
- [ ] 更新 element 流程搭建
- [ ] 更新 element 的 props
- [ ] 更新 element 的 children
- [ ] 更新 element 的双端对比 diff 算法
- [ ] 实现组件更新功能
