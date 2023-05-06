// 添加事件处理函数的时候需要注意一下
// 1. 添加的和删除的必须是一个函数，不然的话 删除不掉
//    那么就需要把之前 add 的函数给存起来，后面删除的时候需要用到
// 2. nextValue 有可能是匿名函数，当对比发现不一样的时候也可以通过缓存的机制来避免注册多次
// 存储所有的事件函数
export function patchEvent(el: any, key: any, nextValue: any) {
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[key]
  if (nextValue && existingInvoker) {
    // patch
    // 直接修改函数的值即可
    existingInvoker.value = nextValue
  } else {
    const eventName = key.slice(2).toLowerCase()
    if (nextValue) {
      const invoker = (invokers[key] = nextValue)
      el.addEventListener(eventName, invoker)
    } else {
      el.removeEventListener(eventName, existingInvoker)
      invokers[key] = undefined
    }
  }
}
