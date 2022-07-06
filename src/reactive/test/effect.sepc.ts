import { reactive } from "../reactive";
import { effect } from "../effect";
describe("effect", () => {
  it.skip("happy path", () => {
    const user = reactive({
      age: 19,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(19);
    // user.age++;
    // expect(nextAge).toBe(20);
  });
});
