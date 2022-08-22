const queue: any[] = [];
let showExecte = false;

export function nextTick(fn: () => void) {
  return fn ? Promise.resolve().then(fn) : Promise.resolve();
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    // 如果queue这个队列里面没有job 那么才添加
    queue.push(job);
  }

  queueFlush();
}

function queueFlush() {
  if (showExecte) return;
  showExecte = true;

  nextTick(FlushJobs);
}

function FlushJobs() {
  showExecte = false;

  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
