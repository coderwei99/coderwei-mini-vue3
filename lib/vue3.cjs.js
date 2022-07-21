'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let activeEffect;
let shouldTrack = false;
class EffectDepend {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true; //effect是否存活
        this.deps = []; //存储依赖的集合  方便后续stop方法删除对应的依赖
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        activeEffect = this;
        shouldTrack = true;
        let returnValue = this._fn();
        shouldTrack = false;
        return returnValue;
    }
    stop() {
        var _a;
        //为了从性能考虑没必要每次都执行 因为同一个依赖 删除一次就够了 所以这里进行判断 只有当前依赖存活的时候 才将其依赖 移除的同事将其设置为false(失活)
        if (this.active) {
            cleanupEffect(this);
            (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    }
}
/**
 *
 * @param effect 响应式实例
 * 删除依赖
 */
function cleanupEffect(effect) {
    for (const dep of effect.deps) {
        dep.delete(effect);
        effect.active = false;
    }
}
function effect(fn, options) {
    const _effect = new EffectDepend(fn, options === null || options === void 0 ? void 0 : options.scheduler);
    _effect.onStop = options === null || options === void 0 ? void 0 : options.onStop;
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
// 抽离收集依赖  方便在ref函数中使用
function tarckEffect(dep) {
    // 如果set中已经有了对应的activeEffect依赖 那么就不需要再次进行收集依赖
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect === null || activeEffect === void 0 ? void 0 : activeEffect.deps.push(dep);
}
// 抽离触发依赖 方便在ref函数中使用
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
const targetMap = new Map();
function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}
/**
 *
 * @param target 数据源对象
 * @param key 对应的key值
 */
function track(target, key) {
    // 首先拦截不必要的依赖
    if (!isTracking())
        return;
    // target  --->  key ---> dep
    // 根据target源对象  拿到一个由key:响应式函数组成的set组成的map， 然后根据这个key获取到对应的set
    /**
     * targetMap {
     *   target:{key:Set()}
     * }
     * 也就是通过 targetMap.get(target); 获取到target对应的val
     * 然后由于他还是一个map，然后通过depsMap.get(key); 拿到对应的set  这样就可以获取到对应的依赖集合
     */
    let depsMap = targetMap.get(target);
    // 考虑第一次没有拿到的情况---初始化
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    // 考虑第一次没有拿到的情况---初始化
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    tarckEffect(dep);
}
/**
 *
 * @param target 用户访问的对象
 * @param key 需要触发对应的key
 */
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key); //这里用可选运算符  因为没办法保证depsMap一定有对象
    if (dep) {
        triggerEffect(dep);
    }
}
/**
 *
 * @param runner effect的返回值
 */
function stop(runner) {
    runner.effect.stop();
}

/**
 *
 * @param target 源对象
 * @param handlers get/set等方法
 * @returns
 */
function createReactiveObject(target, handlers) {
    return new Proxy(target, handlers);
}

// 判断是否为一个对象
function isObject(value) {
    return typeof value !== null && typeof value === "object";
}
// 判断是否是一个函数
function isFunction(value) {
    return typeof value == "function";
}
// 判断是否是一个字符串
function isString(value) {
    return typeof value == "string";
}
// 判断某个key是否在指定对象上
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);
// 去除用户输入的事件名中间的-  比如说: 'my-btn-click'  ===> myBtnClick
const camelCase = (str) => {
    // console.log("str", str);
    return str.replace(/-(\w)/g, (_, $1) => {
        return $1.toUpperCase();
    });
};
// 首字母大写处理
const capitalize = (str) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
// 事件名前面+on  并且确保on后的第一个字母为大写
const toHandlerKey = (eventName) => {
    return eventName ? "on" + capitalize(eventName) : "";
};

