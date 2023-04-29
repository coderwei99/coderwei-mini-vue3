export function shouldUpdateComponent(n1: any, n2: any) {
  const { props: preProps } = n1
  const { props: nextProps } = n2

  if (n1.children !== n2.children) {
    return true
  }

  for (const key in nextProps) {
    if (preProps[key] != nextProps[key]) {
      return true
    }
  }

  return false
}
