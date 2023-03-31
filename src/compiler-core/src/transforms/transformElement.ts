import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_BLOCK } from "../runtimeHelpers";

export function transformElement(ast, context) {
  if (ast.type === NodeTypes.ELEMENT) {
    context.push(CREATE_ELEMENT_BLOCK);
  }
}
