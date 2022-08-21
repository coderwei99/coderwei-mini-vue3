/**
 * 处理插值的整体流程 {{message}}
 * 思路:  拿到{{message}}后 对其进行处理  首先我们需要明确一点 我们拿到的是字符串  就是无脑切割、推进的一个过程
 *        首先先确定结束的位置 根据插值语法的使用  我们很明确的清楚 }}就是我们的结束标记  所以先通过indexOf拿到该从那个位置进行截断
 *        然后同样的 {{ 这个也就是我们的开始标记
 * 1. 我们先将{{message}} 切割掉"{{"这两个开始的标记获取到message}}
 * 2. 然后上面讲了 "}}"这个就是我们的结束标记  我们定义一个变量标志结束的位置
 * 3. 根据结束的位置 切割掉"}}" 然后我们就能拿到中间核心的变量了 当然这里要注意 我们获取的结束标记是完整的字符串{{message}} 经过第一步 实际上字符串已经变成了message}}这个玩意 所以我们的结束标记也要-2
 * 4. 最后进行推进 因为后面可能还有别的标签我们需要处理 比如说</div>这种dom标签 我们要进行别的处理 推进的方式也很简单 说白了就是将整个{{message}}删掉  然后继续后面的字符串解析
 *
 */

export function baseParse(content: string) {
  const context = createParseContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any[] = [];
  const node = parseInterpolation(context);
  nodes.push(node);
  return nodes;
}

function parseInterpolation(context) {
  // "{{message}}"
  // "message}}"
  const closeIndex = context.source.indexOf("}}");
  console.log(closeIndex, "clostIndex");

  context.source = context.source.slice(2);
  console.log(context.source.slice(0, closeIndex - 2));
  const content = context.source.slice(0, closeIndex - 2);
  context.source = context.source.slice(closeIndex);
  console.log(context.source, "处理完成之后  content");

  return {
    type: "interpolation",
    content: {
      type: "simple_expression",
      content: content,
    },
  };
}

function createParseContext(content: string) {
  // throw new Error("Function not implemented.");
  return {
    source: content,
  };
}

function createRoot(children) {
  return {
    children,
  };
}
