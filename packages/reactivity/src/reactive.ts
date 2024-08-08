import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandler";
import { ReactiveFlags } from "./constants";

const reactiveMap = new WeakMap();

function createReactiveObject(target: object) {
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  const hasReactive = reactiveMap.get(target);
  if (hasReactive) {
    return hasReactive;
  }
  let proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target: any) {
  // 1. 判断是否是对象
  if (isObject(target)) {
    // 2.创建响应式对象
    return createReactiveObject(target);
  }
  return target;
}

export function toReactive(target: any) {
  return isObject(target) ? reactive(target) : target;
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}