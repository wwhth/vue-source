import { isObject } from "@vue/shared";
import { track, trigger } from "./reactiveEffect";
import { reactive } from "./reactive";

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
    let res = Reflect.get(target, key, receiver);
    // 如果是对象，需要递归处理
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  set(target, key, value, receiver) {
    // 触发更新
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      // 需要触发页面更新
      trigger(target, key, value, oldValue);
    }
    return result;
  },
};
