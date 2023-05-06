export function patchClass(el, key, nextValue) {
  if (nextValue === null || nextValue === undefined) {
    el.removeAttribute(key)
  } else {
    el.setAttribute(key, nextValue)
  }
}
