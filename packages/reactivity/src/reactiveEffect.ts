import { activeEffect, trackEffect, triggerEffects } from "./effect";

const targetMap = new WeakMap();

export const createDep = (cleanup, key) => {
  const dep = new Map() as any; //创建的收集器还是一个map
  dep.__cleanup__ = cleanup; //增加删除的方法
  dep.name = key;
  return dep;
};

export function track(target, key) {
  // TODO
  // activeEffect  如果有这个值，说明是在effect中调用的，需要收集依赖
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      //新增的
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
      dep = createDep(() => depsMap.delete(key), key); //后期清理一些不需要的属性
      depsMap.set(key, dep);
    }

    trackEffect(activeEffect, dep); //将当前的effect放入到dep（映射表）中，后续可以根据值的变化触发此dep中存放的effect
    console.log("🚀 ~ track ~ targetMap:", targetMap);
  }
}

export function trigger(target, key, newValue, oldValue) {
  let depsMap = targetMap.get(target);
  if (!depsMap) return;
  let dep = depsMap.get(key);
  if (dep) {
    //这个修改的属性对应的effect
    triggerEffects(dep);
  }
}

// 结构
// targetMap = {
//   target: {
//     key: effect:Map,effect:Map,...
//   }:Map
// }:Map
