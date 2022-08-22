import { NodeTypes } from "../ast";
import { baseParse } from "../parse";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{ message }}");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });

  describe("element", () => {
    test("simple element", () => {
      const ast = baseParse("<div></div>");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
      });
    });
  });

  describe("text", () => {
    test("simple text", () => {
      const ast = baseParse("mini vue");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "mini vue",
      });
    });
  });
});
