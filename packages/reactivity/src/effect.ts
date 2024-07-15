export function effect(fn) {
  // 1. 创建effect的时候，会先执行一次fn，此时会访问到响应式数据，触发get
  // 2. 当响应式数据变化的时候，会触发set，此时会执行effect的run方法
  fn();
}
