import { generate } from './codegen'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms/transformElement'
import { transformsExpression } from './transforms/transformsExpression'
import { transformText } from './transforms/transformText'

export const baseCompile = (template) => {
  const ast = baseParse(template)
  transform(ast, {
    nodeTransform: [transformsExpression, transformElement, transformText]
  })

  return generate(ast)
}
