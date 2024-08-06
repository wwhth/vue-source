// packages/shared/src/index.ts
function isObject(val) {
  return val !== null && typeof val === "object";
}
function isFunction(val) {
  return typeof val === "function";
}

// packages/reactivity/src/effect.ts
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  console.log("%c Line:5 \u{1F34C} _effect", "color:#2eafb0", _effect);
  _effect.run();
  if (options) {
    Object.assign(_effect, options);
  }
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var activeEffect;
function preCleanEffect(effect2) {
  effect2._depLength = 0;
  effect2._trackId++;
}
function postCleanEffect(effect2) {
  if (effect2.deps.length > effect2._depLength) {
    for (let i = effect2._depLength; i < effect2.deps.length; i++) {
      cleanDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depLength;
  }
}
var ReactiveEffect = class {
  // fn用户编写的函数，scheduler(数据发生变化调用run)调度函数
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this._trackId = 0;
    //记录当前的effect执行了几次
    this.deps = [];
    //当前effect关联了哪些dep
    this._depLength = 0;
    this._running = 0;
    this._dirtyLevel = 4 /* Dirty */;
    // 默认是响应式的
    this.active = true;
  }
  get dirty() {
    return this._dirtyLevel === 4 /* Dirty */;
  }
  set dirty(value) {
    this._dirtyLevel = value ? 4 /* Dirty */ : 0 /* NoDirty */;
  }
  run() {
    this._dirtyLevel = 0 /* NoDirty */;
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false;
  }
};
function cleanDepEffect(dep, effect2) {
  dep.delete(effect2);
  if (dep.size === 0) {
    dep.__cleanup__();
  }
}
function trackEffect(effect2, dep) {
  if (dep.get(effect2) !== effect2._trackId) {
    dep.set(effect2, effect2._trackId);
    let oldDep = effect2.deps[effect2._depLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect2);
      }
      effect2.deps[effect2._depLength++] = dep;
    } else {
      effect2._depLength++;
    }
  }
  console.log("\u{1F680} ~ trackEffect ~ effect.deps:", effect2, dep);
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (effect2._dirtyLevel === 0 /* NoDirty */) {
      effect2._dirtyLevel = 4 /* Dirty */;
    }
    if (effect2._running === 0) {
      if (effect2.scheduler) {
        effect2.scheduler();
      }
    }
  }
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDep = (cleanup, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.__cleanup__ = cleanup;
  dep.name = key;
  return dep;
};
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = /* @__PURE__ */ new Map();
      targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = createDep(() => depsMap.delete(key), key);
      depsMap.set(key, dep);
    }
    trackEffect(activeEffect, dep);
    console.log("\u{1F680} ~ track ~ targetMap:", targetMap);
  }
}
function trigger(target, key, newValue, oldValue) {
  let depsMap = targetMap.get(target);
  if (!depsMap) return;
  let dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      return reactive(res);
    }
    return res;
  },
  set(target, key, value, receiver) {
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return result;
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
function toReactive(target) {
  return isObject(target) ? reactive(target) : target;
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  // 收集对应的effect
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.__v_isRef = true;
    // 保存原始值
    this.dep = /* @__PURE__ */ new Set();
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = newValue;
      this.rawValue = newValue;
      triggerRefValue(this);
    }
  }
};
function trackRefValue(ref2) {
  if (activeEffect) {
    trackEffect(activeEffect, (ref2.dep = createDep(() => (ref2.dep = void 0), "undefined")));
  }
}
function triggerRefValue(ref2) {
  let dep = ref2.dep;
  if (dep) {
    triggerEffects(dep);
  }
}
var ObjectRefImpl = class {
  // 标识当前对象是ref对象
  constructor(_object, key) {
    this._object = _object;
    this.key = key;
    this.__v_isRef = true;
  }
  get value() {
    return this._object[this.key];
  }
  set value(newValue) {
    this._object[this.key] = newValue;
  }
};
function toRef(object, key) {
  if (isObject(object)) {
    return new ObjectRefImpl(object, key);
  } else {
    return new Error("object must be a object");
  }
}
function toRefs(object) {
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
function proxyRefs(object) {
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
    }
  });
}

// packages/reactivity/src/computed.ts
function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions);
  let getter = onlyGetter ? getterOrOptions : getterOrOptions.get;
  let setter = onlyGetter ? () => {} : getterOrOptions.set;
  console.log(getter, setter);
  return new ComputedRefImpl(getter, setter);
}
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.setter = setter;
    this.dep = /* @__PURE__ */ new Set();
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this);
      }
    );
  }
  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      trackRefValue(this);
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  proxyRefs,
  reactive,
  ref,
  toReactive,
  toRef,
  toRefs,
  trackEffect,
  trackRefValue,
  triggerEffects,
  triggerRefValue
};
//# sourceMappingURL=reactivity.js.map
