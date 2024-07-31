import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

export function ref(value: any) {
  return createRef(value);
}
function createRef(value: any) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true; // 标识当前对象是ref对象
  public _value: any; // 保存原始值
  public dep: any = new Set(); // 收集对应的effect
  constructor(public rawValue: any) {
    this._value = toReactive(rawValue); // 将原始值转换为响应式对象
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = newValue; // 保存新值
      this.rawValue = newValue; // 保存原始值
      triggerRefValue(this);
    }
  }
}
function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), "undefined"))
    ); // 收集依赖
  }
}
function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep); // 触发依赖更新
  }
}
