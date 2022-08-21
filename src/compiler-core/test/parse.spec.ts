import { baseParse } from "../parse";

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{message}}</div>");
      expect(ast.children[0]).toStrictEqual({
        type: "interpolation",
        content: {
          type: "simple_expression",
          content: "message",
        },
      });
    });
  });
});
