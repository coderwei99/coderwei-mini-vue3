import { createVNode, Fragment } from "./vnode";

export function initSlots(instance: any, children: any) {
  instance.slots = Array.isArray(children) ? children : [children];
}
export function renderSlot(slots: any) {
  // 用一个div包裹
  const vnode = createVNode(Fragment, {}, slots);
  // console.log("vnode", vnode);
  return vnode;
}
