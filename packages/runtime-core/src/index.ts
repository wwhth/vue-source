import { ShapeFlags } from "@vue/shared";

/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-26 14:24:49
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-08-26 17:01:36
 * @FilePath: /vue-source/packages/runtime-core/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
        patchProp: hostPatchProp
    } = options;
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            patch(null, child, container)
        }
    }
    const mountElement = (vnode, container) => {
        const { type, children, props, shapFlag } = vnode
        let el = hostCreateElement(type)
        if (props) {
            for (const key in props) {
                const val = props[key]
                hostPatchProp(el, key, null, val)
            }
        }
        // 9 & 8 > 0 说明children是文本节点
        if (shapFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children)
        } else if (shapFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el)
        }
        hostInsert(el, container)
    }
    const patch = (n1, n2, container) => {
        if (n1 == n2) {
            return
        }
        if (n1 === null) {
            // 初始化操作
            mountElement(n2, container)
        }
    }
    // 多次调用render会进行虚拟节点的比较，在进行更新

    const render = (vnode, container) => {
        // 将虚拟节点变成真实节点进行渲染
        patch(container._vnode || null, vnode, container)

        container._vnode = vnode
    }
    return {
        render
    }
}
export default {}