/**
 *
 * @param isReadonly 是否为只读对象
 * @param isShallow 是否为shallowReadonly对象
 * @returns
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === exports.ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        else if (key === exports.ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === exports.ReactiveFlags.IS_SHALLOW) {
            return isShallow;
        }
        else if (key === exports.ReactiveFlags.IS_RAW) {
            return target;
        }
        // 只读对象不需要收集依赖
        if (!isReadonly) {
            track(target, key);
        }
        //  判断是否为嵌套对象 如果是嵌套对象并且isShallow为默认值false  根据isReadonly判断递归调用readonly还是reactive
        if (isObject(res) && !isShallow) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, val) {
        const res = Reflect.set(target, key, val);
        trigger(target, key);
        return res;
    };
}
// 执行一次createGetter/createSetter函数，避免每次调用一次
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
// reactive响应式对象的handle捕获器
const mutableHandlers = {
    get,
    set,
};
// readonly只读对象的handle捕获器
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, val) {
        console.warn(`${target} do not set ${String(key)} value ${val}, because it is readonly`);
        return true;
    },
};
// reactive 对象
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
//readonly对象
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
// 统一管理isReadonly&isReactive状态
exports.ReactiveFlags = void 0;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
    ReactiveFlags["IS_SHALLOW"] = "__v_isShallow";
    ReactiveFlags["IS_RAW"] = "__v_raw";
})(exports.ReactiveFlags || (exports.ReactiveFlags = {}));
// 判断是否是一个只读对象
function isReadonly(value) {
    return !!value[exports.ReactiveFlags.IS_READONLY];
}
// 判断是否是一个响应式对象
function isReactive(value) {
    return !!value[exports.ReactiveFlags.IS_REACTIVE];
}
// 判断是否是一个shallow对象
function isShallow(value) {
    return !!value[exports.ReactiveFlags.IS_SHALLOW];
}
// 检查对象是否是由 reactive 或 readonly 创建的 proxy。
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
// toRaw方法
function toRaw(value) {
    const raw = value && value[exports.ReactiveFlags.IS_RAW];
    return raw ? raw : value;
}
// 定义shallowReadonly的handlers
const shallowReadonlyHandlers = {
    get: createGetter(true, true),
    set(target, key, val) {
        console.warn(`${target} do not set ${String(key)} value ${val}, because it is readonly`);
        return true;
    },
};
// shallowReadonly的实现
function shallowReadonly(value) {
    return createReactiveObject(value, shallowReadonlyHandlers);
}
// 定义shallowReactive的handlers
const shallowReactiveHandlers = {
    get: createGetter(false, true),
    set,
};
// shallowReactive的实现
function shallowReactive(value) {
    return createReactiveObject(value, shallowReactiveHandlers);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type), //  给vnode提供一个标识符 标志是什么类型的vnode  便于扩展
    };
    // 根据vnode的children类型追加一个新的标识符
    normalizeChildren(vnode, children);
    return vnode;
}
function getShapeFlag(type) {
    return isString(type)
        ? 1 /* ShapeFlags.ELEMENT */
        : isObject(type)
            ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
            : 0;
}
function normalizeChildren(vnode, children) {
    if (isString(children)) {
        // children是字符串的情况下
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        // children是数组的情况下
        vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            // 子级是对象
            vnode.shapeFlag = vnode.shapeFlag | 32 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
}

const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            console.log("hasown", Object.prototype.hasOwnProperty.call(props, key));
            // 用户访问的key是props的某个key
            return props[key];
        }
    },
};

function emit(instance, eventName, ...arg) {
    // console.log(eventName);
    // 先从实例中拿出props
    const { props } = instance;
    const event = toHandlerKey(camelCase(eventName));
    console.log("event", event);
    const handle = props[event];
    console.log(props, "props");
    handle && handle(...arg);
}

