export function effect(fn, options?) {
  // 1. 创建effect的时候，会先执行一次fn，此时会访问到响应式数据，触发get
  // 2. 当响应式数据变化的时候，会触发set，此时会执行effect的run方法
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}
export let activeEffect;
class ReactiveEffect {
  // 默认是响应式的
  public active = true;
  // fn用户编写的函数，scheduler(数据发生变化调用run)调度函数
  constructor(public fn, public scheduler) {}
  run() {
    if (!this.active) {
      // 不是激活的，执行后什么都不做
      return this.fn();
    }
    let lastEffect = activeEffect;
    try {
      activeEffect = this;

      return this.fn(); //依赖收集
    } finally {
      activeEffect = lastEffect;
    }
  }
}
