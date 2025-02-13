/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-23 11:24:03
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-08-26 14:36:26
 * @FilePath: /vue-source/packages/runtime-dom/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";
import { createRenderer } from "@vue/runtime-core";
const renderOptions = Object.assign({ patchProp }, nodeOps);
export { renderOptions };
console.log("🚀 ~ renderOptions:", renderOptions) 
// render方法采用dom api来进行渲染
export const render = (vnode, container) => {
  console.log("🚀 ~ render ~ vnode:", vnode,container)
  return createRenderer(renderOptions).render(vnode, container);
};

export * from "@vue/runtime-core";
