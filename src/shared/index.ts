// 判断是否为一个对象
export function isObject(value: unknown) {
  return typeof value !== null && typeof value === "object";
}

// 判断是否是一个函数
export function isFunction(value: unknown) {
  return typeof value == "function";
}

// 判断是否是一个字符串
export function isString(value: unknown) {
  return typeof value == "string";
}
