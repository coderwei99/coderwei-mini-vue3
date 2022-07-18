import { createVNode } from "./index";

export function h(type, props?, children?) {
  return createVNode(type, props, children);
}
