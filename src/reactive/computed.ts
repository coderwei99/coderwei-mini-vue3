import { EffectDepend } from "./effect";

class ComputedRefImpl<T> {
  private _value!: T;
  public _getter: computedGetter<T>;
  private _dirty = true;
  private _effect: EffectDepend;
  constructor(get: computedGetter<T>, private set: computedSetter<T>) {
    this._getter = get;
    this._effect = new EffectDepend(get, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      // this._value = this._getter();
      this._value = this._effect.run();
    }
    return this._value;
  }
  set value(newValue: T) {
    this.set(newValue);
  }
}

export type computedGetter<T> = (...args: any[]) => T;

export type computedSetter<T> = (v: T) => void;

export interface WritableComputedOptions<T> {
  get: computedGetter<T>;
  set: computedSetter<T>;
}
export function computed<T>(options: WritableComputedOptions<T>): any;
export function computed<T>(getter: computedGetter<T>);

export function computed<T>(
  getterOption: computedGetter<T> | WritableComputedOptions<T>
) {
  let getter: computedGetter<T>;
  let setter: computedSetter<T>;

  if (typeof getterOption === "function") {
    getter = getterOption;
    setter = () => console.error("getter是只读的，不允许赋值");
  } else {
    getter = getterOption.get;
    setter = getterOption.set;
  }
  return new ComputedRefImpl(getter, setter);
}
