# 编译 v-for 相关的注意事项以及生成 ast 语法树的含义

## 当编译遇到 v-for

1. 首先明确 v-for 等内置指令，一定是作为元素/组件的属性存在的

```html
<!-- example -->
<div v-for="item in data">{{item}}</div>
```

2. 解析 v-for 生成的 ast 类型，这里就不深究探讨对 v-for 的编译流程了 放在下面进行探究

```TypeScript
// example
let expectAst = [
    {
      type: NodeTypes.ROOT,
      children: [
        {
          children: [
            {
              children: [
                {
                  type: NodeTypes.INTERPOLATION,
                  content: {
                    content: 'item',
                    type: NodeTypes.SIMPLE_EXPRESSION
                  }
                }
              ],
              tag: 'div',
              type: NodeTypes.ELEMENT
            }
          ],
          source:{
            content:"_ctx.data",
            type:NodeTypes.SIMPLE_EXPRESSION
          },
          type: NodeTypes.FOR
        }
      ]
    }
  ]


```

## compiler 遇到 v-for 的整体处理流程

```html
<!-- 依次为demo -->
<div v-for="item in data">{{item}}</div>
```

### 首先明确编译的入口

baseParse 首先创建 context 上下文 该上下文有一个属性 source 就是当前的源代码 '\<div v-for="item in data">{{item}}<\/div>' 后续我们就不停的对这个 source 进行操作即可 然后通过调用 parseChildren 进行解析该字符串 并且把最后解析的结果通过 createRoot 函数放到一个对象的 children 里面 这个对象就是我们的根节点 接下来我们就重点看看 parseChildren 函数 毕竟这个函数才是我们的重中之重

1. parseChildren 入口

  ~~~typescript
  // <div v-for="item in data">{{item}}</div> 首先遇到< 开头的  就看看是否是小写字母a-z 如果是的话 则作为element元素 走parseElement逻辑 我们这里明显是成立的
  const nodes = []
  while(isEnd){
      // 判断条件省略了...
      node = parseElement(context, ancestors)
  }
  
  return nodes
  ~~~

2. parseElement 函数

- 第一步 先调用 parseTag 函数分析出是什么标签

  ```typescript
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  // 通过正则可以解析出当前当前标签 并且从<一直到后面最近的空格，但是不包含这个空格(<div) 然后调用advanceBy函数进行推进 注意 我们会一直操作context.source这个属性 我们整个流程都是操作的这个源代码
  advanceBy(context, match[0].length)
  // 这个时候source变成了:' v-for="item in data">{{item}}</div>'
  advanceSpaces(context)
  //这个也很简单 主要是为了推进空格 于是source变成了:'v-for="item in data">{{item}}</div>'
  let props = parseAttributes(context, type)
  // 然后紧跟着处理attrs 这里处理的attrs包括原生的属性、自定义指令或者是内置指令
  
  return {
  	type: NodeTypes.ELEMENT,
      ns, // 命名空间 暂时用不上
      tag, // 标签名
      tagType, // 标签类型
      props, // props
      isSelfClosing, //是否闭合标签
      children: [], 
      loc: getSelection(context, start), // 位置信息
      codegenNode: undefined // to be created during transform phase
  }
  ```
  
- parseAttributes 函数

  ~~~typescript
  // 本质上也很简单 就是直接调用了parseAttribute 不过这里是通过while不停地调用 因为我们没办法确定用户到底写了多少属性 我们需要拿到所有的属性
  while(context.source.length > 0 || context.source.startsWith('>')){
  	const attr = parseAttribute(context, attributeNames)
  }
  ~~~

- parseAttribute 函数

  ~~~typescript
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  // 通过这个正则可以匹配到'='前面的所有内容 我们这里就是能够拿到'v-for' 然后推进对应长度(这里就是v-for这个字符串的长度)
  name = match[0] // 'v-for'
  advanceBy(context, name.length)
  // 这个时候source变成了:'="item in data">{{item}}</div>' 紧接着处理value
  
  if (/^[\t\r\n\f ]*=/.test(context.source)) {
  // 这个正则表达式是用于判断一个字符串是否以零个或多个空白字符 如果是 则进入下面的代码
  	advanceSpaces(context)
      // 我们先推移空白部分
      advanceBy(context, 1)
  	// 推移这个'='
      advanceSpaces(context)
      // 在推移'='后面的空白部分 经过上面代码 source变成: '"item in data">{{item}}</div>'
      value = parseAttributeValue(context)
      // 处理value   
  }
  
  // 接下来需要处理对应的指令
  const repe = /^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name) //该正则就可以匹配以v-开头的指令 因为我们保存的name是属性的key，他可能是class、id、type等原生element的属性 我们需要在这里加以区分
  ~~~

- parseAttributeValue 函数

  ~~~typescript
  // 简单来说 parseAttributeValue只是负责将解析出"item in data" 这个东西 但是vue源码内部还多做了一个事情 就是做完以上的事情之后还在这里调用了parseTextData 该函数的处理逻辑只是单纯的处理几个html的实体编码 比如说
  <div>hello &lt;word&gt;</div>
  // 经过parseTextData会转译成<div>hello <word></div>
  ~~~

  
