import { isFunction } from '@coderwei-mini-vue3/shared'

export function defineComponent(options: unknown) {
  return isFunction(options) ? { setup: options, name: (options as Function).name } : options
}
