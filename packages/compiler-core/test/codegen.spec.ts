import { transform } from '../src/transform'
import { generate } from '../src/codegen'
import { baseParse } from '../src/parse'
import { transformsExpression } from '../src/transforms/transformsExpression'
import { transformElement } from '../src/transforms/transformElement'
import { transformText } from '../src/transforms/transformText'

describe('codegen', () => {
  it('happy path', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
  it('interpolation', () => {
    const ast = baseParse('{{message}}')

    transform(ast, {
      nodeTransform: [transformsExpression]
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')
    transform(ast, {
      nodeTransform: [transformsExpression, transformElement, transformText]
    })

    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
