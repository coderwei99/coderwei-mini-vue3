import { transform } from "../transform";
import { generate } from "../codegen";
import { baseParse } from "../parse";
import { transformsExpression } from "../transforms/transformsExpression";

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
