import { isObject } from "@vue/shared";

const reactiveMap = new WeakMap();
enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}
const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    // 1. 判断是否是响应式对象

    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  },
};
export function reactive(target: any) {
  // 1. 判断是否是对象
  if (isObject(target)) {
    // 2.创建响应式对象
    return createReactiveObject(target);
  }
  return target;
}

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
