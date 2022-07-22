import { hasOwn } from "../shared/index";

export type PublicPropertiesMap = Record<string, (instance: any) => any>;

const publicPropertiesMap: PublicPropertiesMap = {
  $slots: instance => instance.slots,
};

export const publicInstanceProxyHandlers: ProxyHandler<any> = {
  get({ _: instance }, key: string) {
    const { setupState, props } = instance;
    // console.log("key", key);

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      // console.log("hasown", Object.prototype.hasOwnProperty.call(props, key));
      // 用户访问的key是props的某个key
      return props[key];
    }

    const createGetter = publicPropertiesMap[key];
    // console.log(instance);
    if (createGetter) return createGetter(instance);
  },
};