function patch(vnode, container) {
    // console.log(vnode);
    if (typeof vnode.type == "string") {
        // TODO 字符串 普通dom元素的情况
        // console.log("type == string", vnode);
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // TODO 组件的情况
        // console.log("type == Object", vnode);
        mountComponent(vnode, container);
    }
}
function mountComponent(vnode, container) {
    processComponent(vnode, container);
}
function processComponent(vnode, container) {
    // 创建组件实例
    const instance = createComponentInstance(vnode);
    // console.log(instance);
    // 安装组件
    setupComponent(instance);
    // 对子树进行操作
    setupRenderEffect(instance, vnode, container);
}
// 创建组件实例 本质上就是个对象 vnode+type
function createComponentInstance(vnode) {
    const type = vnode.type;
    const instance = {
        type,
        vnode,
        props: {},
        emit: () => { },
    };
    // console.log("vnode", instance);
    // console.log("emit", emit);
    // emit初始化
    instance.emit = emit.bind(null, instance);
    console.log(instance);
    return instance;
}
function initProps(instance, props) {
    instance.props = props || {};
}
// 安装组件函数
function setupComponent(instance) {
    // console.log("setupComponent instance", instance);
    // 初始化props
    initProps(instance, instance.vnode.props);
    // 初始化组件状态
    setupStateFulComponent(instance);
}
function setupRenderEffect(instance, vnode, container) {
    // 这里我们通过call 对render函数进行一个this绑定  因为我们会在h函数中使用this.xxx来声明的变量
    const subTree = instance.render.call(instance.proxy);
    // 对子树进行patch操作
    patch(subTree, container);
    // console.log(subTree);
    vnode.el = subTree.el;
}
// 初始化组件状态函数
function setupStateFulComponent(instance) {
    // type是我们创建实例的时候自己手动加上的  -->createComponentInstance函数
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    // console.log("instance", instance);
    const { setup } = Component;
    // 考虑用户没有使用setup语法
    if (setup) {
        console.log("instance emit", instance.emit);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        // 这里考虑两种情况，一种是setup返回的是一个对象，那么可以将这个对象注入template上下文渲染，另一种是setup返回的是一个h函数，需要走render函数
        handleSetupResult(instance, setupResult);
    }
    // 结束组件安装
    finishComponentSetup(instance);
}
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) ;
    else if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (instance) {
        instance.render = component.render;
    }
}
//判断字符串是否以on开头并且第三个字符为大写
// example: onClick ==> true、 onclick ==> false
const isOn = (key) => /^on[A-Z]/.test(key);
// 加工type是string的情况
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children, props } = vnode;
    // children 可能是数组 也可能是字符串需要分开处理
    if (isString(children)) {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 如果是数组 说明是一个嵌套dom元素
        mountChildren(vnode, el);
    }
    // 处理props
    for (const key of Object.getOwnPropertyNames(props)) {
        if (Array.isArray(props[key])) {
            // 数组的情况 比如说class 用户可能给多个class  所以说以空格进行分隔
            /**
             * example
             * h('div',{class:['name','activeName']},'hello vue')
             * 真实dom: <div class = 'name activeName'>hello vue</div>
             */
            el.setAttribute(key, props[key].join(" "));
        }
        else if (isOn(key)) {
            // 走到这里说明是事件 需要给dom元素添加对应的事件
            el.addEventListener(key.slice(2).toLocaleLowerCase(), props[key]);
        }
        else {
            // 单纯的字符串 直接添加属性即可
            el.setAttribute(key, props[key]);
        }
    }
    // 将创建的dom元素添加在父元素
    container.append(el);
}
// 处理children是数组的情况
function mountChildren(vnode, container) {
    // 走到这里说明vnode.children是数组 遍历添加到container
    vnode.children.forEach(node => {
        patch(node, container);
    });
}

function render(vnode, container) {
    // TODO
    patch(vnode, container);
}

function createApp(app) {
    // app就是我们app.js中导出的组件描述  可以说这个app会是最大的组件的描述  后续我们写的任何组件都在他的下层
    // console.log(app);
    const mount = (rootContainer) => {
        const vnode = createVNode(app);
        render(vnode, rootContainer);
    };
    // 返回的是一个对象 所以我们才可以链式调用mount方法
    return {
        mount,
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.EffectDepend = EffectDepend;
exports.cleanupEffect = cleanupEffect;
exports.createApp = createApp;
exports.createGetter = createGetter;
exports.createSetter = createSetter;
exports.effect = effect;
exports.h = h;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isShallow = isShallow;
exports.isTracking = isTracking;
exports.mutableHandlers = mutableHandlers;
exports.reactive = reactive;
exports.readonly = readonly;
exports.readonlyHandlers = readonlyHandlers;
exports.shallowReactive = shallowReactive;
exports.shallowReactiveHandlers = shallowReactiveHandlers;
exports.shallowReadonly = shallowReadonly;
exports.shallowReadonlyHandlers = shallowReadonlyHandlers;
exports.stop = stop;
exports.tarckEffect = tarckEffect;
exports.toRaw = toRaw;
exports.track = track;
exports.trigger = trigger;
exports.triggerEffect = triggerEffect;
