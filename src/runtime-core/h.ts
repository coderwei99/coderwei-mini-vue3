import { createVNode } from "./createVnode";

export function h(type, props?, children?) {
  return createVNode(type, props, children);
}
