export function effect(fn, options?) {
  // 1. 创建effect的时候，会先执行一次fn，此时会访问到响应式数据，触发get
  // 2. 当响应式数据变化的时候，会触发set，此时会执行effect的run方法
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
}
export let activeEffect;

function preCleanEffect(effect) {
  effect._depLength = 0;
  effect._trackId++; //每次执行，trackId+1 ，如果当前同一个effect执行，id就是相同的
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depLength) {
    for (let i = effect._depLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect); //删除映射表对应的effect
    }
    effect.deps.length = effect._depLength; //更新依赖列表的长度
  }
}
class ReactiveEffect {
  public _trackId = 0; //记录当前的effect执行了几次
  public deps = [];
  public _depLength = 0;
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
      preCleanEffect(this);
      return this.fn(); //依赖收集
    } finally {
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false;
  }
}
function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) {
    dep.__cleanup__();
  }
}

// 双向记忆
// trackId 用于记录effect执行了几次（防止一个属性在一个effect中多次收集依赖），多次访问只收集一次
// depLength 用于记录effect关联了几个dep
export function trackEffect(effect, dep) {
  // 需要重新设计收集依赖，每次执行的时候，都需要清空
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
    let oldDep = effect.deps[effect._depLength];
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect);
      }
      effect.deps[effect._depLength++] = dep; //按照本次最新的来存放
    } else {
      effect._depLength++;
    }
  }
  // dep.set(effect, effect._trackId);
  // // 我还想effect和dep关联起来
  // effect.deps[effect._depLength++] = dep;
  console.log("🚀 ~ trackEffect ~ effect.deps:", effect, dep);
}

export function triggerEffects(dep) {
  console.log("🚀 ~ triggerEffects ~ dep:", dep);
  for (const effect of dep.keys()) {
    console.log("111111", effect);
    if (effect.scheduler) {
      effect.scheduler();
    } else {
    }
  }
}
