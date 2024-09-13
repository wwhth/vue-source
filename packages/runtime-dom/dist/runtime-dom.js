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
      if (nextValue[key] == null) {
        style[key] = "";
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
  const mountElement = (vnode, container) => {
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
    hostInsert(el, container);
  };
  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      mountElement(n2, container);
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
  const patch = (n1, n2, container) => {
    if (n1 == n2) {
      return;
    }
    if (n1 && isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    processElement(n1, n2, container);
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
