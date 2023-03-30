import { baseParse } from "../parse";
import { transform } from "../transform";

describe("transform", () => {
  describe("happy path", () => {
    it("update text node", () => {
      const ast = baseParse("<div>hi,{{ message }}</div>");

      const plugins = node => {
        node.content = "hi,mini-vue";
      };
      transform(ast, {
        nodeTransform: [plugins],
      });
      const textNode = ast.children[0].children[0];
      expect(textNode.content).toBe("hi,mini-vue");
    });
  });
});
