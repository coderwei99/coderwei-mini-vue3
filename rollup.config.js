import typescript from '@rollup/plugin-typescript'
export default {
  input: './src/index.ts',
  output: [
    {
      file: './lib/guide-toy-vue3.cjs.js',
      format: 'cjs'
    },
    {
      file: './lib/guide-toy-vue3.esm.js',
      format: 'es'
    }
  ],
  plugins: [typescript()]
}
