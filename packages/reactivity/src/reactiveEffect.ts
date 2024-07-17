import { activeEffect } from "./effect";

export function track(target, key) {
  // TODO
  // activeEffect  如果有这个值，说明是在effect中调用的，需要收集依赖
  if (activeEffect) {
    console.log("🚀 ~ track ~ activeEffect:", activeEffect, key);
  }
}
