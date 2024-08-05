export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export enum DirtyLevels {
  Dirty = 4, //脏检测 意味着取值要运行计算属性
  NoDirty = 0, //不脏 用上次的结果
}
