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
