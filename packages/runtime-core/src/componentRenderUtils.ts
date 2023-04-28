import { ShapeFlags } from '@coderwei-mini-vue3/shared'

export function renderComponentRoot(instance) {
  let result
  if (instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 有状态的组件
    result = instance.render.call(instance.proxy, instance.proxy)
  } else {
    // 函数式组件
  }

  return result
}
