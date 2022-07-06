export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      return Reflect.get(target, key);
    },
    set(target, key, val) {
      return Reflect.set(target, key, val);
    },
  });
}
