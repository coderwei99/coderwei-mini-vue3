import { hasOwn } from "../shared/index";

export const publicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }, key) {
    const { setupState } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    }
    // 如果为false 说明用户访问的可能是$slots、props 等 这些元素不是挂载在setupState里面的 另外处理
  },
};
