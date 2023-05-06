// 定义关于浏览器的渲染器
import { isOn } from '@coderwei-mini-vue3/shared'
import { createRenderer } from '@coderwei-mini-vue3/runtime-core'

import { patchEvent } from './modules/event'
import { patchClass } from './modules/class'
import { patchStyle } from './modules/style'

function createElement(type) {
  // console.log('create el 操作', type)
  const element = document.createElement(type)
  return element
}

function createText(text) {
  return document.createTextNode(text)
}

function setText(node: HTMLElement, text) {
  // console.log('调用到这里了', node, text)

  node.nodeValue = text
}

function setElementText(el, text) {
  // console.log('SetElementText', el, text)
  el.textContent = text
}

function patchProp(el, key, preValue, nextValue) {
  // preValue 之前的值
  // 为了之后 update 做准备的值
  // nextValue 当前的值
  // console.log(`PatchProp 设置属性:${key} 值:${nextValue}`)
  // console.log(`key: ${key} 之前的值是:${preValue}`)

  if (isOn(key)) {
    patchEvent(el, key, nextValue)
  } else if (key === 'style') {
    patchStyle(el, nextValue)
  } else {
    patchClass(el, key, nextValue)
  }
}

function insert(child, parent, anchor = null) {
  // console.log('Insert操作')
  parent.insertBefore(child, anchor)
}

function remove(child) {
  const parent = child.parentNode
  if (parent) {
    parent.removeChild(child)
  }
}

function querySelect(note) {
  return document.querySelector(note)
}

let renderer

function ensureRenderer() {
  // 如果 renderer 有值的话，那么以后都不会初始化了
  return (
    renderer ||
    (renderer = createRenderer({
      createElement,
      createText,
      setText,
      setElementText,
      patchProp,
      insert,
      remove,
      querySelect
    }))
  )
}

export const createApp = (...args) => {
  return ensureRenderer().createApp(...args)
}

export * from '@coderwei-mini-vue3/runtime-core'
