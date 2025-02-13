/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-23 15:30:11
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-08-23 17:02:49
 * @FilePath: /vue-source/packages/runtime-dom/src/nodeOps.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 主要对节点元素的增删改查
export const nodeOps = {
    insert(el, parent, anchor) {
        console.log("🚀 ~ insert ~ parent:", parent)
        // appendChild el.insert()  parent.insertBefore(el,otherEle||null)  第三个参数不传的话等价于appendChild
        parent.insertBefore(el, anchor || null)
    },
    remove(el) {
        // 移除dom元素
        const parent = el.parentNode
        if (parent) {
            parent.removeChild(el)
        }
    },
    createElement(type) {
        return document.createElement(type)
    },
    createText(text) {
        return document.createTextNode(text)
    },
    setText(node, text) {
        node.nodeValue = text
    },
    setElementText(el, text) {
        el.textContent = text
    },
    parentNode(node) {
        return node.parentNode
    },
    nextSibling(node) {
        return node.nextSibling
    }
}