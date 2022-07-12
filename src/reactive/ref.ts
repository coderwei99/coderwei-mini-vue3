import { isTracking, tarckEffect, triggerEffect } from "./effect";
import { isReactive, reactive } from "./reactive";
import { Dep } from "./effect";
import { isObject } from "../shared";
class RefImpl<T> {
  private _value: T;
  private _rawValue: T;
  public dep: Dep;
  public __v_isRef = true;
  constructor(value: T) {
    this._value = convert(value);
    this._rawValue = value;
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this.dep);
    return this._value;
  }
  set value(newValue) {
    if (hasChanged(this._rawValue, newValue)) return;
    this._value = convert(newValue);
    this._rawValue = newValue; //每次更新都需要重新设置一次_rawValue  因为constructor只会执行一次 在new的时候
    triggerEffect(this.dep);
  }
}

// 如果ref的新值是一个对象 那么需要进行递归处理  与reactive模块的嵌套对象处理类似
export function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function trackRefValue(dep) {
  if (isTracking()) {
    tarckEffect(dep);
  }
}

// 判断是否是相同的值 如果ref是相同的值 就不需要触发依赖
export function hasChanged(value, oldValue) {
  return Object.is(value, oldValue);
}

export function ref<T>(value: T) {
  return new RefImpl(value);
}

// isRef的实现
export function isRef(ref) {
  return !!(ref && ref.__v_isRef);
}

// unref的实现
export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}

// proxyRefs的实现
export function proxyRefs(value) {
  return isReactive(value)
    ? value
    : new Proxy(value, {
        get(target, key) {
          return unref(Reflect.get(target, key));
        },
        set(target, key, value) {
          if (isRef(target[key]) && !isRef(value)) {
            target[key].value = value;
            return true;
          }

          return Reflect.set(target, key, value);
        },
      });
}
