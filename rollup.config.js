import typescript from "@rollup/plugin-typescript";
import sourceMaps from "rollup-plugin-sourcemaps";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "./packages/vue/src/index.ts",
  output: [
    {
      file: "./packages/vue/lib/vue3.cjs.js",
      format: "cjs",
      sourcemap:true
    },
    {
      name:"vue",
      file: "./packages/vue/lib/vue3.esm.js",
      format: "es",
      sourcemap:true
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    sourceMaps()
  ],
};