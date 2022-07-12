class ComputedRefImpl<T> {
  private _value!: T;
  public _getter: computedGetter<T>;
  constructor(get: computedGetter<T>, private set: computedSetter<T>) {
    this._getter = get;
  }
  get value() {
    this._value = this._getter();
    return this._value;
  }
  set value(newValue: T) {
    this.set(newValue);
  }
}

type computedGetter<T> = (...args: any[]) => T;

type computedSetter<T> = (v: T) => void;

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
