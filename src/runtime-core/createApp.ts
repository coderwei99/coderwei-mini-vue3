import { createVNode } from "./index";
import { render } from "./index";

export function createApp(app: any) {
  const mount = (rootContainer: any) => {
    const vnode = createVNode(app);
    render(vnode, rootContainer);
  };
  return {
    mount,
  };
}
