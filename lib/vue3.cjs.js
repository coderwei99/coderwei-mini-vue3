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
// 判断是否为数组
const isArray = Array.isArray;
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
// 空对象
const EMPTY_OBJECT = {};

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

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._value = convert(value);
        this._rawValue = value;
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue))
            return;
        this._value = convert(newValue);
        this._rawValue = newValue; //每次更新都需要重新设置一次_rawValue  因为constructor只会执行一次 在new的时候
        triggerEffect(this.dep);
    }
}
// 如果ref的新值是一个对象 那么需要进行递归处理  与reactive模块的嵌套对象处理类似
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(dep) {
    if (isTracking()) {
        tarckEffect(dep);
    }
}
// 判断是否是相同的值 如果ref是相同的值 就不需要触发依赖
function hasChanged(value, oldValue) {
    return Object.is(value, oldValue);
}
function ref(value) {
    return new RefImpl(value);
}
// isRef的实现
function isRef(ref) {
    return !!(ref && ref.__v_isRef);
}
// unref的实现
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
// proxyRefs的实现
function proxyRefs(value) {
    return isReactive(value)
        ? value
        : new Proxy(value, {
            get(target, key) {
                // console.log("执行了", target, key);
                return unref(Reflect.get(target, key));
            },
            set(target, key, value) {
                if (isRef(target[key]) && !isRef(value)) {
                    target[key].value = value;
                    return true;
                }
                return Reflect.set(target, key, value);
            },
        });
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
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
// 当用户传入文本的时候 需要创建一个虚拟节点 不然patch无法渲染的
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

// 如果children里面有slot，那么把slot挂载到instance上
function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* ShapeFlags.SLOTS_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
// 具名name作为instance.slots的属性名，属性值是vnode
function normalizeObjectSlots(slots, children) {
    // console.log("slots children===>", children);
    // 遍历对象
    for (let key in children) {
        const value = children[key];
        // console.log(value, "value");
        slots[key] = props => normalizeSlotValue(value(props));
        // slots[key] = normalizeSlotValue(value)
    }
}
// 转成数组
function normalizeSlotValue(value) {
    return isArray(value) ? value : [value];
}
function renderSlot(slots, name = "default", props) {
    // console.log("开始执行renderslot");
    const slot = slots[name]; //插槽名字有默认值  如果用户什么都不传 遵循官网的用法  默认使用default
    // console.log("slot==>", slots, slot);
    if (slot) {
        // slot是一个函数的时候说明用户传入的是插槽
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
            // return createVNode(Fragment, {}, slot);
        }
    }
    else {
        return slots;
    }
}

const publicPropertiesMap = {
    $slots: instance => instance.slots,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // console.log("key", key);
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            // console.log("hasown", Object.prototype.hasOwnProperty.call(props, key));
            // 用户访问的key是props的某个key
            return props[key];
        }
        const createGetter = publicPropertiesMap[key];
        // console.log(instance);
        if (createGetter)
            return createGetter(instance);
    },
};

function emit(instance, eventName, ...arg) {
    // console.log(eventName);
    // 先从实例中拿出props
    const { props } = instance;
    const event = toHandlerKey(camelCase(eventName));
    // console.log("event", event);
    const handle = props[event];
    // console.log(props, "props");
    handle && handle(...arg);
}

// 初始化props
function initProps(instance, props) {
    instance.props = props || {};
}

