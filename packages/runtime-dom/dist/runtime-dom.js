// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  insert(el, parent, anchor) {
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
  return typeof type === "string" ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
};
function isSameVnode(n1, n2) {
  console.log("\u{1F680} ~ isSameVnode ~ n1, n2:", n1, n2);
  return n1.type === n2.type && n1.key === n2.key;
}
function createVNode(type, props, children) {
  const vNode = {
    __v_isVNode: true,
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
  if (Array.isArray(children)) {
    vNode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
  } else if (typeof children === "string") {
    vNode.shapeFlag |= 8 /* TEXT_CHILDREN */;
  }
  return vNode;
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
        console.log("\u{1F680} ~ patchKeyedChildren ~ newIndexToOldIndexMap:", newIndexToOldIndexMap);
        for (let i3 = toBePatched - 1; i3 >= 0; i3--) {
          const nextIndex = i3 + s2;
          const nextChild = c2[nextIndex];
          const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
          if (!nextChild.el) {
            patch(null, nextChild, container, anchor);
          } else {
            hostInsert(nextChild.el, container, anchor);
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
  const patch = (n1, n2, container, anchor = null) => {
    console.log("\u{1F680} ~ patch ~ n1, n2:", n1, n2);
    if (n1 == n2) {
      return;
    }
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    processElement(n1, n2, container, anchor);
  };
  function unmount(vnode) {
    return hostRemove(vnode.el);
  }
  const render2 = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    patch(container._vnode || null, vnode, container);
    console.log("\u{1F680} ~ render ~ container:", container?._vnode);
    container._vnode = vnode;
  };
  return {
    render: render2
  };
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign({ patchProp }, nodeOps);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  createVNode,
  h,
  isSameVnode,
  isVNode,
  render,
  renderOptions
};
//# sourceMappingURL=runtime-dom.js.map
