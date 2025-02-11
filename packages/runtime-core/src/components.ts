import { reactive } from "@vue/reactivity";
import { hasOwn, isFunction } from "@vue/shared";

export function createComponentInstance(vnode) {
  // 创建组件实例
  const instance = {
    data: null, //状态
    vnode, //组件的虚拟节点
    subTree: null, //子树
    isMounted: false, //是否挂载完成
    update: null, //组件的更新函数
    props: {}, //props
    attrs: {}, //attrs
    propsOptions: vnode.type.props, //props选项
    component: null, //组件实例
    proxy: null, //代理props,arrts,data ，让用户更方便的使用
  };
  return instance;
}

// 初始化props
const initProps = (instance, rawProps) => {
  const props = {};
  const attrs = {};
  const propsOptions = instance.propsOptions || {}; //用户在组件中定义的
  if (rawProps) {
    for (const key in rawProps) {
      //用所有的来分裂
      const value = rawProps[key];
      if (key in propsOptions) {
        props[key] = value; //props不需要深度代理，组件不能更改props，只能传入
      } else {
        attrs[key] = value;
      }
    }
    // props
    // if (key.startsWith("on")) {
    //   // 事件
    //   const event = key.slice(2).toLowerCase();
    //   instance.vnode.props[event] = rawProps[key];
    // } else {
    //   // attrs
    //   instance.attrs[key] = rawProps[key];
    // }
  }
  instance.attrs = attrs;
  instance.props = reactive(props);
};
const publicProperty = {
  $attrs: (instance) => instance.attrs,
  $data: (instance) => instance.data,
  $props: (instance) => instance.props,
  $slots: (instance) => instance.vnode.children,
};
const handler = {
  get(target, key) {
    const { state, props, attrs } = target;
    if (state && hasOwn(state, key)) {
      return state[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    } else if (attrs && hasOwn(attrs, key)) {
      return attrs[key];
    }

    const getter = publicProperty[key]; //如果用户访问了$data，$props，$attrs，$slots，那么就返回对应的值
    if (getter) {
      return getter(target);
    }
  },
  // 对于一些无法修改的属性 $attrs,$slots ... 只能读取，没有set方法
  set(target, key, value) {
    const { state, props, attrs } = target;
    if (state && hasOwn(state, key)) {
      state[key] = value;
    } else if (props && hasOwn(props, key)) {
      // props[key] = value
      console.warn("不能修改props");
    }
    return true;
  },
};
export function setupComponent(instance) {
  const { props, type } = instance.vnode;
  // 赋值属性
  initProps(instance, props);

  //赋值代理对象
  instance.proxy = new Proxy(instance, handler);

  const { data, render } = type;
  if (!isFunction(data)) {
    return console.warn("data必须是一个函数");
  }
  // data中可以拿到props
  instance.data = reactive(data.call(instance.proxy));
  instance.render = render;
}
