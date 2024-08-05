import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

export function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions);
  let getter = onlyGetter ? getterOrOptions : getterOrOptions.get;
  let setter = onlyGetter ? () => {} : getterOrOptions.set;
  console.log(getter, setter);
  return new ComputedRefImpl(getter, setter); // 返回一个计算属性ref
}
class ComputedRefImpl {
  public _value;
  public effect;
  public dep = new Set();
  constructor(getter, public setter) {
    // 我们需要创建一个effect来管理当前计算属性的dirty状态
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 计算属性以来的值变化了，我们应该触发渲染重新执行
        triggerRefValue(this);
      }
    );
  }
  get value() {
    if (this.effect.dirty) {
      //默认取值一定是dirty，所以第一次取值的时候会执行effect.run()，然后dirty变为false
      this._value = this.effect.run();
      trackRefValue(this);
      // 如果在当前effect中访问了计算属性，计算属性会收集这个effect，那么计算属性会重新执行，并且dirty变为false
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
