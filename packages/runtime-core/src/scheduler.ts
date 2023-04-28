const queue: any[] = []
let activePreFlushCbs: any[] = []
let activePostFlushCbs: any[] = []
let showExecte = false
let isFlushing = false

export function nextTick(fn?: () => void) {
  return fn ? Promise.resolve().then(fn) : Promise.resolve()
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    // 如果queue这个队列里面没有job 那么才添加
    queue.push(job)
  }

  queueFlush()
}

function queueFlush() {
  if (showExecte) return
  showExecte = true

  nextTick(flushJobs)
}

function flushJobs() {
  showExecte = false
  isFlushing = false

  /** 增加个判断条件，因为目前为止，我们视图的异步渲染和watchEffect的异步执行 都是走到这个位置，而在这里watchEffect的第二个参数的flush是pre的时候，需要在视图更新之前执行
      所以我们可以先在这里执行我们收集起来的需要在视图更新之前执行的函数
  */
  // for (let i = 0; i < activePreFlushCbs.length; i++) {
  //   activePreFlushCbs[i]()
  // }
  let preflush
  while ((preflush = activePreFlushCbs.shift())) {
    preflush && preflush()
  }

  // 下面是处理视图的更新的 vue有个核心概念: 视图的异步渲染
  let job
  // console.log('view is update')
  while ((job = queue.shift())) {
    job && job()
  }

  // 当watchEffect的options.flush为post的时候  需要在视图更新之后执行
  flushPostFlushCbs()
}

function flushPostFlushCbs() {
  let postflush
  while ((postflush = activePostFlushCbs.shift())) {
    postflush && postflush()
  }
}

export function queuePreFlushCb(fn) {
  queueFns(fn, activePreFlushCbs)
}
export function queuePosstFlushCb(fn) {
  queueFns(fn, activePostFlushCbs)
}

function queueFns(fn: any, activePreFlushCbs: any[]) {
  if (isFlushing) return
  isFlushing = true
  activePreFlushCbs.push(fn)
  queueFlush()
}
