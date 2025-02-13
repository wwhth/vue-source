// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  insert(el, parent, anchor) {
    console.log("\u{1F680} ~ insert ~ parent:", parent);
    parent.insertBefore(el, anchor || null);
  },
  remove(el) {
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }
  },
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    node.nodeValue = text;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  }
};

// packages/runtime-dom/src/patchProp.ts
function patchClass(el, value) {
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
}
function patchStyle(el, prevValue, nextValue) {
  let style = el.style;
  for (let key in nextValue) {
    style[key] = nextValue[key];
  }
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue) {
        if (nextValue[key] == null) {
          style[key] = null;
        }
      }
    }
  }
}
function patchEvent(el, key, value) {
  const invokers = el._vei || (el._vei = {});
  const name = key.slice(2).toLowerCase();
  const exisitingInvokers = invokers[key];
  if (value && exisitingInvokers) {
    return exisitingInvokers.value = value;
  }
  if (value) {
    const invoker = el._vei[key] = createInvoker(value);
    return el.addEventListener(name, invoker);
  }
  if (exisitingInvokers) {
    el.removeEventListener(key, exisitingInvokers);
    invokers[key] = null;
  }
}
function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e);
  };
  invoker.value = value;
  return invoker;
}
function patchAttr(el, key, value) {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}
function isOn(key) {
  return /^on[A-Z]/.test(key);
}
function patchProp(el, key, prevValue, nextValue) {
  if (key === "class") {
    return patchClass(el, nextValue);
  } else if (key === "style") {
    return patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}

// packages/shared/src/index.ts
function isObject(val) {
  return val !== null && typeof val === "object";
}
function isFunction(val) {
  return typeof val === "function";
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(val, key) {
  return hasOwnProperty.call(val, key);
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  let l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      } else {
        return createVNode(type, propsOrChildren);
      }
    }
    return createVNode(type, null, propsOrChildren);
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
function isVNode(v) {
  return v.__v_isVNode === true;
}
var getShapeFlag = (type) => {
  return typeof type === "string" ? 1 /* ELEMENT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
};
function isSameVnode(n1, n2) {
  console.log("\u{1F680} ~ isSameVnode ~ n1, n2:", n1, n2);
  return n1.type === n2.type && n1.key === n2.key;
}
var Text = Symbol("Text");
var Fragment = Symbol("Fragment");
function createVNode(type, props, children) {
  const vNode = {
    __v_isVNode: true,
    // 用于判断是否是虚拟节点
    type,
    props,
    children,
    key: props?.key,
    // key是用于diff算法的
    shapeFlag: getShapeFlag(type),
    // 虚拟节点的类型
    el: null
    // 虚拟节点对应的真实节点
  };
  if (children) {
    debugger;
    if (Array.isArray(children)) {
      vNode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    } else if (typeof children === "string" || typeof children === "number") {
      vNode.shapeFlag |= 8 /* TEXT_CHILDREN */;
    }
  }
  return vNode;
}

// packages/runtime-core/src/seq.ts
var getSequences = (arr) => {
  debugger;
  const result = [0];
  const p = result.slice(0);
  let start;
  let end;
  let mid;
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      const last2 = result[result.length - 1];
      if (arrI > arr[last2]) {
        p[i] = last2;
        console.log("\u{1F680} ~ getSequences ~ arrI:", arrI, arr[last2], last2);
        result.push(i);
        console.log("\u{1F680} ~ getSequences ~ result:", result);
        continue;
      }
      start = 0;
      end = result.length - 1;
      while (start < end) {
        mid = (start + end) / 2 | 0;
        if (arr[result[mid]] < arrI) {
          start = mid + 1;
        } else {
          end = mid;
        }
      }
    }
    if (arrI < arr[result[start]]) {
      debugger;
      p[i] = result[start - 1];
      result[start] = i;
      console.log("\u{1F680} ~ getSequences ~ result:", result);
    }
    console.log("\u{1F680} ~ getSequences ~ p:", p);
  }
  let l = result.length;
  let last = result[l - 1];
  while (l-- > 0) {
    result[l] = last;
    last = p[last];
  }
  return result;
};

