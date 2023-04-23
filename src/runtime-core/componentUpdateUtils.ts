export function shouldUpdateComponent(n1: any, n2: any) {
  const { props: preProps } = n1
  const { props: nextProps } = n2
  for (const key in nextProps) {
    if (preProps[key] != nextProps[key]) {
      return true
    }
  }

  return false
}
