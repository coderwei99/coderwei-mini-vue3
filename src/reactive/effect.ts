let activeEffect;
let shouldTrack: boolean = false;
export class EffectDepend {
  private _fn: Function;
  public active = true; //effect是否存活
  public deps: Set<EffectDepend>[] = []; //存储依赖的集合  方便后续stop方法删除对应的依赖
  onStop?: () => void; //挂载用户传入的onStop回调函数，在删除之后调用一次
  constructor(fn: Function, public scheduler?) {
    this._fn = fn;
  }
  run(): any {
    if (!this.active) {
      return this._fn();
    }
    activeEffect = this;
    shouldTrack = true;
    let returnValue = this._fn();
    shouldTrack = false;
    return returnValue;
  }

  stop() {
    //为了从性能考虑没必要每次都执行 因为同一个依赖 删除一次就够了 所以这里进行判断 只有当前依赖存活的时候 才将其依赖 移除的同事将其设置为false(失活)
    if (this.active) {
      cleanupEffect(this);
      this.onStop?.();
    }
  }
}

/**
 *
 * @param effect 响应式实例
 * 删除依赖
 */
export function cleanupEffect(effect: EffectDepend) {
  for (const dep of effect.deps) {
    dep.delete(effect);
    effect.active = false;
  }
}

export interface IeffectOptionsTypes {
  scheduler?: () => any;
  onStop?: () => void;
}

/**
 *
 * @param fn 需要执行的函数
 */
export interface IeffectRunner<T = any> {
  (): T;
  effect: EffectDepend;
}

export function effect<T = any>(fn: () => T, options?: IeffectOptionsTypes) {
  const _effect = new EffectDepend(fn, options?.scheduler);
  _effect.onStop = options?.onStop;
  _effect.run();
  const runner = _effect.run.bind(_effect) as IeffectRunner;
  runner.effect = _effect;
  return runner;
}

export type Dep = Set<EffectDepend>;
// 抽离收集依赖  方便在ref函数中使用
export function tarckEffect(dep: Dep) {
  // 如果set中已经有了对应的activeEffect依赖 那么就不需要再次进行收集依赖
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect?.deps.push(dep);
}

// 抽离触发依赖 方便在ref函数中使用
export function triggerEffect(dep: Dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

const targetMap = new Map();

export function isTracking() {
  return activeEffect !== undefined && shouldTrack;
}

/**
 *
 * @param target 数据源对象
 * @param key 对应的key值
 */
export function track(target, key) {
  // 首先拦截不必要的依赖
  if (!isTracking()) return;

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
  tarckEffect(dep);
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
    triggerEffect(dep);
  }
}

/**
 *
 * @param runner effect的返回值
 */
export function stop(runner) {
  runner.effect.stop();
}
