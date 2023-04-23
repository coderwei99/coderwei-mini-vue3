import { NodeTypes } from '../ast'

export function transformsExpression(ast) {
  if (NodeTypes.INTERPOLATION === ast.type) {
    ast.content.content = '_ctx.' + ast.content.content
  }
}
