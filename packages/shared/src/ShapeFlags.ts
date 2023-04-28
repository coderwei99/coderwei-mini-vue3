// vnode 类型的标识符
export const enum ShapeFlags {
  ELEMENT = 1, // 0000000001  字符串类型
  FUNCTIONAL_COMPONENT = 1 << 1, // 0000000010  函数组件类型
  STATEFUL_COMPONENT = 1 << 2, // 0000000100  普通的有状态的组件
  TEXT_CHILDREN = 1 << 3, // 0000001000 子节点为纯文本
  ARRAY_CHILDREN = 1 << 4, // 0000010000 子节点是数组
  SLOTS_CHILDREN = 1 << 5, // 0000100000 子节点是插槽
  TELEPORT = 1 << 6, // 0001000000  Teleport
  SUSPENSE = 1 << 7, // 0010000000 Supspense
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 0100000000 需要被keep-live的有状态组件
  COMPONENT_KEPT_ALIVE = 1 << 9, // 1000000000 已经被keep-live的有状态组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT // 有状态组件和函数组件都是组件，用component表示
}
