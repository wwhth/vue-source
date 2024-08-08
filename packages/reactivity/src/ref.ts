import { isObject } from "@vue/shared";
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
export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), "undefined"))
    ); // 收集依赖
  }
}
export function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep); // 触发依赖更新
  }
}
class ObjectRefImpl {
  public __v_isRef = true; // 标识当前对象是ref对象
  constructor(public _object: any, public key: string) { }
  get value() {
    return this._object[this.key];
  }
  set value(newValue) {
    this._object[this.key] = newValue;
  }
}

export function toRef(object, key) {
  if (isObject(object)) {
    return new ObjectRefImpl(object, key);
  } else {
    // return object[key];
    return new Error("object must be a object");
  }
}

export function toRefs(object: any) {
  if (isObject(object)) {
    const ret = {};
    for (const key in object) {
      ret[key] = toRef(object, key);
    }
    return ret;
  } else {
    return new Error("object must be a object");
  }
}

export function proxyRefs(object: any) {
  return new Proxy(object, {
    get(target, key, revevier) {
      let r = Reflect.get(target, key, revevier);
      console.log("r: ", r);

      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, revevier) {
      let r = Reflect.get(target, key, revevier);
      if (r.__v_isRef) {
        r.value = value;
      } else {
        return Reflect.set(target, key, value, revevier);
      }
    },
  });
}

export function isRef(ref) {
  return !!(ref && ref.__v_isRef);
}