import { createVNode } from "./createVnode";
import { render } from "./render";

export function createApp(app: any) {
  const mount = (rootContainer: any) => {
    const vnode = createVNode(app);
    render(vnode, rootContainer);
  };
  return {
    mount,
  };
}
