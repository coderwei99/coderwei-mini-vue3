import { reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    let original = { age: 1 };
    let observed = reactive(original);
    expect(original).not.toBe(observed);
    expect(observed.age).toBe(1);
  });
});
