/**
 *
 * @param target 源对象
 * @param handlers get/set等方法
 * @returns
 */
export function createReactiveObject<T extends object>(target: T, handlers) {
  return new Proxy(target, handlers)
}
