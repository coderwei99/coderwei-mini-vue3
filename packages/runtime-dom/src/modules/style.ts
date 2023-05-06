// 处理浏览器端 元素style样式
export function patchStyle(el, value) {
  console.log(value)
  const { style } = el
  for (const key in value) {
    style[key] = value[key]
  }
}
