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

import { NodeTypes } from "./ast";

// 定义开始标识符和结束标识符
const OPENDELIMITER = "{{";
const CLOSEDELIMITER = "}}";

// 定义标签的开始于结束
export enum TagTypes {
  TAGSSTART,
  TAGSEND,
}

export function baseParse(content: string) {
  const context = createParseContext(content);

  return createRoot(parseChildren(context, []));
}

function isEnd(context, ancestors) {
  // 是否结束
  // 1. 当遇到结束标签 比如:</div>
  // 2. 当context.source.length === 0
  const s = context.source;
  console.log(ancestors);
  if (s.startsWith("</")) {
    for (let i = 0; i < ancestors.length; i++) {
      const tag = ancestors[i].tag;

      if (s.slice(2, 2 + tag.length) == tag) {
        return true;
      }
    }
  }
  // if (parentTag && s.startsWith(`</${parentTag}>`)) {
  //   return true;
  // }

  return !s;
}

function parseChildren(context, ancestors) {
  // console.log(context.source, "-------------");

  const nodes: any[] = [];
  while (!isEnd(context, ancestors)) {
    let node;
    if (context.source.startsWith(OPENDELIMITER)) {
      node = parseInterpolation(context);
    } else if (context.source[0] === "<") {
      // console.log("parse");
      if (/[a-z]/i.test(context.source[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      // 如果node没有值的情况下 我们默认当做text类型来处理 就是普通文本
      node = parseText(context);
    }
    nodes.push(node);
  }

  return nodes;
}

function parseInterpolation(context) {
  // "{{message}}"
  // "message}}"

  const closeIndex = context.source.indexOf(
    CLOSEDELIMITER,
    OPENDELIMITER.length
  );
  // console.log(closeIndex, "clostIndex");

  advanceBy(context, OPENDELIMITER.length);
  // console.log(context.source.slice(0, closeIndex - 2));
  const rawContent = context.source.slice(0, closeIndex - 2);
  const content = rawContent.trim();
  advanceBy(context, closeIndex);

  // console.log(context.source, "处理完成之后  content");

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
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
    type: NodeTypes.ROOT,
  };
}

// 插值语法的推进函数
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function parseElement(context: any, ancestors) {
  const element: any = parasTag(context, TagTypes.TAGSSTART); //处理开始标签
  ancestors.push(element);
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  console.log(
    context.source,
    context.source.slice(2, 2 + element.tag.length),
    element.tag,
    "--------------------"
  );

  if (context.source.slice(2, 2 + element.tag.length) == element.tag) {
    // 先判断结束标签是否和开始标签一致
    parasTag(context, TagTypes.TAGSEND); //处理结束标签
  } else {
    throw new Error("没有结束标签");
  }

  // console.log(context.source);

  return element;
}

function parasTag(context: any, type: TagTypes) {
  console.log(context.source);

  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  console.log(match, "------------");

  advanceBy(context, match[0].length); //推进开始标签
  advanceBy(context, 1); //推进多余的>

  const tag = match[1];

  if (type == TagTypes.TAGSEND) return; //如果是结束标签 就没必要返回内容了
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseText(context: any): any {
  let endIndex = context.source.length;
  let endToken = ["<", "{{"];

  for (let i = 0; i < endToken.length; i++) {
    const index = context.source.indexOf(endToken[i]);
    console.log(index, "index");
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  const content = context.source.slice(0, endIndex);
  // console.log(content);

  advanceBy(context, content.length);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}
