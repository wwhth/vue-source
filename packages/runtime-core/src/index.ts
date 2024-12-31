/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-26 14:24:49
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-09-10 10:47:23
 * @FilePath: /vue-source/packages/runtime-core/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ShapeFlags } from "@vue/shared";
import { Fragment, isSameVnode, Text } from "./h";
import { getSequences } from "./seq";
import { reactive, ReactiveEffect } from "@vue/reactivity";

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
  const mountElement = (vnode, container, anchor) => {
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
    hostInsert(el, container, anchor);
  };
  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container, anchor);
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
    // 1.减少比对范围，先比开头和结尾，确定不一样的范围
    // 2.中间部分不同的操作（新增删除）即可
    // 开始比对的索引
    let i = 0;
    // 第一个结束比对的索引
    let e1 = c1.length - 1;
    // 第二个结束比对的索引
    let e2 = c2.length - 1;
    // 1.从头开始遍历
    while (i <= e1 && i <= e2) {
      // 有任何一个不相等，就跳出循环
      const n1 = c1[i]; // 老节点
      const n2 = c2[i]; // 新节点
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, container); // 更新当前节点的属性和儿子 （递归比较子节点）
      } else {
        break;
      }
      i++;
    }
    // 2.从尾部开始遍历
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
    // 3.比开头和结尾之后，中间部分的处理
    if (i > e1) {
      // 3.1 如果新节点比老节点多，那么新增
      if (i <= e2) {
        const nextPos = e2 + 1; // 新节点的下一个位置  这里是判断下一个节点是否存在来判断是insert还是insertBefore
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 3.2 如果老节点比新节点多，那么删除
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      console.log(3333);
      // 3.3 中间部分的处理
      // 3.3.1 需要一个map来存储老节点的key和索引的关系
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = new Map(); //做一个映射表用户快速查找，看老的是否在新的里面还有，没有就删除，有就更新
      const toBePatched = e2 - s2 + 1; // 新节点需要比对的个数  要倒序插入的个数
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0); // 新节点和旧节点的映射表 新的索引去映射老的索引 [0,0,0,0]
      // 根据最长递增子序列求出对应的‘索引结果’
      // 根据新的节点，找到对应老的位置

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i); // 存储新节点的key和索引的关系
      }
      // let patched = 0;
      // let moved = false;
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        // if (patched >= toBePatched) {
        //   // 如果已经比对完，那么剩下的就是删除
        //   unmount(prevChild);
        //   continue;
        // }
        let newIndex = keyToNewIndexMap.get(prevChild.key);
        if (newIndex === undefined) {
          console.log(1111);
          // 如果没有找到，那么就是删除
          unmount(prevChild);
        } else {
          console.log(2222);
          // 比较前后节点的差异，更新属性和儿子
          // 我们i 可能会存在是0的情况，为了保证0是没有比对过的元素，所以需要+1
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container);
        }
        console.log(
          "🚀 ~ patchKeyedChildren ~ newIndexToOldIndexMap:",
          newIndexToOldIndexMap
        );
        // 调整顺序
        //  我们可以按照新的队列，倒序插入insertBefore 通过参照物，插入到参照物的前面
        let increasingSeq = getSequences(newIndexToOldIndexMap);
        let j = increasingSeq.length - 1; // 最大递增子序列的最后一个索引
        console.log("🚀 ~ patchKeyedChildren ~ increasingSeq:", increasingSeq)
        // 插入的过程中，可能新的元素多，需要创建  toBePatched - 1  索引
        for (let i = toBePatched - 1; i >= 0; i--) {
          console.log("🚀 ~ patchKeyedChildren ~ i:", i);
          // 中间元素的最后一个
          const nextIndex = i + s2;
          const nextChild = c2[nextIndex];
          const anchor =
            nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
          //  h创建的是没有el （真实 Dom的）
          if (!nextChild.el) {
            patch(null, nextChild, container, anchor); //创建h插入
          } else {
            if (i == increasingSeq[j]) {
              j--  //diff算法优化
            } else {
              hostInsert(nextChild.el, container, anchor); //接着倒序插入
            }

          }
          // if (newIndexToOldIndexMap[i] === 0) {
          //   // 如果是0，说明没有移动过
          //   patch(null, nextChild, container, anchor);
          //   newIndexToOldIndexMap[i] = i + 1;
          // } else {
          //   // 如果不是0，说明移动过，需要调整顺序
          //   const curIndex = newIndexToOldIndexMap[i] - 1;
          //   if (curIndex < maxNewIndexSoFar) {
          //     // 如果当前索引小于最大索引，说明需要移动
          //     patch(prevChild, nextChild, container, anchor);
          //     newIndexToOldIndexMap[i] = i + 1;
          //   } else {
          //     maxNewIndexSoFar = curIndex;
          //   }
          // }
        }
        // if (prevChild.key != null) {
        //   newIndex = keyToNewIndexMap.get(prevChild.key);
        // } else {
        //   for (let j = s2; j <= e2; j++) {
        //     if (isSameVnode(prevChild, c2[j])) {
        //       newIndex = j;
        //       break;
        //     }
        //   }
        // }
      }
      // if (newIndexToOldIndexMap.every((i) => i === 0)) {
      //   // 没有移动
      //   unmountChildren(c1.slice(s1, e1 + 1));
      //   mountChildren(c2.slice(s2, e2 + 1), container);
      // }
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
    // 如果还没有创建文本
    if (n1 == null) {
      // 1.虚拟节点要关联真是节点
      // 2.将节点插入到页面中
      hostInsert(n2.el = hostCreateText(n2.children, container))
    } else {
      const el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  };
  /**
   * 处理文本
   * @param n1 
   * @param n2 
   * @param container 
   */
  const processFragment = (n1, n2, container) => {
    if (n1 == null) {
      mountChildren(n2.children, container);
    } else {
      patchKeyedChildren(n1.children, n2.children, container);
    }
  };
  const mountComponent = (n2, container, anchor) => {
    // 组件可以基于自己的状态重新渲染effect
    const { data = () => { }, render = () => { } } = n2.type
    const state = reactive(data());
    const instance = {
      state,//状态
      vnode: n2,//组件的虚拟节点 
      subTree: null,//子树
      isMounted: false,//是否挂载完成
      update: null //组件的更新函数
    }
    const componentFn = () => {
      // 我们要在这里区分，是第一次还是之后的
      if (!instance.isMounted) {
        
        const  subTree=render.call(state,state) //this指向state,proxy 也是state
        patch(null, subTree, container, anchor)
        instance.isMounted = true
        instance.subTree=subTree
      } else {
        // 基于状态的组件更新
        const subTree = render.call(state, state)
        // 比较上一次子树和这次子树
        patch(instance.subTree, subTree, container, anchor)
        instance.subTree = subTree
      }
    }
    const update = (instance.update=() =>  effect.run() )
    const effect = new ReactiveEffect(componentFn, () => update())
    update()
  };
  const processComponent = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountComponent(n2, container, anchor);
    } else {
      updateComponent(n1, n2);
    }
  };
  const patch = (n1, n2, container, anchor = null) => {
    console.log("🚀 ~ patch ~ n1, n2:", n1, n2);
    if (n1 == n2) {
      return;
    }
    // 更新操作
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null; // 卸载完成之后，n1就为null了 ,会执行n2的初始化操作
    }
    const { type ,shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {  //vue3中对于函数式组件已经废弃了，没有性能节约
          processComponent(n1, n2, container, anchor);
        }
    }
  };

  function unmount(vnode) {
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children)
    } else {
      return hostRemove(vnode.el);
    }
  }
  // 多次调用render会进行虚拟节点的比较，在进行更新

  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        // 卸载操作
        unmount(container._vnode);
      }
    } else {
      // 将虚拟节点变成真实节点进行渲染
      patch(container._vnode || null, vnode, container);
      console.log("🚀 ~ render ~ container:", container?._vnode);

      container._vnode = vnode;
    }

  };
  return {
    render,
  };
}
export * from "./h";
