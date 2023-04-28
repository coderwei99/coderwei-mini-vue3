import { isArray, isObject, isString } from '@coderwei-mini-vue3/shared'
import { createVNode } from './vnode'

// h函数有两种写法
// 1. 两个参数
// 写法1 h('div',{})
// 写法2 h('div',h('span'))
// 写法3 h('div','he')
// 写法4 h('div',['he'])

// 3.三个参数
// 写法1 h('div',{},'孩子')
// 写法1 h('div',{},h())
// 写法2 h('div',{},['孩子','孩子'，'孩子'])

// h函数的children 只有两种情况  要么把children处理成数组  要么是字符串

export function h(type, props?, children?) {
  const len = arguments.length
  if (len === 2) {
    // TODO 兼容两个参数的写法
    if (isObject(props) && !isArray(children)) {
      // 如果props是一个对象并且不是一个数组  就说明用户传入了一个props
      return createVNode(type, props)
    } else {
      // 如果是数组、文本
      return createVNode(type, null, children)
    }
  } else {
    if (len > 3) {
      // 三个以上
      children = Array.prototype.slice.call(arguments, 2)
    } else if (isArray(children)) {
      // 如果原本就是给的数组 就不需要给他再次放到数组里面了 不然就形成了二维数组
      // TODO 这里其实可以直接在下面的isString 那里进行判断  那里不应该用isString  因为判断当前children 是否有一个__is_vNode类型  不过暂时没有对节点进行标注
    } else if (len === 3 && !isString(children)) {
      // 等于三个 并且children是节点 才放入数组中 如果不是节点可以直接渲染  在这里就要统一处理好 后续判断只要是节点 就直接去重复patch 就不管新里面有没有可能是文本类型了
      children = [children]
    }
    return createVNode(type, props, children)
  }
}
