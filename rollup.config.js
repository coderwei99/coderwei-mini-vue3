import typescript from "@rollup/plugin-typescript";
export default {
  input: "./packages/vue/src/index.ts",
  output: [
    {
      file: "./lib/vue3.cjs.js",
      format: "cjs",
    },
    {
      file: "./lib/vue3.esm.js",
      format: "es",
    },
  ],
  plugins: [typescript()],
};