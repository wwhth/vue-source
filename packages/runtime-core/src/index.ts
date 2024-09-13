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
  const patchChildren = (n1, n2, container) => {};
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
