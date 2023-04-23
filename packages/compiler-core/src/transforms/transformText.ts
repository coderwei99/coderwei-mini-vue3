import { NodeTypes } from '../ast'

function isTextorInterpolation(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}

export function transformText(ast) {
  // 前提是element类型
  if (ast.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = ast
      let currentContainer
      for (let i = 0; i < children.length; i++) {
        // 如果是text或者插值类型 就将他们组合成一个新的类型
        if (isTextorInterpolation(children[i])) {
          for (let j = i + 1; j < children.length; j++) {
            if (isTextorInterpolation(children[j])) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [children[i]]
                }
              }

              currentContainer.children.push(' + ')
              currentContainer.children.push(children[j])
              ast.children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}
