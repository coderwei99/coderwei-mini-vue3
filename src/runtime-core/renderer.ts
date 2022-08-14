import { effect } from "../reactive/effect";
import { EMPTY_OBJECT, isFunction, isObject, isOn, isString } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options?) {
  // 从options获取自定义的渲染器
  console.log(options, "options");

  const {
    createElement: hotCreateElement,
    patchProp: hotPatchProp,
    insert: hotInsert,
  } = options;

  function render(vnode, container) {
    // TODO
    patch(null, vnode, container, null);
    // console.log(vnode);
  }

  // patch方法 第一次用来处理挂载 第二次用来处理更新  由n1进行判断
  function patch(n1: any, n2: any, container: any, parentComponent: any) {
    // console.log(n1, n2);
    if (!n2) return;
    // Fragment\Text 进行单独处理 不要强制在外层套一层div  把外层标签嵌套什么交给用户决定 用户甚至可以决定什么都不嵌套
    if (n2.type == Fragment) {
      // console.log(vnode, "vnode === far");

      mountChildren(n2.children, container, parentComponent);
    }
    if (n2.type == Text) {
      processText(n2, container);
    }

    if (typeof n2.type == "string") {
      // TODO 字符串 普通dom元素的情况
      // console.log("type == string", n2);

      processElement(n1, n2, container, parentComponent);
    } else if (isObject(n2.type)) {
      // TODO 组件的情况
      // console.log("type == Object", n2);

      mountComponent(n2, container, parentComponent);
    }
  }

  // 处理文本节点
  function processText(vnode: any, container: any) {
    mountText(vnode, container);
  }

  // 加工type是string的情况
  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    //  判断是挂载还是更新
    if (!n1) {
      // 如果n1 就是旧节点 没有的情况下 就说明是挂载
      mountElement(n2, container, parentComponent);
    } else {
      // 反之 patch 更新
      patchElement(n1, n2, container, parentComponent);
    }
  }

  // 处理元素是字符串情况下的更新逻辑
  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    // console.log("patch", n2);
    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;
    // console.log(el);
    const el = (n2.el = n1.el);
    // console.log(n1);
    // console.log(n2);
    // console.log(el, "el");
    patchChildren(n1, n2, el, parentComponent);
    patchProps(el, oldProps, newProps);
  }

  // function patchProp(el, key, oldValue, newValue) {
  //   if (Array.isArray(newValue)) {
  //     el.setAttribute(key, newValue.join(" "));
  //   } else if (isOn(key) && isFunction(newValue)) {
  //     el.addEventListener(key.slice(2).toLowerCase(), newValue);
  //   } else {
  //     if (newValue === null || newValue === undefined) {
  //       // 删除
  //       el.removeAttribute(key);
  //     } else {
  //       el.setAttribute(key, newValue);
  //     }
  //   }
  // }

  // 处理children更新逻辑
  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    /**
   拿到新旧节点的shapeFlag  判断是变化的情况  一般分成四种情况
   * 1. string === array
   * 2. string === string
   * 3. array ==== string
   * 4. array ==== array
   */
    let prevShapeFlag = n1.shapeFlag;
    let newShapeFlag = n2.shapeFlag;

    // 拿到新旧节点的children
    let prevChildren = n1.children;
    let newChildren = n2.children;
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新节点是文本节点的情况
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 旧节点是数组的情况   走到这里说明是 array === string的更新
        // console.log("array === string");
        // 1. 卸载节点
        // console.log(container, "container");

        unmountChildren(container);
      }
      // 2. 设置children  children是一个string 直接设置即可
      // console.log("prechildren", prevChildren);
      // console.log("newChildren", newChildren);
      if (prevChildren !== newChildren) {
        container.textContent = newChildren;
      }
    } else if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 新节点是数组的情况
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 旧节点是文本节点  走到这里说明 string === array
        // console.log("string === array");
        container.textContent = "";
        // 处理array
        mountChildren(newChildren, container, parentComponent);
      }
    }
  }

  // 处理props的更新逻辑
  function patchProps(el: any, oldProps: any, newProps: any) {
    for (let key in newProps) {
      const newProp = newProps[key];
      const oldProp = oldProps[key];
      if (newProp !== oldProp) {
        hotPatchProp(el, key, oldProp, newProp);
      }
    }
    for (let key in oldProps) {
      // 新的props没有该属性
      if (!(key in newProps)) {
        hotPatchProp(el, key, oldProps[key], null);
      }
    }
  }

  function mountElement(vnode: any, container: any, parentComponent: any) {
    const el = (vnode.el = hotCreateElement(vnode.type) as HTMLElement);

    const { children, props } = vnode;
    // children 可能是数组 也可能是字符串需要分开处理
    if (isString(children)) {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      mountChildren(children, el, parentComponent);
    }

    // 处理props
    for (const key of Object.getOwnPropertyNames(props)) {
      if (Array.isArray(props[key])) {
        // 数组的情况 比如说class 用户可能给多个class  所以说以空格进行分隔
        /**
         * example
         * h('div',{class:['name','activeName']},'hello vue')
         * 真实dom: <div class = 'name activeName'>hello vue</div>
         */
        el.setAttribute(key, props[key].join(" "));
      } else if (isOn(key)) {
        // 走到这里说明是事件 需要给dom元素添加对应的事件
        el.addEventListener(key.slice(2).toLocaleLowerCase(), props[key]);
      } else {
        // 单纯的字符串 直接添加属性即可
        el.setAttribute(key, props[key]);
      }
    }
    // 将创建的dom元素添加在父元素
    hotInsert(el, container);
    // console.log("container", container.childNodes);
  }

  // 处理children是数组的情况
  function mountChildren(children: any, container: any, parentComponent: any) {
    // 走到这里说明vnode.children是数组 遍历添加到container
    // console.log(children, "children");

    children.forEach(node => {
      // console.log("处理children是数组的情况", node);

      patch(null, node, container, parentComponent);
    });
  }

  function processComponent(vnode: any, container: any, parentComponent: any) {
    // 创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    // console.log(instance);

    // 安装组件
    setupComponent(instance);

    // 对子树进行操作
    setupRenderEffect(instance, vnode, container);
  }

  function mountComponent(vnode: any, container: any, parentComponent: any) {
    processComponent(vnode, container, parentComponent);
  }

  function setupRenderEffect(instance: any, vnode: any, container: any) {
    // 通过effect进行包裹 会自动收集依赖 帮助我们在用户使用的变量发生变化时更新视图
    effect(() => {
      //如果isMouted是true 则证明是组件已经挂载过了 后续执行的是update操作 如果不区分更新和挂载 则造成依赖的数据一旦发生变化就创建一个新的节点
      // console.log(instance.isMouted, "instance");

      if (!instance.isMouted) {
        // console.log("sub", instance.render);
        // console.log("sub", instance.render());
        // 这里我们通过call 对render函数进行一个this绑定  因为我们会在h函数中使用this.xxx来声明的变量

        const subTree = instance.render.call(instance.proxy);
        instance.subTree = subTree;
        // 对子树进行patch操作
        patch(null, subTree, container, instance);
        // console.log(subTree);
        instance.isMouted = true; //将isMouted设置为true  代表已挂载 后续执行更新操作

        vnode.el = subTree.el;
      } else {
        // TODO  update 逻辑
        // console.log("跟新视图");
        // 这里处理更新的逻辑
        // 新的vnode
        const subTree = instance.render.call(instance.proxy);
        // 老的vnode
        const prevSubTree = instance.subTree;
        // 存储这一次的vnode，下一次更新逻辑作为老的vnode
        instance.subTree = subTree;
        // console.log("跟着视图走patch");

        patch(prevSubTree, subTree, container, instance);
        // console.log("prevSubTree", prevSubTree);
        // console.log("subTree", subTree);
      }
    });
  }

  return {
    render,
    createApp: createAppAPI(render),
  };
}

// 卸载children
function unmountChildren(children: any) {
  // console.log("children", children.length);

  for (let i = 0; i < children.length; i++) {
    remove(children[i].el);
  }
}

// 移除节点函数
export function remove(child: HTMLElement) {
  const parent = child.parentNode;
  // console.log("parent", parent);

  if (parent) {
    parent.removeChild(child);
  }
}

function mountText(vnode: any, container: any) {
  // console.log("vnode", vnode);
  // 因为经过createVNode 函数处理 所以返回的是一个对象  文本在vnode.children下面
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
