import { isFunction } from '@coderwei-mini-vue3/shared'
import { getCurrentInstance } from './component'

// provide 函数的实现
export function provide<T>(key: string | number, value: T) {
  let currentInstance = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent?.provides
    // console.log("provides", provides);
    // console.log("parentProvides", parentProvides);

    if (provides === parentProvides) {
      // 把provide原型指向父组件的provide
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

// inject 函数的实现
export function inject(key: string | any, defaultValue?: any) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    const parentProvide = currentInstance.parent.provides
    if (key in parentProvide) {
      return parentProvide[key]
    } else {
      if (isFunction(defaultValue)) {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
