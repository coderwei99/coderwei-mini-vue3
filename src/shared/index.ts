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

// 判断某个key是否在指定对象上
export const hasOwn = (target: any, key: any) =>
  Object.prototype.hasOwnProperty.call(target, key);

// 去除用户输入的事件名中间的-  比如说: 'my-btn-click'  ===> myBtnClick
export const camelCase = (str: string) => {
  // console.log("str", str);

  return str.replace(/-(\w)/g, (_, $1: string) => {
    return $1.toUpperCase();
  });
};

// 首字母大写处理
export const capitalize = (str: string) => {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};

// 事件名前面+on  并且确保on后的第一个字母为大写
export const toHandlerKey = (eventName: string) => {
  return eventName ? "on" + capitalize(eventName) : "";
};
