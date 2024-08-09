import { isFunction, isObject } from "@vue/shared"
import { ReactiveEffect } from "./effect"
import { isReactive } from "./reactive";
import { isRef } from "./ref";

export function watch(source, cb, options) {
    // source: ref, reactive, function
    // cb: function
    // options: immediate, deep  
    // watchEffect也是如此
    return doWatch(source, cb, options)
}
export function watchEffect(effect, options) {
    return doWatch(effect, null, options)
}
// 遍历source，收集依赖
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
    console.log("%c Line:13 🍩 source", "color:#4fff4B", source);

    if (!isObject(source)) {
        return source
    }
    if (depth) {
        if (currentDepth >= depth) {
            return source
        }
        currentDepth++
    }
    if (seen.has(source)) {
        return source
    }
    seen.add(source) // 防止循环引用
    // 遍历触发每个effect的get  收集依赖
    for (const key in source) {
        traverse(source[key], depth, currentDepth, seen)
    }
    return source
    // if (depth !== undefined && currentDepth >= depth) {
    //     return source
    // }
    // if (seen.has(source)) {
    //     return source
    // }
    // seen.add(source) // 防止循环引用
    // for (const key in source) {
    //     traverse(source[key], depth, currentDepth + 1, seen)
    // }
    // return source
}
function doWatch(source, cb, { deep, immediate }) {
    // source => getter
    const reactiveGetter = (source) => traverse(source, deep === false ? 1 : undefined)
    // 产生一个可以给ReactiveEffect使用的getter，需要对这个对象进行取值操作，会关联当前的reacttiveEffect
    let getter
    if (isReactive(source)) {
        getter = () => reactiveGetter(source)
    } else if (isRef(source)) {
        getter = () => source.value
    } else if (isFunction(source)) {
        getter = source
    }

    let oldValue

    const job = () => {
        if (cb) {
            const newValue = effect.run()
            cb(newValue, oldValue)
            oldValue = newValue
        } else {
            effect.run() // 更新再执行
        }
    }
    const effect = new ReactiveEffect(getter, job)
    if (cb) {
        if (immediate) {
            job()
        } else {
            oldValue = effect.run()
        }
    } else {
        // watchEffect
        effect.run() // 默认会执行一次
    }
    const unwatch = () => {
        effect.stop()
    }
    return unwatch
}