// 判断是否为一个对象
export function isObject(value: unknown) {
  return typeof value !== null && typeof value === "object";
}
