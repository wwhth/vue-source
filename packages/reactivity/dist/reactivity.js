// packages/shared/src/index.ts
function isObject(val) {
  return val !== null && typeof val === "object";
}

// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}
var activeEffect;
var ReactiveEffect = class {
  // fn用户编写的函数，scheduler(数据发生变化调用run)调度函数
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    // 默认是响应式的
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
};

// packages/reactivity/src/reactiveEffect.ts
function track(target, key) {
  if (activeEffect) {
    console.log("\u{1F680} ~ track ~ activeEffect:", activeEffect, key);
  }
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
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
function reactive(target) {
  if (isObject(target)) {
    return createReactiveObject(target);
  }
  return target;
}
export {
  activeEffect,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
