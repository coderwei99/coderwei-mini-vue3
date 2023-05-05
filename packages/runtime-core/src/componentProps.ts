function resolvePorp(propsOptions, rawprops) {
  const props = {}
  const attrs = {}
  /* 
    propsOptions{
      name:{
        type:String,
        default:'xxx'
      },
      age:{
        type:Number,
        default:xxx
      }
    }

    rawProps:{
      name:"coderwei",
      age:19,
      number: 95527666,
      cart: 'bar'
    }
  */
  const keys = Object.keys(propsOptions)
  if (rawprops) {
    for (const key in rawprops) {
      if (keys.includes(key)) {
        props[key] = rawprops[key]
      } else {
        // 作为attrs
        attrs[key] = rawprops[key]
      }
    }
  }

  return {
    newprops: props,
    attrs
  }
}

// 初始化props
export function initProps(instance: any, props: any) {
  // 这里我们需要对props和attrs进行区分 因为我们创建实例的时候，无论是props 还是attrs 都统一传给h函数的第二个参数 h函数的第二个参数会被统一挂载到props
  const { newprops, attrs } = resolvePorp(instance.propsOptions, props)
  instance.props = newprops || {}
  instance.attrs = attrs || {}
}
