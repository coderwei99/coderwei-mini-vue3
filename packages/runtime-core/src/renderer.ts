import { effect } from '@coderwei-mini-vue3/reactive'
import { EMPTY_OBJECT, isFunction, isObject, isOn, isString } from '@coderwei-mini-vue3/shared'
import { ShapeFlags } from '@coderwei-mini-vue3/shared'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { queueJobs } from './scheduler'
import { Fragment, Text } from './vnode'

export function createRenderer(options?) {
  // 从options获取自定义的渲染器
  console.log(options, 'options')

  const {
    createElement: hotCreateElement,
    patchProp: hotPatchProp,
    insert: hotInsert,
    remove: hotRemove,
    setText: hotSetText,
    setElementText: hotSetElementText
  } = options

  function render(vnode, container) {
    // TODO
    patch(null, vnode, container, null)
    // console.log(vnode);
  }

  // patch方法 第一次用来处理挂载 第二次用来处理更新  由n1进行判断
  function patch(n1: any, n2: any, container: any, parentComponent: any, anchor: any = null) {
    // console.log(n1, n2);
    // Fragment\Text 进行单独处理 不要强制在外层套一层div  把外层标签嵌套什么交给用户决定 用户甚至可以决定什么都不嵌套
    const { shapeFlag, type } = n2
    switch (type) {
      case Text:
        processText(n2, container)
        break
      case Fragment:
        mountChildren(n2.children, container, parentComponent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // TODO 字符串 普通dom元素的情况
          // console.log("type == string", n2);
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // TODO 组件的情况
          // console.log("type == Object", n2);
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  // 处理文本节点
  function processText(vnode: any, container: any) {
    mountText(vnode, container)
  }

  // 加工type是string的情况
  function processElement(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    //  判断是挂载还是更新
    if (!n1) {
      // 如果n1 就是旧节点 没有的情况下 就说明是挂载
      mountElement(n2, container, parentComponent, anchor)
    } else {
      // 反之 patch 更新
      patchElement(n1, n2, container, parentComponent)
    }
  }

  // 处理元素是字符串情况下的更新逻辑
  function patchElement(n1: any, n2: any, container: any, parentComponent: any) {
    // console.log("patchElement", n2);
    const oldProps = n1.props || EMPTY_OBJECT
    const newProps = n2.props || EMPTY_OBJECT
    // console.log(el);
    const el = (n2.el = n1.el)
    // console.log("n1", n1);
    // console.log("n2", n2);
    // console.log(el, "el");
    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  // 处理children更新逻辑
  function patchChildren(n1: any, n2: any, container: any, parentComponent: any) {
    /**
   拿到新旧节点的shapeFlag  判断是变化的情况  一般分成四种情况
   * 1. string === array
   * 2. string === string
   * 3. array ==== string
   * 4. array ==== array
   */
    let prevShapeFlag = n1.shapeFlag
    let newShapeFlag = n2.shapeFlag

    // 拿到新旧节点的children
    let prevChildren = n1.children
    let newChildren = n2.children
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新节点是文本节点的情况
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 旧节点是数组的情况   走到这里说明是 array === string的更新
        // console.log("array === string");
        // 1. 卸载节点
        // console.log(container, "container");
        unmountChildren(container)
      }
      // 2. 设置children  children是一个string 直接设置即可 挂载节点  注意新节点是文本节点 所以需要使用的的是setText函数
      // 这里兼容了array ==> string 和 string ==> string的情况  如果旧节点是array 会走上面的if条件 对旧节点进行卸载
      // console.log("prechildren", prevChildren);
      // console.log("newChildren", newChildren);
      console.log('prevChildren', prevChildren)
      console.log('newChildren', newChildren)

      if (prevChildren !== newChildren) {
        hotSetElementText(container, newChildren)
      }
    } else if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 新节点是数组的情况
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 旧节点是文本节点  走到这里说明 string === array
        // console.log("string === array");
        hotSetElementText(container, '')

        // 处理array
        mountChildren(newChildren, container, parentComponent)
      } else {
        // array to array diff算法
        console.log('array to array diff')
        patchKeyedChildren(prevChildren, newChildren, container, parentComponent)
      }
    }
  }

  function patchKeyedChildren(c1: any, c2: any, container: any, parentComponent: any) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // console.log(e1);
    // console.log(e2);
    // console.log("-----");

    function isSomeVNodeType(n1, n2) {
      return n1.type == n2.type && n1.key == n2.key
    }
    // 左端算法  从左边开始找 一直找到两个节点不同为止  相同的就继续递归调用patch 检查children是否相同
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSomeVNodeType(n1, n2)) {
        // 如果为true  就说明 key和 val一致  则直接patch更新
        patch(n1, n2, container, parentComponent)
      } else {
        break
      }
      i++
    }

    // 右端算法
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比旧的长  n1:旧节点  n2:新节点
    console.log(i)
    console.log(e1)
    console.log(e2)

    /**
     * 旧节点: A  B
     * 新节点: A  B  C
     * 因为这里是考虑新的比旧的长  所以需要将多余的节点进行挂载操作 而多余的节点就是从当下标i在旧节点中是null的时候 就代表旧节点遍历完了 从新节点的这个位置开始后面的全都是多的节点 进行挂载
     */
    if (i > e1) {
      if (i <= e2) {
        console.log('新旧节点')
        const nextPros = e2 + 1
        const anchor = e2 + 1 < c2.length ? c2[nextPros].el : null
        // console.log("i+1", i + 1);
        // console.log("c2.length", c2);
        // console.log("c2.length", { ...c2[nextPros] });
        // console.log("c2.length", c2[nextPros]);

        console.log('-----', anchor)
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      console.log('旧节点比新节点长')
      while (i <= e1) {
        hotRemove(c1[i].el)
        i++
      }
    } else {
      // 中间部分
      console.log('diff算法中间部分')
      let s1 = i
      let s2 = i
      let toBePatched = e2 - s2 + 1
      let patched = 0

      // 组织印射表
      /**
       * 首先遍历新节点 由于我们在前面已经进行了左端算法和右端算法  到这个位置的话就剩下中间的乱序部分
       * 我们可以先遍历新节点 将他们组织成印射表 后续可以通过印射表来快速找到某个节点有没有在新的节点中出现过
       * 印射表:{
       *    key:index
       *  }
       * 这里的key 就是用户提供的key  也是我们写v-for循环常常提供的key
       */
      let keyToIndexMap = new Map()

      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

      // 遍历新节点
      for (let i = s1; i <= e2; i++) {
        const prevChildren = c2[i]
        keyToIndexMap.set(prevChildren.key, i)
      }

      // 遍历旧节点
      for (let i = s2; i <= e1; i++) {
        let newIndex
        const prevChildren = c1[i]

        // 优化点: 当新节点的中间部分比旧节点的中间部分长的时候 后续就直接执行remove操作即可 就不需要下面繁琐的比较了
        /**
         * 旧: a,b,(c,e,d),f,g
         * 新: a,b,(e,c),f,g
         *
         * 当指针走到旧节点的e的时候  新节点中间的两个节点已经全都在旧节点中出现过并且patch过了 那么后面的d百分之百是做删除操作的 也就是不会存在于新节点
         */
        if (patched >= toBePatched) {
          hotRemove(prevChildren.el)
        }

        // 这里包含两种情况  null == null || null == undefined
        if (prevChildren.key != null) {
          // 如果旧节点有key的话 就去新节点的印射表中找
          newIndex = keyToIndexMap.get(prevChildren.key)
        } else {
          // 说明用户的旧节点没有key  这个时候就只能for循环挨个遍历了
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(e2[j], prevChildren)) {
              // 如果新节点和旧节点的type 和key 相同  就说明找到了 然后这一层循环就没必要了
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          // 就说明没有找到   需要卸载操作
          hotRemove(prevChildren.el)
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1

          // 找到的话  走patch操作 递归比较children
          patch(prevChildren, c2[newIndex], container, parentComponent)
          patched++
        }
      }

      const incrementNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let j = incrementNewIndexSequence.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        let nextIndex = i + s2
        let nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
        if (newIndexToOldIndexMap[i] == 0) {
          // 如果newIndexToOldIndexMap没有建立对应的隐射关系 说明是新节点 需要patch 创建
          patch(null, nextChild, container, parentComponent, anchor)
        } else {
          if (i != incrementNewIndexSequence[j]) {
            console.log('移动位置')
            hotInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  // 处理props的更新逻辑
  function patchProps(el: any, oldProps: any, newProps: any) {
    for (let key in newProps) {
      const newProp = newProps[key]
      const oldProp = oldProps[key]
      if (newProp !== oldProp) {
        hotPatchProp(el, key, oldProp, newProp)
      }
    }
    for (let key in oldProps) {
      // 新的props没有该属性
      if (!(key in newProps)) {
        hotPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent: any, anchor: any) {
    const el = (vnode.el = hotCreateElement(vnode.type) as HTMLElement)

    const { children, props } = vnode
    // children 可能是数组 也可能是字符串需要分开处理
    if (isString(children)) {
      // el.textContent = children;
      hotSetElementText(el, children)
    } else if (Array.isArray(children)) {
      mountChildren(children, el, parentComponent)
    }

    // 处理props
    for (const key of Object.getOwnPropertyNames(props)) {
      hotPatchProp(el, key, null, props[key])
    }
    // 将创建的dom元素添加在父元素
    hotInsert(el, container, anchor)
    // console.log("container", container.childNodes);
  }

  // 处理children是数组的情况
  function mountChildren(children: any, container: any, parentComponent: any) {
    // 走到这里说明vnode.children是数组 遍历添加到container
    // console.log(children, "children");

    children.forEach((node) => {
      // console.log("处理children是数组的情况", node);
      patch(null, node, container, parentComponent)
    })
  }

  function mountComponent(vnode: any, container: any, parentComponent: any) {
    // 创建组件实例
    const instance = (vnode.component = createComponentInstance(vnode, parentComponent))
    // console.log(instance);

    // 安装组件
    setupComponent(instance)

    // 对子树进行操作
    setupRenderEffect(instance, vnode, container)
  }

  function processComponent(n1: any, n2: any, container: any, parentComponent: any) {
    if (n1) {
      // 如果n1有值说明是更新  如果n1 没有值说明是挂载操作
      updateComponent(n1, n2)
    } else {
      mountComponent(n2, container, parentComponent)
    }
  }

  function updateComponent(n1: any, n2: any) {
    console.log('更新操作')
    const instance = (n2.component = n1.component)

    /**
     * 判断页面内的组件是否需要更新
     * 考虑一下 我们这里的更新逻辑是处理子组件的 当前组件的数据发生变化的时候 我们需要调用这个update方法吗？ 明显不需要
     */
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.el = n2
    }
  }

  function setupRenderEffect(instance: any, initialvnode: any, container: any) {
    // 通过effect进行包裹 会自动收集依赖 帮助我们在用户使用的变量发生变化时更新视图
    instance.update = effect(
      () => {
        // 如果isMouted是true 则证明是组件已经挂载过了 后续执行的是update操作 如果不区分更新和挂载 则造成依赖的数据一旦发生变化就创建一个新的节点
        // console.log(instance.isMouted, "instance");

        if (!instance.isMouted) {
          // console.log("sub", instance.render);
          // console.log("sub", instance.render());
          // 这里我们通过call 对render函数进行一个this绑定  因为我们会在h函数中使用this.xxx来声明的变量

          const subTree = instance.render.call(instance.proxy, instance.proxy)
          instance.subTree = subTree
          // 对子树进行patch操作
          patch(null, subTree, container, instance)
          // console.log(subTree);
          instance.isMouted = true //将isMouted设置为true  代表已挂载 后续执行更新操作

          initialvnode.el = subTree.el
        } else {
          // TODO  update 逻辑
          console.log('更新视图')
          // 这里处理更新的逻辑

          // 处理组件
          const { next, vnode } = instance
          console.log(vnode, '---')
          console.log(next, 'next---')
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }
          // 新的vnode
          const subTree = instance.render.call(instance.proxy, instance.proxy)
          // 老的vnode
          const prevSubTree = instance.subTree
          // 存储这一次的vnode，下一次更新逻辑作为老的vnode
          instance.subTree = subTree
          // console.log("跟着视图走patch");

          patch(prevSubTree, subTree, container, instance)
          // console.log("prevSubTree", prevSubTree);
          // console.log("subTree", subTree);
        }
      },
      {
        scheduler() {
          console.log('没有执行update逻辑  转而执行scheduler参数')
          queueJobs(instance.update)
        }
      }
    )
  }

  // 卸载children
  function unmountChildren(children: any) {
    // console.log("children", children.length);

    for (let i = 0; i < children.length; i++) {
      hotRemove(children[i].el)
    }
  }
  return {
    render,
    createApp: createAppAPI(render)
  }
}

// 更新组件
function updateComponentPreRender(instance: any, nextVnode: any) {
  console.log(instance, 'instance')
  console.log(nextVnode, 'nextVnode')
  instance.vnode = nextVnode
  instance.next = null
  instance.props = nextVnode.props
}

// 移除节点函数
export function remove(child: HTMLElement) {
  const parent = child.parentNode
  // console.log("parent", parent);

  if (parent) {
    parent.removeChild(child)
  }
}

function mountText(vnode: any, container: any) {
  // console.log("vnode", vnode);
  // 因为经过createVNode 函数处理 所以返回的是一个对象  文本在vnode.children下面
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

// 求最长递增子序列算法
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
