import { NodeTypes } from '../ast'
import { CREATE_ELEMENT_BLOCK } from '../runtimeHelpers'

export function transformElement(ast, context) {
  if (ast.type === NodeTypes.ELEMENT) {
    return () => {
      context.push(CREATE_ELEMENT_BLOCK)

      // 中间层
      // tag
      const vnodeTag = `'${ast.tag}'`

      // prop
      let vnodeProp

      // children
      const children = ast.children
      const vnodeChildren = children[0]

      ast.codegenNode = {
        type: NodeTypes.ELEMENT,
        tag: vnodeTag,
        prop: vnodeProp,
        children: vnodeChildren
      }
    }
  }
}
