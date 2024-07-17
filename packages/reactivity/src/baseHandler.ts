import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    // 1. 判断是否是响应式对象

    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 依赖收集
    track(target, key); //收集这个对象的属性，和effect关联起来
    // 2. 返回值
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 触发更新
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    debugger;
    if (oldValue !== value) {
      // 需要触发页面更新
      trigger(target, key, value, oldValue);
    }
    return result;
  },
};
