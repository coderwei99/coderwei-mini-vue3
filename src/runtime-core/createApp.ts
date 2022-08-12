import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent: any) {
    // app就是我们app.js中导出的组件描述  可以说这个app会是最大的组件的描述  后续我们写的任何组件都在他的下层
    // console.log(app);
    const app = {
      _component: rootComponent,
      mount(rootContainer: any) {
        const vnode = createVNode(rootComponent);
        render(vnode, rootContainer);
      },
    };

    // 返回的是一个对象 所以我们才可以链式调用mount方法
    return app;
  };
}