// packages/reactivity/src/effect.ts
var activeEffect;
function preCleanEffect(effect) {
  effect._depLength = 0;
  effect._trackId++;
}
function postCleanEffect(effect) {
  if (effect.deps.length > effect._depLength) {
    for (let i = effect._depLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect);
    }
    effect.deps.length = effect._depLength;
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
    if (this.active) {
      this.active = false;
      preCleanEffect(this);
      postCleanEffect(this);
    }
  }
};
function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.__cleanup__();
  }
}
function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
    let oldDep = effect.deps[effect._depLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect);
      }
      effect.deps[effect._depLength++] = dep;
    } else {
      effect._depLength++;
    }
  }
}
function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect._dirtyLevel === 0 /* NoDirty */) {
      effect._dirtyLevel = 4 /* Dirty */;
    }
    if (effect._running === 0) {
      if (effect.scheduler) {
        effect.scheduler();
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

// packages/runtime-core/src/scheduler.ts
var queue = [];
var isFlushing = false;
var resolvePromise = Promise.resolve();
function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    resolvePromise.then(() => {
      isFlushing = false;
      const copy = queue.slice();
      queue.length = 0;
      copy.forEach((job2) => job2());
      copy.length = 0;
    });
  }
}

// packages/runtime-core/src/components.ts
function createComponentInstance(vnode) {
  const instance = {
    data: null,
    //状态
    vnode,
    //组件的虚拟节点
    subTree: null,
    //子树
    isMounted: false,
    //是否挂载完成
    update: null,
    //组件的更新函数
    props: {},
    //props
    attrs: {},
    //attrs
    propsOptions: vnode.type.props,
    //props选项
    component: null,
    //组件实例
    proxy: null
    //代理props,arrts,data ，让用户更方便的使用
  };
  return instance;
}
var initProps = (instance, rawProps) => {
  const props = {};
  const attrs = {};
  const propsOptions = instance.propsOptions || {};
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (key in propsOptions) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  instance.attrs = attrs;
  instance.props = reactive(props);
};
var publicProperty = {
  $attrs: (instance) => instance.attrs,
  $data: (instance) => instance.data,
  $props: (instance) => instance.props,
  $slots: (instance) => instance.vnode.children
};
var handler = {
  get(target, key) {
    const { state, props, attrs } = target;
    if (state && hasOwn(state, key)) {
      return state[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    } else if (attrs && hasOwn(attrs, key)) {
      return attrs[key];
    }
    const getter = publicProperty[key];
    if (getter) {
      return getter(target);
    }
  },
  // 对于一些无法修改的属性 $attrs,$slots ... 只能读取，没有set方法
  set(target, key, value) {
    const { state, props, attrs } = target;
    if (state && hasOwn(state, key)) {
      state[key] = value;
    } else if (props && hasOwn(props, key)) {
      console.warn("\u4E0D\u80FD\u4FEE\u6539props");
    }
    return true;
  }
};
function setupComponent(instance) {
  const { props, type } = instance.vnode;
  initProps(instance, props);
  instance.proxy = new Proxy(instance, handler);
  const { data, render: render2 } = type;
  if (!isFunction(data)) {
    return console.warn("data\u5FC5\u987B\u662F\u4E00\u4E2A\u51FD\u6570");
  }
  instance.data = reactive(data.call(instance.proxy));
  instance.render = render2;
}

// packages/runtime-core/src/index.ts
function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = options;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      patch(null, child, container);
    }
  };
  const mountElement = (vnode, container, anchor) => {
    console.log("\u{1F680} ~ mountElement ~ vnode:", vnode);
    const { type, children, props, shapeFlag } = vnode;
    let el = vnode.el = hostCreateElement(type);
    if (props) {
      for (const key in props) {
        const val = props[key];
        hostPatchProp(el, key, null, val);
      }
    }
    if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(children, el);
    }
    hostInsert(el, container, anchor);
  };
  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2, container);
    }
  };
  const patchElement = (n1, n2, container) => {
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = n2.el = n1.el;
    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el);
  };
  const patchChildren = (n1, n2, container) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const oldShapeFlag = n1.shapeFlag;
    const newShapeFlag = n2.shapeFlag;
    if (newShapeFlag & 8 /* TEXT_CHILDREN */) {
      if (oldShapeFlag & 16 /* ARRAY_CHILDREN */) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2);
      }
    } else {
      if (oldShapeFlag & 16 /* ARRAY_CHILDREN */) {
        if (newShapeFlag & 16 /* ARRAY_CHILDREN */) {
          patchKeyedChildren(c1, c2, container);
        } else {
          unmountChildren(c1);
          hostSetElementText(container, c2);
        }
      } else {
        if (oldShapeFlag & 8 /* TEXT_CHILDREN */) {
          hostSetElementText(container, "");
        }
        if (newShapeFlag & 16 /* ARRAY_CHILDREN */) {
          mountChildren(c2, container);
        }
      }
    }
  };
  const patchKeyedChildren = (c1, c2, container) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      console.log(3333);
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      const toBePatched = e2 - s2 + 1;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      for (let i2 = s2; i2 <= e2; i2++) {
        const nextChild = c2[i2];
        keyToNewIndexMap.set(nextChild.key, i2);
      }
      for (let i2 = s1; i2 <= e1; i2++) {
        const prevChild = c1[i2];
        let newIndex = keyToNewIndexMap.get(prevChild.key);
        if (newIndex === void 0) {
          console.log(1111);
          unmount(prevChild);
        } else {
          console.log(2222);
          newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
          patch(prevChild, c2[newIndex], container);
        }
        console.log(
          "\u{1F680} ~ patchKeyedChildren ~ newIndexToOldIndexMap:",
          newIndexToOldIndexMap
        );
        let increasingSeq = getSequences(newIndexToOldIndexMap);
        let j = increasingSeq.length - 1;
        console.log("\u{1F680} ~ patchKeyedChildren ~ increasingSeq:", increasingSeq);
        for (let i3 = toBePatched - 1; i3 >= 0; i3--) {
          console.log("\u{1F680} ~ patchKeyedChildren ~ i:", i3);
          const nextIndex = i3 + s2;
          const nextChild = c2[nextIndex];
          const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
          if (!nextChild.el) {
            patch(null, nextChild, container, anchor);
          } else {
            if (i3 == increasingSeq[j]) {
              j--;
            } else {
              hostInsert(nextChild.el, container, anchor);
            }
          }
        }
      }
    }
  };
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };
  const patchProps = (el, oldProps, newProps) => {
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      console.log("\u{1F680} ~ processText ~ n2:", n2);
      hostInsert(n2.el = hostCreateText(n2.children), container);
    } else {
      const el = n2.el = n1.el;
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processFragment = (n1, n2, container) => {
    if (n1 == null) {
      mountChildren(n2.children, container);
    } else {
      patchKeyedChildren(n1.children, n2.children, container);
    }
  };
  function setupRenderEffect(instance, container, anchor) {
    const { render: render3 } = instance;
    const componentFn = () => {
      if (!instance.isMounted) {
        const subTree = render3.call(instance.proxy, instance.proxy);
        patch(null, subTree, container, anchor);
        instance.isMounted = true;
        instance.subTree = subTree;
      } else {
        const subTree = render3.call(instance.proxy, instance.proxy);
        patch(instance.subTree, subTree, container, anchor);
        instance.subTree = subTree;
      }
    };
    const update = instance.update = () => effect.run();
    const effect = new ReactiveEffect(componentFn, () => queueJob(update));
    update();
  }
  const mountComponent = (vnode, container, anchor) => {
    const instance = vnode.component = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
  };
  const processComponent = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountComponent(n2, container, anchor);
    } else {
      updateComponent(n1, n2);
    }
  };
  const patch = (n1, n2, container, anchor = null) => {
    console.log("\u{1F680} ~ patch ~ n1, n2:", n1, n2);
    if (n1 == n2) {
      return;
    }
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    console.log("\u{1F680} ~ patch ~ type:", type, shapeFlag);
    switch (type) {
      case Text:
        debugger;
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container);
        break;
      default:
        debugger;
        if (shapeFlag & 1 /* ELEMENT */) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & 6 /* COMPONENT */) {
          processComponent(n1, n2, container, anchor);
        }
    }
  };
  function unmount(vnode) {
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children);
    } else {
      return hostRemove(vnode.el);
    }
  }
  const render2 = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
      console.log("\u{1F680} ~ render ~ container:", container);
      console.log("\u{1F680} ~ render ~ container:", container?._vnode);
      container._vnode = vnode;
    }
  };
  return {
    render: render2
  };
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOps);
console.log("\u{1F680} ~ renderOptions:", renderOptions);
var render = (vnode, container) => {
  console.log("\u{1F680} ~ render ~ vnode:", vnode, container);
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  Fragment,
  Text,
  createRenderer,
  createVNode,
  h,
  isSameVnode,
  isVNode,
  render,
  renderOptions
};
//# sourceMappingURL=runtime-dom.js.map
