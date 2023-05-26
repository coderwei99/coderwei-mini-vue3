import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'

describe('Parse', () => {
  describe('interpolation', () => {
    it('simple interpolation', () => {
      const ast = baseParse('{{ message }}')
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  })

  describe('element', () => {
    it('simple element', () => {
      const ast = baseParse('<div></div>')
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        props: [],
        tag: 'div',
        tagType: 0,
        children: []
      })
    })
  })

  describe('text', () => {
    it('simple text', () => {
      const ast = baseParse('mini vue')
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'mini vue'
      })
    })
  })

  test('hello word', () => {
    const ast = baseParse('<div>hi,{{message}}</div>')
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      props: [],
      tagType: 0,
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi,'
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('Nestedn element', () => {
    const ast = baseParse('<div><p>hi</p>{{message}}</div>')
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      props: [],
      tagType: 0,
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          props: [],
          tagType: 0,
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi'
            }
          ]
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('should throw error when lack end tag', () => {
    // const ast = baseParse("<div><span></div>");
    expect(() => {
      baseParse('<div><span></div>')
    }).toThrow('没有结束标签')
  })

  test('compiler v-for', () => {
    const ast = baseParse("<div v-for='item in userInfoList'>{{item}}</div>")
    const o = ast
    // 期望最后解析的ast语法树对象
    let expectAst = {
      type: NodeTypes.ROOT,
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'div',
          tagType: 0,
          props: [
            {
              type: NodeTypes.DIRECTIVE,
              name: 'for'
            }
          ],
          children: [
            {
              type: NodeTypes.INTERPOLATION,
              content: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: 'item'
              }
            }
          ]
        }
      ]
    }

    expect(ast).toStrictEqual(expectAst)
  })
})
