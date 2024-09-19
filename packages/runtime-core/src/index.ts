/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-26 14:24:49
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-09-10 10:47:23
 * @FilePath: /vue-source/packages/runtime-core/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ShapeFlags } from "@vue/shared";
import { isSameVnode } from "./h";

export function createRenderer(options) {
  // core中不关心如何渲染
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = options;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      patch(null, child, container);
    }
  };
  const mountElement = (vnode, container) => {
    console.log("🚀 ~ mountElement ~ vnode:", vnode);
    const { type, children, props, shapeFlag } = vnode;
    // 第一次渲染的时候我们需要让虚拟节点和真实节点关联起来 vNode.el = el
    // 第二次渲染新的vnode，可以和上一次的vnode作比对，之后在更新对应的el元素，可以后续再服用这个dom元素
    let el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (const key in props) {
        const val = props[key];
        hostPatchProp(el, key, null, val);
      }
    }
    // 9 & 8 > 0 说明children是文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };
  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container);
    } else {
      patchElement(n1, n2, container);
    }
  };
  const patchElement = (n1, n2, container) => {
    // 1.比较元素的差异，肯定需要更新复用dom元素
    // 2.比较元素的属性和元素的子节点
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el); //对dom元素进行复用
    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el);
  };
  const patchChildren = (n1, n2, container) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const oldShapeFlag = n1.shapeFlag;
    const newShapeFlag = n2.shapeFlag;
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是数组，新的是文本
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        //  都是文本节点
        hostSetElementText(container, c2);
      }
    } else {
      // 新的是数组
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老的是数组
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 全量diff  两个数组的比对
          patchKeyedChildren(c1, c2, container);
        } else {
          // 新的是文本
          unmountChildren(c1);
          hostSetElementText(container, c2);
        }
      } else {
        // 老的是文本  新的是空
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, "");
        }
        // 新的是数组
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, container);
        }
      }
    }
  };
  const patchKeyedChildren = (c1, c2, container) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // 1.从头开始遍历
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]; // 老节点
      const n2 = c2[i]; // 新节点
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container);
      } else {
        break;
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
  const patch = (n1, n2, container) => {
    if (n1 == n2) {
      return;
    }
    // 更新操作
    if (n1 && isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null; // 卸载完成之后，n1就为null了 ,会执行n2的初始化操作
    }
    processElement(n1, n2, container);
  };

  function unmount(vnode) {
    return hostRemove(vnode.el);
  }
  // 多次调用render会进行虚拟节点的比较，在进行更新

  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        // 卸载操作
        unmount(container._vnode);
      }
    }
    // 将虚拟节点变成真实节点进行渲染
    patch(container._vnode || null, vnode, container);

    container._vnode = vnode;
  };
  return {
    render,
  };
}
export * from "./h";
