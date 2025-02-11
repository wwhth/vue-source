/*
 * @Author: wwhth zhangyunzhi@vrvmail.com.cn
 * @Date: 2024-08-23 11:24:03
 * @LastEditors: wwhth zhangyunzhi@vrvmail.com.cn
 * @LastEditTime: 2024-08-26 16:46:23
 * @FilePath: /vue-source/packages/shared/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export function isObject(val: unknown): boolean {
  return val !== null && typeof val === "object";
}

export function isFunction(val: unknown): boolean {
  return typeof val === "function";
}

export function isString(val: unknown): boolean {
  return typeof val === "string";
}

export function isNumber(val: unknown): boolean {
  return typeof val === "number";
}

export function isSymbol(val: unknown): boolean {
  return typeof val === "symbol";
}

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwn(val, key) {
  return hasOwnProperty.call(val, key);
}
export * from "./shapeFlags";
