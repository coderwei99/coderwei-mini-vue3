export function isSuspense(vnode) {
  return !!vnode.__isSuspense
}

const SuspenseImpl = {
  __isSuspense: true,
  process(n1, n2) {
    if (!n1) {
    } else {
    }
  }
}

export const Suspense = SuspenseImpl
