import { isObject, isString, ShapeFlags } from "@vue/shared"; // h函数用于创建虚拟节点

export function h(type, propsOrChildren?, children?) {
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
    if (l > 3) {  //TODO 有问题，现在这个写法不支持三个以上的参数
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}

export function isVNode(v) {
  return v.__v_isVNode === true;
}
const getShapeFlag = (type) => {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
};
export function isSameVnode(n1, n2) {
  console.log("🚀 ~ isSameVnode ~ n1, n2:", n1, n2)
  return n1.type === n2.type && n1.key === n2.key;
}

export const Text = Symbol("Text");
export const Fragment = Symbol("Fragment");
export function createVNode(type, props?, children?) {
  const vNode = {
    __v_isVNode: true,   // 用于判断是否是虚拟节点
    type,
    props,
    children,
    key: props?.key, // key是用于diff算法的
    shapeFlag: getShapeFlag(type), // 虚拟节点的类型
    el: null, // 虚拟节点对应的真实节点
  };
  if (children) {
    debugger
    if (Array.isArray(children)) {
      vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else if (typeof children === "string"|| typeof children ==="number") {
      vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }
  return vNode;
}
