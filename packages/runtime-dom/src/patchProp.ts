// 主要对节点元素的属性操作 class style event 普通属性
// diff


function patchClass(el, value) {
    // 如果value为空，则移除class
    if (value == null) {
        el.removeAttribute('class')
    } else {
        el.className = value
    }
}

function patchStyle(el, prevValue, nextValue) {
    let style = el.style
    for (let key in nextValue) {
        style[key] = nextValue[key] //新的要生效的样式
    }
    if (prevValue) {
        for (let key in prevValue) {
            if (nextValue[key] == null) {
                style[key] = ''
            }
        }
    }
}
function patchEvent(el, key, value) {
    // vue_event_invoker
    const invokers = el._vei || (el._vei = {})
    // 事件名
    const name = key.slice(2).toLowerCase()
    //是否存在同名的事件绑定
    const exisitingInvokers = invokers[key]
    if (value && exisitingInvokers) {
        return exisitingInvokers.value = value
    }
    if (value) {
        const invoker = el._vei[key] = createInvoker(value)
        return el.addEventListener(name, invoker)
    }
    if (exisitingInvokers) { //现在没有，以前有
        el.removeEventListener(key, exisitingInvokers)
        invokers[key] = null
    }

}
function createInvoker(value) {
    const invoker = (e) => {
        invoker.value(e)
    }
    invoker.value = value //更改invoker中的value属性，可以修改对应的调用函数
    return invoker
}
function patchAttr(el, key, value) {
    // 如果value为空，则移除属性
    if (value == null) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, value)
    }
}
function isOn(key) {
    return /^on[A-Z]/.test(key)
}
export default function patchProp(el, key, prevValue, nextValue) {
    if (key === 'class') {
        return patchClass(el, nextValue)
    } else if (key === 'style') {
        return patchStyle(el, prevValue, nextValue)
    } else if (isOn(key)) {
        return patchEvent(el, key, nextValue)
    } else {
        return patchAttr(el, key, nextValue)
    }
}