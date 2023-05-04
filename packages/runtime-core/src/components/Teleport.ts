import { ShapeFlags } from '@coderwei-mini-vue3/shared'

export function isTeleport(vnode) {
  return vnode.__isTeleport
}

const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, parentComponent, anchor, internals) {
    const {
      props: { disabled },
      shapeFlag,
      children
    } = n2
    const {
      mc: mountChildren,
      pc: patchChildren,
      m: move,
      o: { querySelect, insert, createText }
    } = internals
    if (!n1) {
      const startPlaceholder = (n2.el = createText('teleport start'))
      const endPlaceholder = (n2.anchor = createText('teleport end'))
      console.log(container)
      insert(startPlaceholder, container, anchor)
      insert(endPlaceholder, container, anchor)

      // 获取传送门的目标容器
      const target = resolveTarget(n2.props, querySelect)
      console.log(target)

      const targetAnchor = createText('')
      if (target) {
        insert(targetAnchor, target)
      } else {
        console.warn('请检查to属性,无效的目标元素')
      }
      const mount = (container, anchor) => {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 如果children是Array 就遍历插入 mountChildren会自动遍历的 前提是一定要保证children是一个数组 不是一个数组什么都不做
          mountChildren(children, container, parentComponent, anchor)
          console.log(children)
        }
      }
      if (disabled) {
        // 禁用 不移动 挂载在原位置
        mount(container, endPlaceholder)
      } else {
        mount(target, targetAnchor)
      }
    } else {
      // patch Teleport
      patchChildren(n1, n2, container, parentComponent)
      if (n1.props.to != n2.props.to) {
        const newTarget = querySelect(n2.props?.to)
        n2.children.forEach((node) => {
          move(node, newTarget)
        })
      }
    }
  }
}
function resolveTarget(props: any, querySelect: any) {
  const targetSelect = props && props.to
  if (targetSelect) {
    if (querySelect) {
      return querySelect(targetSelect)
      return null
    } else {
      console.warn('select选择器不能为空')
    }
  } else {
    console.warn('to属性不能为空')
    return null
  }
}

export const Teleport = TeleportImpl
