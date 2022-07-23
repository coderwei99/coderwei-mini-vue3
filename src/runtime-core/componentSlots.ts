import { ShapeFlags } from "../shared/ShapeFlags";
import { createVNode, Fragment } from "./vnode";
import { isArray } from "../shared/index";
// 如果children里面有slot，那么把slot挂载到instance上
export function initSlots(instance: any, children: any) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(instance.slots, children);
  }
}
// 具名name作为instance.slots的属性名，属性值是vnode
function normalizeObjectSlots(slots: any, children: any) {
  // console.log("slots children===>", children);
  // 遍历对象
  for (let key in children) {
    const value = children[key];
    // console.log(value, "value");

    slots[key] = props => normalizeSlotValue(value(props));
    // slots[key] = normalizeSlotValue(value)
  }
}
// 转成数组
function normalizeSlotValue(value: any) {
  return isArray(value) ? value : [value];
}

export function renderSlot(slots: any, name: string = "default", props: any) {
  // console.log("开始执行renderslot");

  const slot = slots[name]; //插槽名字有默认值  如果用户什么都不传 遵循官网的用法  默认使用default
  // console.log("slot==>", slots, slot);
  if (slot) {
    // slot是一个函数的时候说明用户传入的是插槽
    if (typeof slot === "function") {
      return createVNode(Fragment, {}, slot(props));
      // return createVNode(Fragment, {}, slot);
    }
  } else {
    return slots;
  }
}
