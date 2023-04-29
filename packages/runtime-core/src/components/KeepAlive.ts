import { ShapeFlags } from '@coderwei-mini-vue3/shared'
import { getCurrentInstance } from '../component'
import { h } from '../h'

const KeepAliveImpl = {
  name: 'KeepAlive',
  __isKeepAlive: true,
  props: {
    include: [RegExp, String, Array],
    exclude: [RegExp, String, Array],
    max: [String, Number]
  },
  setup(props, mo) {
    const cache = new Map()
    let current
    const instance = getCurrentInstance()
    console.log(cache, instance)
    const sharedContext = instance.ctx

    const {
      renderer: {
        m: move,
        o: { createElement }
      }
    } = instance.ctx

    const storageContainer = createElement('div')

    sharedContext.deactivate = function (vnode) {
      move(vnode, storageContainer)
    }
    sharedContext.activate = function (vnode, container, anchor) {
      move(vnode, container, anchor)
    }

    return () => {
      const children = mo.slots.default()
      const rawVNode = children[0]

      let vNode = rawVNode
      const comp = vNode.type
      const name = comp.name

      const cacheVNode = cache.get(rawVNode.type)
      if (cacheVNode) {
        // 有值 说明被缓存过
        rawVNode.component = cacheVNode.component
        vNode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
      } else {
        // 缓存
        cache.set(rawVNode.type, rawVNode)
      }
      vNode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
      rawVNode.keepAliveInstance = instance
      current = vNode
      ;(window as any).cacheMap = cache
      return rawVNode
    }
  }
}

export const KeepAlive = KeepAliveImpl

export function isKeepAlive(node) {
  return node && !!node.type.__isKeepAlive
}
