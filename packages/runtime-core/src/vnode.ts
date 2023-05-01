import { isArray, isBoolean, ShapeFlags } from '@coderwei-mini-vue3/shared'
import { isObject, isString } from '@coderwei-mini-vue3/shared'
export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

export { createVNode as createElementBlock }
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props: props ?? {},
    children,
    component: null,
    key: props && props.key,
    shapeFlag: getShapeFlag(type), //  给vnode提供一个标识符 标志是什么类型的vnode  便于扩展
    el: null,
    __v_isVNode: true
  }
  // 根据vnode的children类型追加一个新的标识符
  normalizeChildren(vnode, children)

  return vnode
}

export function getShapeFlag(type: any) {
  return isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
}

export function normalizeChildren(vnode: any, children: any) {
  // 先把null排除掉  因为isObject(null)返回true 会误进下面的isObject条件
  if (children == null) {
    children = null
  } else if (Array.isArray(children)) {
    // children是数组的情况下
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {
    // 子级是对象
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOTS_CHILDREN
  } else {
    // children是字符串/数字的情况下 需要将数字转换为字符串
    children = String(children)
    vnode.children = children //重新挂载到vnode上面
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  }
}

// 当用户传入文本的时候 需要创建一个虚拟节点 不然patch无法渲染的
export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

// 判断是否是一个虚拟节点
export function isVnode(value) {
  return value && !!value.__v_isVNode
}

// diff算法判断是否是同一个节点
export function isSomeVNodeType(n1, n2) {
  return n1.type == n2.type && n1.key == n2.key
}

export function normalizeVNode(children) {
  if (children == null || isBoolean(children)) {
    // 如果为空 或者是是布尔值 当做注释节点
    return createVNode(Comment)
  } else if (isArray(children)) {
    return createVNode(Fragment, null, children.slice())
  } else if (isObject(children)) {
    return children
  }
  return createVNode(Text, null, String(children))
}
