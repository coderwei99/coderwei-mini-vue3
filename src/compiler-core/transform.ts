// 思路 遍历整个ast语法树 采取深度遍历优先 一条路走到黑

// 采用插件的形式 我们在transform内部去修改node文本的值，其实并不合适，当我们去写其他测试的时候，又要来修改transform遍历的时候的逻辑，其实这里可以采取另一种思路
// 比如说 采用插件的思想，做什么操作由外部通过options传递进来，然后在合适的地方进行调用，而我们这个demo合适的地方就是我们本来修改文本的值的位置
import { NodeTypes } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export const transform = (ast, options: any = {}) => {
  const context = createTransformContext(ast, options);

  dfs(ast, context);

  ast.codegenNode = ast.children[0];

  ast.helpers = [...context.helpers.keys()];
};

// 遍历整个ast语法树
const dfs = (node, context) => {
  // 修改text文本的值 外面传入的修改方法 如何修改给外部决定如何执行
  const nodeTransform = context.nodeTransform;
  nodeTransform.forEach(fn => {
    fn && fn(node);
  });

  // 插值语法  在context.helps(数组)上添加一项toDisplayString，用于后续生成js的时候引入，后续插值语法生成的js需要借助这些工具函数
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.push(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      dfsChildren(node, context);
      break;
    default:
      break;
  }
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
    helpers: new Map(),
    push(helperName) {
      this.helpers.set(helperName, 1);
    },
  };
}
