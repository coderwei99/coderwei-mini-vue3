import { hasOwn } from "../shared/index";

export const publicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }, key: string) {
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      console.log("hasown", Object.prototype.hasOwnProperty.call(props, key));
      // 用户访问的key是props的某个key
      return props[key];
    }
  },
};
