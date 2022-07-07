let activeEfffn;
class EffectDepend {
  private _fn: Function;
  constructor(fn: Function, public scheduler?) {
    this._fn = fn;
  }
  run() {
    activeEfffn = this;
    return this._fn();
  }
}

export interface IeffectOptionsTypes {
  scheduler?: () => any;
}

/**
 *
 * @param fn 需要执行的函数
 */
export function effect(fn, options?: IeffectOptionsTypes) {
  const _effect = new EffectDepend(fn, options?.scheduler);
  _effect.run();
  return _effect.run.bind(_effect);
}

const targetMap = new Map();

/**
 *
 * @param target 数据源对象
 * @param key 对应的key值
 */
export function track(target, key) {
  // target  --->  key ---> dep
  // 根据target源对象  拿到一个由key:响应式函数组成的set组成的map， 然后根据这个key获取到对应的set
  /**
   * targetMap {
   *   target:{key:Set()}
   * }
   * 也就是通过 targetMap.get(target); 获取到target对应的val
   * 然后由于他还是一个map，然后通过depsMap.get(key); 拿到对应的set  这样就可以获取到对应的依赖集合
   */
  let depsMap = targetMap.get(target);
  // 考虑第一次没有拿到的情况---初始化
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  // 考虑第一次没有拿到的情况---初始化
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEfffn);
}

/**
 *
 * @param target 用户访问的对象
 * @param key 需要触发对应的key
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap.get(key); //这里用可选运算符  因为没办法保证depsMap一定有对象
  if (dep) {
    for (const effect of dep) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    }
  }
}
