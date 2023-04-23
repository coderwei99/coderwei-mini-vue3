import { h, ref, reactive } from '../../lib/vue3.esm.js'
export default {
  name: "Child",
  setup(props, { emit }) { },
  render(proxy) {
    return h("div", {}, [h("div", {}, "child" + this.$props.msg)]);
  },
};