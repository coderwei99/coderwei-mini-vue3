import { transform } from "../src/transform";
import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";
import { transformsExpression } from "../src/transforms/transformsExpression";

describe("codegen", () => {
  it("happy path", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
  it("interpolation", () => {
    const ast = baseParse("{{message}}");

    transform(ast, {
      nodeTransform: [transformsExpression],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
