// 判断是否为一个对象
export function isObject(value: unknown) {
  return typeof value !== null && typeof value === 'object'
}

// 判断是否是一个函数
export function isFunction(value: unknown): boolean {
  return typeof value == 'function'
}

// 判断是否是一个字符串
export function isString(value: unknown) {
  return typeof value == 'string'
}

// 判断是否是一个布尔值
export function isBoolean(value: unknown) {
  return typeof value == 'boolean'
}

// 判断是否是相同的值 如果ref是相同的值 就不需要触发依赖
export function hasChanged(value, oldValue) {
  return Object.is(value, oldValue)
}

// 判断是否为数组
export const isArray = Array.isArray

// 判断某个key是否在指定对象上
export const hasOwn = (target: any, key: any) => Object.prototype.hasOwnProperty.call(target, key)

// 去除用户输入的事件名中间的-  比如说: 'my-btn-click'  ===> myBtnClick
export const camelCase = (str: string) => {
  // console.log("str", str);

  return str.replace(/-(\w)/g, (_, $1: string) => {
    return $1.toUpperCase()
  })
}

// 首字母大写处理
export const capitalize = (str: string) => {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

// 事件名前面+on  并且确保on后的第一个字母为大写
export const toHandlerKey = (eventName: string) => {
  return eventName ? 'on' + capitalize(eventName) : ''
}

//判断字符串是否以on开头并且第三个字符为大写
// example: onClick ==> true、 onclick ==> false
export const isOn = (key: string) => /^on[A-Z]/.test(key)

// 空对象
export const EMPTY_OBJECT = {}

// 对象上面的拷贝方法
export const extend = Object.assign

// 循环执行数组中的方法
export const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg)
  }
}

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string => {
  return objectToString.call(value)
}
export const toRawType = (value: unknown): string => {
  // [object String] // 只要String 这部分
  return toTypeString(value).slice(8, -1)
}
