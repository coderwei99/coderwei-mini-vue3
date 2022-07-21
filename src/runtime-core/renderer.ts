import { isObject, isString } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // TODO
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  // console.log(vnode);
  if (typeof vnode.type == "string") {
    // TODO 字符串 普通dom元素的情况
    // console.log("type == string", vnode);

    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // TODO 组件的情况
    // console.log("type == Object", vnode);

    mountComponent(vnode, container);
  }
}

function mountComponent(vnode: any, container: any) {
  processComponent(vnode, container);
}

function processComponent(vnode: any, container: any) {
  // 创建组件实例
  const instance = createComponentInstance(vnode);
  // console.log(instance);

  // 安装组件
  setupComponent(instance);

  // 对子树进行操作
  setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance: any, vnode: any, container: any) {
  // 这里我们通过call 对render函数进行一个this绑定  因为我们会在h函数中使用this.xxx来声明的变量
  const subTree = instance.render.call(instance.proxy);

  // 对子树进行patch操作
  patch(subTree, container);
  // console.log(subTree);

  vnode.el = subTree.el;
}

//判断字符串是否以on开头并且第三个字符为大写
// example: onClick ==> true、 onclick ==> false
export const isOn = (key: string) => /^on[A-Z]/.test(key);

// 加工type是string的情况
function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type) as HTMLElement;

  const { children, props } = vnode;
  // children 可能是数组 也可能是字符串需要分开处理
  if (isString(children)) {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // 如果是数组 说明是一个嵌套dom元素
    mountChildren(vnode, el);
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
  container.append(el);
}

// 处理children是数组的情况
function mountChildren(vnode: any, container: any) {
  // 走到这里说明vnode.children是数组 遍历添加到container
  vnode.children.forEach(node => {
    patch(node, container);
  });
}