// 保存组件实例  便于getCurrentInstance 中返回出去
exports.currentInstance = null;
// 设置组件实例函数
function setCurrentInstance(instance) {
    exports.currentInstance = instance;
}
// 获取当期组件实例
function getCurrentInstance() {
    return exports.currentInstance;
}
// 创建组件实例 本质上就是个对象 vnode+type
function createComponentInstance(vnode, parentComponent) {
    const type = vnode.type;
    const instance = {
        type,
        vnode,
        props: {},
        emit: () => { },
        slots: {},
        provides: parentComponent
            ? parentComponent.provides
            : {},
        parent: parentComponent,
        isMouted: false,
        subTree: {},
    };
    // console.log("vnode", instance);
    // console.log("emit", emit);
    // emit初始化
    instance.emit = emit.bind(null, instance);
    // console.log(instance);
    return instance;
}
// 安装组件函数
function setupComponent(instance) {
    // console.log("setupComponent instance", instance);
    // 初始化props
    initProps(instance, instance.vnode.props);
    // 初始化slots
    // console.log("初始化slots之前", instance.vnode.children);
    initSlots(instance, instance.vnode.children);
    // console.log(instance);
    // 初始化组件状态
    setupStateFulComponent(instance);
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
        // console.log("instance emit", instance.emit);
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        // 这里考虑两种情况，一种是setup返回的是一个对象，那么可以将这个对象注入template上下文渲染，另一种是setup返回的是一个h函数，需要走render函数
        handleSetupResult(instance, setupResult);
        setCurrentInstance(null);
    }
    // 结束组件安装
    finishComponentSetup(instance);
}
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) ;
    else if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
    }
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (instance) {
        instance.render = component.render;
    }
}
// provide 函数的实现
function provide(key, value) {
    var _a;
    let currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // console.log("provides", provides);
        // console.log("parentProvides", parentProvides);
        if (provides === parentProvides) {
            // 把provide原型指向父组件的provide
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
// inject 函数的实现
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvide = currentInstance.parent.provides;
        if (key in parentProvide) {
            return parentProvide[key];
        }
        else {
            if (isFunction(defaultValue)) {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function render(vnode, container) {
    // TODO
    patch(null, vnode, container, null);
    // console.log(vnode);
}
function patch(n1, n2, container, parentComponent) {
    // console.log(n1, n2);
    if (!n2)
        return;
    // Fragment\Text 进行单独处理 不要强制在外层套一层div  把外层标签嵌套什么交给用户决定 用户甚至可以决定什么都不嵌套
    if (n2.type == Fragment) {
        // console.log(vnode, "vnode === far");
        mountChildren(n2.children, container, parentComponent);
    }
    if (n2.type == Text) {
        processText(n2, container);
    }
    if (typeof n2.type == "string") {
        // TODO 字符串 普通dom元素的情况
        // console.log("type == string", n2);
        processElement(n1, n2, container, parentComponent);
    }
    else if (isObject(n2.type)) {
        // TODO 组件的情况
        // console.log("type == Object", n2);
        mountComponent(n2, container, parentComponent);
    }
}
function mountComponent(vnode, container, parentComponent) {
    processComponent(vnode, container, parentComponent);
}
function processComponent(vnode, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(vnode, parentComponent);
    // console.log(instance);
    // 安装组件
    setupComponent(instance);
    // 对子树进行操作
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    // 通过effect进行包裹 会自动收集依赖 帮助我们在用户使用的变量发生变化时更新视图
    effect(() => {
        //如果isMouted是true 则证明是组件已经挂载过了 后续执行的是update操作 如果不区分更新和挂载 则造成依赖的数据一旦发生变化就创建一个新的节点
        if (!instance.isMouted) {
            // console.log("sub", instance.render);
            // console.log("sub", instance.render());
            // 这里我们通过call 对render函数进行一个this绑定  因为我们会在h函数中使用this.xxx来声明的变量
            const subTree = instance.render.call(instance.proxy);
            instance.subTree = subTree;
            // 对子树进行patch操作
            patch(null, subTree, container, instance);
            // console.log(subTree);
            instance.isMouted = true; //将isMouted设置为true  代表已挂载 后续执行更新操作
            vnode.el = subTree.el;
        }
        else {
            // TODO  update 逻辑
            // console.log("跟新视图");
            // 这里处理更新的逻辑
            // 新的vnode
            const subTree = instance.render.call(instance.proxy);
            // 老的vnode
            const prevSubTree = instance.subTree;
            // 存储这一次的vnode，下一次更新逻辑作为老的vnode
            instance.subTree = subTree;
            patch(prevSubTree, subTree, container, instance);
            // console.log("prevSubTree", prevSubTree);
            // console.log("subTree", subTree);
        }
    });
}
//判断字符串是否以on开头并且第三个字符为大写
// example: onClick ==> true、 onclick ==> false
const isOn = (key) => /^on[A-Z]/.test(key);
// 加工type是string的情况
function processElement(n1, n2, container, parentComponent) {
    //  判断是挂载还是更新
    if (!n1) {
        // 如果n1 就是旧节点 没有的情况下 就说明是挂载
        mountElement(n2, container, parentComponent);
    }
    else {
        // 反之 patch 更新
        patchElement(n1, n2, container, parentComponent);
    }
}
// 处理元素是字符串情况下的更新逻辑
function patchElement(n1, n2, container, parentComponent) {
    // console.log("patch", n2);
    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;
    // console.log(el);
    const el = (n2.el = n1.el);
    // console.log(n1);
    // console.log(n2);
    // console.log(el, "el");
    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el, parentComponent);
}
// 处理children更新逻辑
function patchChildren(n1, n2, container, parentComponent) {
    /**
     拿到新旧节点的shapeFlag  判断是变化的情况  一般分成四种情况
     * 1. string === array
     * 2. string === string
     * 3. array ==== string
     * 4. array ==== array
     */
    let prevShapeFlag = n1.shapeFlag;
    let newShapeFlag = n2.shapeFlag;
    // 拿到新旧节点的children
    let prevChildren = n1.children;
    let newChildren = n2.children;
    if (newShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
        // 新节点是文本节点的情况
        if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 旧节点是数组的情况   走到这里说明是 array === string的更新
            // console.log("array === string");
            // 1. 卸载节点
            // console.log(container, "container");
            unmountChildren(container);
        }
        // 2. 设置children  children是一个string 直接设置即可
        // console.log("prechildren", prevChildren);
        // console.log("newChildren", newChildren);
        if (prevChildren !== newChildren) {
            container.textContent = newChildren;
        }
    }
    else if (newShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
        // 新节点是数组的情况
        if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            // 旧节点是文本节点  走到这里说明 string === array
            // console.log("string === array");
            container.textContent = "";
            // 处理array
            mountChildren(newChildren, container, parentComponent);
        }
    }
}
// 卸载children
function unmountChildren(children) {
    // console.log("children", children.length);
    for (let i = 0; i < children.length; i++) {
        remove(children[i].el);
    }
}
// 移除节点函数
function remove(child) {
    const parent = child.parentNode;
    // console.log("parent", parent);
    if (parent) {
        parent.removeChild(child);
    }
}
// 处理props的更新逻辑
function patchProps(el, oldProps, newProps) {
    for (let key in newProps) {
        const newProp = newProps[key];
        const oldProp = oldProps[key];
        if (newProp !== oldProp) {
            patchProp(el, key, oldProp, newProp);
        }
    }
    for (let key in oldProps) {
        // 新的props没有该属性
        if (!(key in newProps)) {
            patchProp(el, key, oldProps[key], null);
        }
    }
}
function patchProp(el, key, oldValue, newValue) {
    if (Array.isArray(newValue)) {
        el.setAttribute(key, newValue.join(" "));
    }
    else if (isOn(key) && isFunction(newValue)) {
        el.addEventListener(key.slice(2).toLowerCase(), newValue);
    }
    else {
        if (newValue === null || newValue === undefined) {
            // 删除
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newValue);
        }
    }
}
function mountElement(vnode, container, parentComponent) {
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props } = vnode;
    // children 可能是数组 也可能是字符串需要分开处理
    if (isString(children)) {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el, parentComponent);
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
    // console.log("container", container.childNodes);
}
// 处理children是数组的情况
function mountChildren(children, container, parentComponent) {
    // 走到这里说明vnode.children是数组 遍历添加到container
    // console.log(children, "children");
    children.forEach(node => {
        // console.log("处理children是数组的情况", node);
        patch(null, node, container, parentComponent);
    });
}
// 处理文本节点
function processText(vnode, container) {
    mountText(vnode, container);
}
function mountText(vnode, container) {
    // console.log("vnode", vnode);
    // 因为经过createVNode 函数处理 所以返回的是一个对象  文本在vnode.children下面
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
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
exports.Fragment = Fragment;
exports.Text = Text;
exports.cleanupEffect = cleanupEffect;
exports.convert = convert;
exports.createApp = createApp;
exports.createComponentInstance = createComponentInstance;
exports.createGetter = createGetter;
exports.createSetter = createSetter;
exports.createTextVNode = createTextVNode;
exports.createVNode = createVNode;
exports.effect = effect;
exports.emit = emit;
exports.getCurrentInstance = getCurrentInstance;
exports.getShapeFlag = getShapeFlag;
exports.h = h;
exports.hasChanged = hasChanged;
exports.initProps = initProps;
exports.initSlots = initSlots;
exports.inject = inject;
exports.isOn = isOn;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.isShallow = isShallow;
exports.isTracking = isTracking;
exports.mutableHandlers = mutableHandlers;
exports.normalizeChildren = normalizeChildren;
exports.patchChildren = patchChildren;
exports.patchProp = patchProp;
exports.patchProps = patchProps;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.publicInstanceProxyHandlers = publicInstanceProxyHandlers;
exports.reactive = reactive;
exports.readonly = readonly;
exports.readonlyHandlers = readonlyHandlers;
exports.ref = ref;
exports.remove = remove;
exports.render = render;
exports.renderSlot = renderSlot;
exports.setCurrentInstance = setCurrentInstance;
exports.setupComponent = setupComponent;
exports.shallowReactive = shallowReactive;
exports.shallowReactiveHandlers = shallowReactiveHandlers;
exports.shallowReadonly = shallowReadonly;
exports.shallowReadonlyHandlers = shallowReadonlyHandlers;
exports.stop = stop;
exports.tarckEffect = tarckEffect;
exports.toRaw = toRaw;
exports.track = track;
exports.trackRefValue = trackRefValue;
exports.trigger = trigger;
exports.triggerEffect = triggerEffect;
exports.unref = unref;
