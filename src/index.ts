export * from "./runtime-dom";

import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";

import { createCompiler } from "./runtime-core";

function compilerToFunction(template) {
  const { code } = baseCompile(template);

  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

createCompiler(compilerToFunction);
