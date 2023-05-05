export function resolvePorp(propsOptions, rawprops) {
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

// 更新props
export function patchComponentProps(props, newProps) {
  for (let key in newProps) {
    const prop = props[key]
    const newProp = newProps[key]
    //不同就更新
    if (prop !== newProp) {
      props[key] = newProps[key]
    }
  }
  // 删除旧的prop不存在与新的prop的属性
  /* 
    newProps:{
      name:"coderwei",
    }
    oldProps:{
      name:"coder",
      age:19
    }
    // 这个age在新的component中就不需要了  所以这里可以直接选择删除
  */
  for (let key in props) {
    if (!(key in newProps)) {
      delete props[key]
    }
  }
}

// 更新组件attrs
export function patchComponentAttrs(attrs, newProps) {
  for (const key in attrs) {
    const attr = attrs[key]
    const newAttr = newProps[key]
    if (attr !== newAttr) {
      attrs[key] = newProps[key]
    }
  }

  // 删除没用的key

  for (const key in attrs) {
    if (!(key in newProps)) {
      delete attrs[key]
    }
  }
}
