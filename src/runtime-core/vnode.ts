import { ShapeFlags } from "../shared/ShapeFlags";
import { isObject, isString } from "../shared/index";
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    component: null,
    key: props && props.key,
    shapeFlag: getShapeFlag(type), //  给vnode提供一个标识符 标志是什么类型的vnode  便于扩展
    el: null,
  };
  // 根据vnode的children类型追加一个新的标识符
  normalizeChildren(vnode, children);

  return vnode;
}

export function getShapeFlag(type: any) {
  return isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
}

export function normalizeChildren(vnode: any, children: any) {
  if (isString(children)) {
    // children是字符串的情况下
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    // children是数组的情况下
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      // 子级是对象
      vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOTS_CHILDREN;
    }
  }
}

// 当用户传入文本的时候 需要创建一个虚拟节点 不然patch无法渲染的
export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}
