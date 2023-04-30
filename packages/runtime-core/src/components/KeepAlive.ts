import { isArray, isString, ShapeFlags } from '@coderwei-mini-vue3/shared'
import { getCurrentInstance } from '../component'
import { h } from '../h'
import { isSomeVNodeType, isVnode } from '../vnode'

function matches(source, name) {
  // 三种情况  第一种是Array  第二种是字符串 第三种是正则表达式
  // <!-- 以英文逗号分隔的字符串 -->
  // <KeepAlive include="a,b">
  // </KeepAlive>

  // <!-- 正则表达式 (需使用 `v-bind`) -->
  // <KeepAlive :include="/a|b/">
  // </KeepAlive>

  // <!-- 数组 (需使用 `v-bind`) -->
  // <KeepAlive :include="['a', 'b']">
  // </KeepAlive>
  if (isArray(source)) {
    return source.some((a) => a === name)
  } else if (source.test) {
    // 如果有test方法说明是一个正则
    return source.test(name)
  } else if (isString(source)) {
    return source.split(',').some((a) => a === name)
  }
  return false
}

const KeepAliveImpl = {
  name: 'KeepAlive',
  __isKeepAlive: true,
  props: {
    include: [RegExp, String, Array],
    exclude: [RegExp, String, Array],
    max: [String, Number]
  },
  setup(props, { slots }) {
    // cache 是保存缓存的虚拟节点
    const cache = new Map()
    // keys用来保存key 当我们去cache中拿虚拟节点的时候需要提供一个key 这个keys就是保存的提供的key 至于为什么要单独保存这个key呢
    // 要注意keys是一个Set类型  他是有序的  我们可以通过keys.values().next().value去拿到第一次被插入到keys的元素  然后LRU算法的时候直接把这个key删掉即可
    const keys = new Set()
    let current
    const instance = getCurrentInstance()
    console.log(cache, instance)
    const sharedContext = instance.ctx

    const {
      renderer: {
        m: move,
        o: { createElement },
        um: _unmount
      }
    } = instance.ctx

    const storageContainer = createElement('div')

    sharedContext.deactivate = function (vnode) {
      move(vnode, storageContainer)
    }
    sharedContext.activate = function (vnode, container, anchor) {
      move(vnode, container, anchor)
    }

    function unmount(vnode) {
      vnode = resetShapeFlag(vnode)

      _unmount(vnode)
    }

    return () => {
      const children = slots.default()
      const rawVNode = children[0]

      // 为什么要拷贝一份vNode出来呢？ 这里简化了流程 在我们这种情况下即便是不拷贝一份出来也无所谓 源码用了getInnerChild方法确保返回的是虚拟节点
      // 当包裹在suspense组件内部时，具体的节点保存在vnode.ssContent 前提是外面是一个suspense组件，我们需要拿里面的ssContent 但是我们要返回的还是rawVNode，所以我们不能修改rawVNode
      // 不然的话 返回的时候就返回不了了
      // 我的判断: 如果你是拿
      /**
       * 例子
       * 直接修改rawVNode的值
       * if(vnode.shapeFlag & ShapeFlags.SUSPENSE){
       *    rawVNode = rawVNode.ssContent
       * }else{
       *    rawVnode = rawVNode
       * }
       * 后续我们想要返回最开始的rawVNode的时候 发现找不到了 被覆盖了  直接寄  所以考虑拷贝一份出来 **在正常情况下vNode和rawVNode保持一致，但是在suspense组件的情况下vNode保存的是rawVNode.ssContent**
       */
      let vNode = rawVNode
      const comp = vNode.type
      const name = comp.name

      // KeepAlive组件是只能传入一个组件
      if (children.length > 1) {
        current = null
        return children
      }

      if (!isVnode(vNode) || !(vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)) {
        // 如果不是一个节点 或者不是一个组件 是无法被缓存的
        current = null
        return rawVNode
      }
      const { include, exclude, max } = props
      // 如果不匹配用户传入的include\匹配exclude 也直接返回
      // include 和exclude 是对等的，存在于include就不能存在于exclude中了， 举个例子: 学校假期调研,留校的填a表单,离校的填b表单,你两个表单都填,明显不符合实际情况  所以就衍生了下面的判断条件
      if (
        (include && (!name || !matches(include, name))) ||
        // 如果一个组件连name都没有 那么肯定是缓存不了的  因为找不到他 所以肯定不是缓存的他
        (exclude && name && matches(exclude, name))
        // 排除一个组件 肯定需要name  如果这个组件连name都没有 肯定排除的不是他  因为找不到他  简而言之 一个组件没有name 排除不了且缓存不了 就是不需要缓存
      ) {
        current = null
        return rawVNode
      }

      // 将key保存到keys集合
      keys.add(vNode.type)
      const cacheVNode = cache.get(vNode.type)
      if (cacheVNode) {
        // 有值 说明被缓存过
        vNode.component = cacheVNode.component
        vNode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE
        // 让当前key变得活跃 也就是位于keys集合的后面
        keys.delete(vNode.type)
        keys.add(vNode.type)
      } else {
        // 缓存 在源码中 这个位置他并没有去缓存组件 他缓存组件的地方是setup函数内，就是说他在组件进来的一瞬间 直接缓存 不考虑其他的  这里他就只需要考虑是否需要进行LRU算法来移除最不活跃的组件 也就是最久没有访问的那个组件
        // https://leetcode.cn/problems/lru-cache/ 关于LRU算法可以见leetcode这道题

        keys.add(vNode.type)
        // 判断是否超过max
        if (max && keys.size > parseInt(max, 10)) {
          const deleteKey = keys.values().next().value
          const cached = cache.get(deleteKey)
          if (!isSomeVNodeType(cached, current)) {
            unmount(cached)
          }
          cache.delete(deleteKey)
          keys.delete(deleteKey)
        }
        cache.set(rawVNode.type, vNode)
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

export function resetShapeFlag(vnode) {
  vnode.shapeFlag &= ~ShapeFlags.COMPONENT_KEPT_ALIVE
  vnode.shapeFlag &= ~ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE
  return vnode
}
