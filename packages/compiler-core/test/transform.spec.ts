import { baseParse } from '../src/parse'
import { transform } from '../src/transform'

describe('transform', () => {
  describe('happy path', () => {
    it('update text node', () => {
      const ast: any = baseParse('<div>hi,{{ message }}</div>')

      const plugins = (node) => {
        node.content = 'hi,mini-vue'
      }
      transform(ast, {
        nodeTransform: [plugins]
      })
      console.log(ast.codegenNode.children, '-------------------')

      const textNode = ast.children[0].children[0]
      expect(textNode.content).toBe('hi,mini-vue')
    })
  })
})
