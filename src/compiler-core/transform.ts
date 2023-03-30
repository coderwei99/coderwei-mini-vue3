// 思路 遍历整个ast语法树 采取深度遍历优先 一条路走到黑

// 采用插件的形式 我们在transform内部去修改node文本的值，其实并不合适，当我们去写其他测试的时候，又要来修改transform遍历的时候的逻辑，其实这里可以采取另一种思路
// 比如说 采用插件的思想，做什么操作由外部通过options传递进来，然后在合适的地方进行调用，而我们这个demo合适的地方就是我们本来修改文本的值的位置
import { NodeTypes } from "./ast";

export const transform = (ast, options: any = {}) => {
  const context = createTransformContext(ast, options);

  dfs(ast, context);
};

// 遍历整个ast语法树
const dfs = (node, context) => {
  // 修改text文本的值 外面传入的修改方法 如何修改给外部决定如何执行
  if (node.type === NodeTypes.TEXT) {
    const nodeTransform = context.nodeTransform;
    nodeTransform.forEach(fn => {
      fn && fn(node);
    });
  }

  dfsChildren(node, context);
};

// 遍历ast语法树children
function dfsChildren(node: any, context: any) {
  if (node.children) {
    node.children.forEach(childrenItem => {
      dfs(childrenItem, context);
    });
  }
}

// 创建transform全局上下文
function createTransformContext(root, options: any) {
  return {
    nodeTransform: options.nodeTransform || [],
    root,
  };
}
