/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-23 11:24:03
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-08-23 15:41:28
 * @FilePath: /vue-source/packages/runtime-dom/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";

const renderOptions = Object.assign({ patchProp }, nodeOps);
export { renderOptions };
export * from "@vue/reactivity";
// function createRenderer(option) {
//   const {
//     createElement: hostCreateElement,
//     patchProp: hostPatchProp,
//     insert: hostInsert,
//     remove: hostRemove,
//     setElementText: hostSetElementText,
//   } = option;
// }

// createRenderer(renderOptions);
