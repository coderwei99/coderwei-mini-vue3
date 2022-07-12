import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("should return updated value", () => {
    const value = reactive({ foo: 1 });
    const cValue = computed(() => value.foo);
    expect(cValue.value).toBe(1);
  });
});
