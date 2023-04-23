export * from '@coderwei-mini-vue3/runtime-dom'

import { baseCompile } from '@coderwei-mini-vue3/compiler-core'
import * as runtimeDom from '@coderwei-mini-vue3/runtime-dom'

import { createCompiler } from '@coderwei-mini-vue3/runtime-dom'

function compilerToFunction(template) {
  const { code } = baseCompile(template)

  const render = new Function('Vue', code)(runtimeDom)
  return render
}

createCompiler(compilerToFunction)
