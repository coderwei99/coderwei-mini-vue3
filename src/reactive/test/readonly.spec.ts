import { readonly } from "../reactive";

describe("readonly", () => {
  it("readonly not set", () => {
    let original = {
      foo: {
        fuck: {
          name: "i don't care",
        },
      },
      arr: [{ color: "#fff" }],
    };
    let warper = readonly(original);
    expect(warper).not.toBe(original);
    expect(warper.foo.fuck.name).toBe("i don't care");
  });
  it("warning when it be call set operation", () => {
    let original = {
      username: "ghx",
    };
    let readonlyObj = readonly(original);
    const warn = jest.spyOn(console, "warn");
    // 给readonly做set操作，将会得到一个warning
    readonlyObj.username = "danaizi";
    expect(warn).toHaveBeenCalled();
  });
});
