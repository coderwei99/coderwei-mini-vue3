import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_BLOCK,
  helperNameMap,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  // 处理插值语法
  if (ast.helpers.length != 0) genFunctionPreamble(ast, context);
  push("return ");
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(",");
  push(`function ${functionName}(${signature}){`);
  push(" return ");

  getNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}

function genFunctionPreamble(ast: any, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const helpers = ast.helpers;

  const ailasHelper = helperName =>
    `${helperNameMap[helperName]}: _${helperNameMap[helperName]}`;
  push(`const { ${helpers.map(ailasHelper).join(", ")} } = ${VueBinging}`);
  push("\n");
}

function getNode(ast, context) {
  switch (ast.type) {
    case NodeTypes.TEXT:
      // 处理文本类型
      genText(ast, context);
      break;

    case NodeTypes.INTERPOLATION:
      // 处理插值类型
      genInterpolation(ast, context);
      break;

    case NodeTypes.SIMPLE_EXPRESSION:
      // 处理表达式 指的是插值类型里面那个变量
      genExpression(ast, context);
      break;

    case NodeTypes.ELEMENT:
      genElement(ast, context);
      break;

    case NodeTypes.COMPOUND_EXPRESSION:
      genCompundExpression(ast, context);
      break;

    default:
      break;
  }
}

function genExpression(ast: any, context) {
  const { push } = context;
  push(`${ast.content}`);
}

function genText(ast: any, context) {
  const { push } = context;
  push(`'${ast.content}'`);
}

function genInterpolation(ast: any, context: any) {
  const { push } = context;
  push(`_${helperNameMap[TO_DISPLAY_STRING]}(`);
  getNode(ast.content, context);
  push(")");
}

function genElement(ast, context) {
  const { push } = context;
  push(`_${helperNameMap[CREATE_ELEMENT_BLOCK]}(`);
  genNodeList(genNullable([ast.tag, ast.prop, ast.children]), context);
  // getNode(ast.children, context);
  push(")");
}

function genNullable(nodesList: any[]) {
  return nodesList.map(node => node || "null");
}

function genNodeList(nodesList: any[], context) {
  const { push } = context;
  for (let i = 0; i < nodesList.length; i++) {
    let node = nodesList[i];
    if (isString(node)) {
      push(node);
    } else {
      getNode(node, context);
    }
    if (i < nodesList.length - 1) {
      push(",");
    }
  }
}

function genCompundExpression(ast: any, context: any) {
  const { children } = ast;
  const { push } = context;

  children.forEach(child => {
    if (isString(child)) {
      push(child);
    } else {
      getNode(child, context);
    }
  });
}

function createCodegenContext() {
  const context = {
    code: "",
    push: source => (context.code += source),
  };

  return context;
}
