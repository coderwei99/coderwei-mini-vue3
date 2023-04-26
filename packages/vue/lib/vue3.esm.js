// 判断是否为一个对象
function isObject(value) {
    return typeof value !== null && typeof value === 'object';
}
// 判断是否是一个函数
function isFunction(value) {
    return typeof value == 'function';
}
// 判断是否是一个字符串
function isString(value) {
    return typeof value == 'string';
}
// 判断是否是相同的值 如果ref是相同的值 就不需要触发依赖
function hasChanged(value, oldValue) {
    return Object.is(value, oldValue);
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
    return eventName ? 'on' + capitalize(eventName) : '';
};
//判断字符串是否以on开头并且第三个字符为大写
// example: onClick ==> true、 onclick ==> false
const isOn = (key) => /^on[A-Z]/.test(key);
// 空对象
const EMPTY_OBJECT = {};

function toDisplayString(val) {
    return String(val);
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props: props !== null && props !== void 0 ? props : {},
        children,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // 根据vnode的children类型追加一个新的标识符
    normalizeChildren(vnode, children);
    return vnode;
}
function getShapeFlag(type) {
    return isString(type) ? 1 /* ShapeFlags.ELEMENT */ : isObject(type) ? 4 /* ShapeFlags.STATEFUL_COMPONENT */ : 0;
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
        slots[key] = (props) => normalizeSlotValue(value(props));
        // slots[key] = normalizeSlotValue(value)
    }
}
// 转成数组
function normalizeSlotValue(value) {
    return isArray(value) ? value : [value];
}
function renderSlot(slots, name = 'default', props) {
    // console.log("开始执行renderslot");
    const slot = slots[name]; //插槽名字有默认值  如果用户什么都不传 遵循官网的用法  默认使用default
    // console.log("slot==>", slots, slot);
    if (slot) {
        // slot是一个函数的时候说明用户传入的是插槽
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
            // return createVNode(Fragment, {}, slot);
        }
    }
    else {
        return slots;
    }
}

const publicPropertiesMap = {
    $slots: (instance) => instance.slots,
    $props: (instance) => instance.props
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        console.log(instance);
        console.log('key', key);
        console.log('setupState', setupState);
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
    }
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
    // console.log(effect, 'effect')
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
    // console.log(dep, 'dep')
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

/**
 *
 * @param isReadonly 是否为只读对象
 * @param isShallow 是否为shallowReadonly对象
 * @returns
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        else if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_SHALLOW) {
            return isShallow;
        }
        else if (key === ReactiveFlags.IS_RAW) {
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
    set
};
// readonly只读对象的handle捕获器
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, val) {
        console.warn(`${target} do not set ${String(key)} value ${val}, because it is readonly`);
        return true;
    }
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
var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_READONLY"] = "__v_isReadonly";
    ReactiveFlags["IS_SHALLOW"] = "__v_isShallow";
    ReactiveFlags["IS_RAW"] = "__v_raw";
})(ReactiveFlags || (ReactiveFlags = {}));
// 判断是否是一个只读对象
function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}
// 判断是否是一个响应式对象
function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE];
}
// 判断是否是一个shallow对象
function isShallow(value) {
    return !!value[ReactiveFlags.IS_SHALLOW];
}
// 检查对象是否是由 reactive 或 readonly 创建的 proxy。
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
// toRaw方法
function toRaw(value) {
    const raw = value && value[ReactiveFlags.IS_RAW];
    return raw ? raw : value;
}
// 定义shallowReadonly的handlers
const shallowReadonlyHandlers = {
    get: createGetter(true, true),
    set(target, key, val) {
        console.warn(`${target} do not set ${String(key)} value ${val}, because it is readonly`);
        return true;
    }
};
// shallowReadonly的实现
function shallowReadonly(value) {
    return createReactiveObject(value, shallowReadonlyHandlers);
}
// 定义shallowReactive的handlers
const shallowReactiveHandlers = {
    get: createGetter(false, true),
    set
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
            }
        });
}

class ComputedRefImpl {
    constructor(get, set) {
        this.set = set;
        this._dirty = true;
        this._getter = get;
        this._effect = new EffectDepend(get, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        if (this._dirty) {
            this._dirty = false;
            // this._value = this._getter();
            this._value = this._effect.run();
        }
        return this._value;
    }
    set value(newValue) {
        this.set(newValue);
    }
}
function computed(getterOption) {
    let getter;
    let setter;
    if (typeof getterOption === 'function') {
        getter = getterOption;
        setter = () => console.error('getter是只读的，不允许赋值');
    }
    else {
        getter = getterOption.get;
        setter = getterOption.set;
    }
    return new ComputedRefImpl(getter, setter);
}

// 初始化props
function initProps(instance, props) {
    instance.props = props || {};
}

// 保存组件实例  便于getCurrentInstance 中返回出去
let currentInstance = null;
// 设置组件实例函数
function setCurrentInstance(instance) {
    currentInstance = instance;
}
// 获取当期组件实例
function getCurrentInstance() {
    return currentInstance;
}
// 创建组件实例 本质上就是个对象
function createComponentInstance(vnode, parentComponent) {
    const type = vnode.type;
    const instance = {
        type,
        vnode,
        props: {},
        emit: () => { },
        slots: {},
        provides: parentComponent ? parentComponent.provides : {},
        parent: parentComponent,
        isMouted: false,
        subTree: {},
        setupState: {},
        next: null
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
            emit: instance.emit
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
    console.log('---------------------------------');
    if (compiler && !component.rennder) {
        if (component.template) {
            component.render = compiler(component.template);
        }
    }
    instance.render = component.render;
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
let compiler;
function createCompiler(_compiler) {
    compiler = _compiler;
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        // app就是我们app.js中导出的组件描述  可以说这个app会是最大的组件的描述  后续我们写的任何组件都在他的下层
        // console.log(app);
        const app = {
            _component: rootComponent,
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
        // 返回的是一个对象 所以我们才可以链式调用mount方法
        return app;
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function shouldUpdateComponent(n1, n2) {
    const { props: preProps } = n1;
    const { props: nextProps } = n2;
    for (const key in nextProps) {
        if (preProps[key] != nextProps[key]) {
            return true;
        }
    }
    return false;
}

const queue = [];
let activePreFlushCbs = [];
let activePostFlushCbs = [];
let showExecte = false;
let isFlushing = false;
function nextTick(fn) {
    return fn ? Promise.resolve().then(fn) : Promise.resolve();
}
function queueJobs(job) {
    if (!queue.includes(job)) {
        // 如果queue这个队列里面没有job 那么才添加
        queue.push(job);
    }
    queueFlush();
}
function queueFlush() {
    if (showExecte)
        return;
    showExecte = true;
    nextTick(flushJobs);
}
function flushJobs() {
    showExecte = false;
    isFlushing = false;
    /** 增加个判断条件，因为目前为止，我们视图的异步渲染和watchEffect的异步执行 都是走到这个位置，而在这里watchEffect的第二个参数的flush是pre的时候，需要在视图更新之前执行
        所以我们可以先在这里执行我们收集起来的需要在视图更新之前执行的函数
    */
    // for (let i = 0; i < activePreFlushCbs.length; i++) {
    //   activePreFlushCbs[i]()
    // }
    let preflush;
    while ((preflush = activePreFlushCbs.shift())) {
        preflush && preflush();
    }
    // 下面是处理视图的更新的 vue有个核心概念: 视图的异步渲染
    let job;
    console.log('view is update');
    while ((job = queue.shift())) {
        job && job();
    }
    // 当watchEffect的options.flush为post的时候  需要在视图更新之后执行
    flushPostFlushCbs();
}
function flushPostFlushCbs() {
    let postflush;
    while ((postflush = activePostFlushCbs.shift())) {
        postflush && postflush();
    }
}
function queuePreFlushCb(fn) {
    queueFns(fn, activePreFlushCbs);
}
function queuePosstFlushCb(fn) {
    queueFns(fn, activePostFlushCbs);
}
function queueFns(fn, activePreFlushCbs) {
    if (isFlushing)
        return;
    isFlushing = true;
    activePreFlushCbs.push(fn);
    queueFlush();
}

function createRenderer(options) {
    // 从options获取自定义的渲染器
    console.log(options, 'options');
    const { createElement: hotCreateElement, patchProp: hotPatchProp, insert: hotInsert, remove: hotRemove, setText: hotSetText, setElementText: hotSetElementText } = options;
    function render(vnode, container) {
        // TODO
        patch(null, vnode, container, null);
        // console.log(vnode);
    }
    // patch方法 第一次用来处理挂载 第二次用来处理更新  由n1进行判断
    function patch(n1, n2, container, parentComponent, anchor = null) {
        // console.log(n1, n2);
        // Fragment\Text 进行单独处理 不要强制在外层套一层div  把外层标签嵌套什么交给用户决定 用户甚至可以决定什么都不嵌套
        const { shapeFlag, type } = n2;
        switch (type) {
            case Text:
                processText(n2, container);
                break;
            case Fragment:
                mountChildren(n2.children, container, parentComponent);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // TODO 字符串 普通dom元素的情况
                    // console.log("type == string", n2);
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (n2.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // TODO 组件的情况
                    // console.log("type == Object", n2);
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    // 处理文本节点
    function processText(vnode, container) {
        mountText(vnode, container);
    }
    // 加工type是string的情况
    function processElement(n1, n2, container, parentComponent, anchor) {
        //  判断是挂载还是更新
        if (!n1) {
            // 如果n1 就是旧节点 没有的情况下 就说明是挂载
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            // 反之 patch 更新
            patchElement(n1, n2, container, parentComponent);
        }
    }
    // 处理元素是字符串情况下的更新逻辑
    function patchElement(n1, n2, container, parentComponent) {
        // console.log("patchElement", n2);
        const oldProps = n1.props || EMPTY_OBJECT;
        const newProps = n2.props || EMPTY_OBJECT;
        // console.log(el);
        const el = (n2.el = n1.el);
        // console.log("n1", n1);
        // console.log("n2", n2);
        // console.log(el, "el");
        patchChildren(n1, n2, el, parentComponent);
        patchProps(el, oldProps, newProps);
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
            // 2. 设置children  children是一个string 直接设置即可 挂载节点  注意新节点是文本节点 所以需要使用的的是setText函数
            // 这里兼容了array ==> string 和 string ==> string的情况  如果旧节点是array 会走上面的if条件 对旧节点进行卸载
            // console.log("prechildren", prevChildren);
            // console.log("newChildren", newChildren);
            console.log('prevChildren', prevChildren);
            console.log('newChildren', newChildren);
            if (prevChildren !== newChildren) {
                hotSetElementText(container, newChildren);
            }
        }
        else if (newShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 新节点是数组的情况
            if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                // 旧节点是文本节点  走到这里说明 string === array
                // console.log("string === array");
                hotSetElementText(container, '');
                // 处理array
                mountChildren(newChildren, container, parentComponent);
            }
            else {
                // array to array diff算法
                console.log('array to array diff');
                patchKeyedChildren(prevChildren, newChildren, container, parentComponent);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent) {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        // console.log(e1);
        // console.log(e2);
        // console.log("-----");
        function isSomeVNodeType(n1, n2) {
            return n1.type == n2.type && n1.key == n2.key;
        }
        // 左端算法  从左边开始找 一直找到两个节点不同为止  相同的就继续递归调用patch 检查children是否相同
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                // 如果为true  就说明 key和 val一致  则直接patch更新
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            i++;
        }
        // 右端算法
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 新的比旧的长  n1:旧节点  n2:新节点
        console.log(i);
        console.log(e1);
        console.log(e2);
        /**
         * 旧节点: A  B
         * 新节点: A  B  C
         * 因为这里是考虑新的比旧的长  所以需要将多余的节点进行挂载操作 而多余的节点就是从当下标i在旧节点中是null的时候 就代表旧节点遍历完了 从新节点的这个位置开始后面的全都是多的节点 进行挂载
         */
        if (i > e1) {
            if (i <= e2) {
                console.log('新旧节点');
                const nextPros = e2 + 1;
                const anchor = e2 + 1 < c2.length ? c2[nextPros].el : null;
                // console.log("i+1", i + 1);
                // console.log("c2.length", c2);
                // console.log("c2.length", { ...c2[nextPros] });
                // console.log("c2.length", c2[nextPros]);
                console.log('-----', anchor);
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            console.log('旧节点比新节点长');
            while (i <= e1) {
                hotRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间部分
            console.log('diff算法中间部分');
            let s1 = i;
            let s2 = i;
            let toBePatched = e2 - s2 + 1;
            let patched = 0;
            // 组织印射表
            /**
             * 首先遍历新节点 由于我们在前面已经进行了左端算法和右端算法  到这个位置的话就剩下中间的乱序部分
             * 我们可以先遍历新节点 将他们组织成印射表 后续可以通过印射表来快速找到某个节点有没有在新的节点中出现过
             * 印射表:{
             *    key:index
             *  }
             * 这里的key 就是用户提供的key  也是我们写v-for循环常常提供的key
             */
            let keyToIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
            // 遍历新节点
            for (let i = s1; i <= e2; i++) {
                const prevChildren = c2[i];
                keyToIndexMap.set(prevChildren.key, i);
            }
            // 遍历旧节点
            for (let i = s2; i <= e1; i++) {
                let newIndex;
                const prevChildren = c1[i];
                // 优化点: 当新节点的中间部分比旧节点的中间部分长的时候 后续就直接执行remove操作即可 就不需要下面繁琐的比较了
                /**
                 * 旧: a,b,(c,e,d),f,g
                 * 新: a,b,(e,c),f,g
                 *
                 * 当指针走到旧节点的e的时候  新节点中间的两个节点已经全都在旧节点中出现过并且patch过了 那么后面的d百分之百是做删除操作的 也就是不会存在于新节点
                 */
                if (patched >= toBePatched) {
                    hotRemove(prevChildren.el);
                }
                // 这里包含两种情况  null == null || null == undefined
                if (prevChildren.key != null) {
                    // 如果旧节点有key的话 就去新节点的印射表中找
                    newIndex = keyToIndexMap.get(prevChildren.key);
                }
                else {
                    // 说明用户的旧节点没有key  这个时候就只能for循环挨个遍历了
                    for (let j = s2; j <= e2; j++) {
                        if (isSomeVNodeType(e2[j], prevChildren)) {
                            // 如果新节点和旧节点的type 和key 相同  就说明找到了 然后这一层循环就没必要了
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    // 就说明没有找到   需要卸载操作
                    hotRemove(prevChildren.el);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    // 找到的话  走patch操作 递归比较children
                    patch(prevChildren, c2[newIndex], container, parentComponent);
                    patched++;
                }
            }
            const incrementNewIndexSequence = getSequence(newIndexToOldIndexMap);
            let j = incrementNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                let nextIndex = i + s2;
                let nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] == 0) {
                    // 如果newIndexToOldIndexMap没有建立对应的隐射关系 说明是新节点 需要patch 创建
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else {
                    if (i != incrementNewIndexSequence[j]) {
                        console.log('移动位置');
                        hotInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    // 处理props的更新逻辑
    function patchProps(el, oldProps, newProps) {
        for (let key in newProps) {
            const newProp = newProps[key];
            const oldProp = oldProps[key];
            if (newProp !== oldProp) {
                hotPatchProp(el, key, oldProp, newProp);
            }
        }
        for (let key in oldProps) {
            // 新的props没有该属性
            if (!(key in newProps)) {
                hotPatchProp(el, key, oldProps[key], null);
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hotCreateElement(vnode.type));
        const { children, props } = vnode;
        // children 可能是数组 也可能是字符串需要分开处理
        if (isString(children)) {
            // el.textContent = children;
            hotSetElementText(el, children);
        }
        else if (Array.isArray(children)) {
            mountChildren(children, el, parentComponent);
        }
        // 处理props
        for (const key of Object.getOwnPropertyNames(props)) {
            hotPatchProp(el, key, null, props[key]);
        }
        // 将创建的dom元素添加在父元素
        hotInsert(el, container, anchor);
        // console.log("container", container.childNodes);
    }
    // 处理children是数组的情况
    function mountChildren(children, container, parentComponent) {
        // 走到这里说明vnode.children是数组 遍历添加到container
        // console.log(children, "children");
        children.forEach((node) => {
            // console.log("处理children是数组的情况", node);
            patch(null, node, container, parentComponent);
        });
    }
    function mountComponent(vnode, container, parentComponent) {
        // 创建组件实例
        const instance = (vnode.component = createComponentInstance(vnode, parentComponent));
        // console.log(instance);
        // 安装组件
        setupComponent(instance);
        // 对子树进行操作
        setupRenderEffect(instance, vnode, container);
    }
    function processComponent(n1, n2, container, parentComponent) {
        if (n1) {
            // 如果n1有值说明是更新  如果n1 没有值说明是挂载操作
            updateComponent(n1, n2);
        }
        else {
            mountComponent(n2, container, parentComponent);
        }
    }
    function updateComponent(n1, n2) {
        console.log('更新操作');
        const instance = (n2.component = n1.component);
        /**
         * 判断页面内的组件是否需要更新
         * 考虑一下 我们这里的更新逻辑是处理子组件的 当前组件的数据发生变化的时候 我们需要调用这个update方法吗？ 明显不需要
         */
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.el = n2;
        }
    }
    function setupRenderEffect(instance, initialvnode, container) {
        // 通过effect进行包裹 会自动收集依赖 帮助我们在用户使用的变量发生变化时更新视图
        instance.update = effect(() => {
            // 如果isMouted是true 则证明是组件已经挂载过了 后续执行的是update操作 如果不区分更新和挂载 则造成依赖的数据一旦发生变化就创建一个新的节点
            // console.log(instance.isMouted, "instance");
            if (!instance.isMouted) {
                // console.log("sub", instance.render);
                // console.log("sub", instance.render());
                // 这里我们通过call 对render函数进行一个this绑定  因为我们会在h函数中使用this.xxx来声明的变量
                const subTree = instance.render.call(instance.proxy, instance.proxy);
                instance.subTree = subTree;
                // 对子树进行patch操作
                patch(null, subTree, container, instance);
                // console.log(subTree);
                instance.isMouted = true; //将isMouted设置为true  代表已挂载 后续执行更新操作
                initialvnode.el = subTree.el;
            }
            else {
                // TODO  update 逻辑
                console.log('更新视图');
                // 这里处理更新的逻辑
                // 处理组件
                const { next, vnode } = instance;
                console.log(vnode, '---');
                console.log(next, 'next---');
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                // 新的vnode
                const subTree = instance.render.call(instance.proxy, instance.proxy);
                // 老的vnode
                const prevSubTree = instance.subTree;
                // 存储这一次的vnode，下一次更新逻辑作为老的vnode
                instance.subTree = subTree;
                // console.log("跟着视图走patch");
                patch(prevSubTree, subTree, container, instance);
                // console.log("prevSubTree", prevSubTree);
                // console.log("subTree", subTree);
            }
        }, {
            scheduler() {
                console.log('没有执行update逻辑  转而执行scheduler参数');
                queueJobs(instance.update);
            }
        });
    }
    // 卸载children
    function unmountChildren(children) {
        // console.log("children", children.length);
        for (let i = 0; i < children.length; i++) {
            hotRemove(children[i].el);
        }
    }
    return {
        render,
        createApp: createAppAPI(render)
    };
}
// 更新组件
function updateComponentPreRender(instance, nextVnode) {
    console.log(instance, 'instance');
    console.log(nextVnode, 'nextVnode');
    instance.vnode = nextVnode;
    instance.next = null;
    instance.props = nextVnode.props;
}
// 移除节点函数
function remove$1(child) {
    const parent = child.parentNode;
    // console.log("parent", parent);
    if (parent) {
        parent.removeChild(child);
    }
}
function mountText(vnode, container) {
    // console.log("vnode", vnode);
    // 因为经过createVNode 函数处理 所以返回的是一个对象  文本在vnode.children下面
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
// 求最长递增子序列算法
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function watchEffect(source, options = {}) {
    return doWatch(source, null, options);
}
function doWatch(source, fn, options) {
    let oldVal, newVal;
    const job = () => {
        if (fn) {
            newVal = effect.run();
            fn(newVal, oldVal, onCleanup);
            // 将新的value赋值给oldVal作为旧值
            oldVal = newVal;
        }
        else {
            effect.run();
        }
    };
    let scheduler;
    if (options.flush === 'post') {
        scheduler = scheduler = () => {
            queuePosstFlushCb(job);
        };
    }
    else if (options.flush === 'sync') {
        scheduler = job;
    }
    else {
        // pre需要放在最后，因为用户不传和主动传递pre都是走这里
        scheduler = () => {
            queuePreFlushCb(job);
        };
    }
    let cleanup;
    // 这个clearup函数就是用户调用的onCleanup,用户在调用这个函数的时候会传递一个函数，用于做用户属于自己的操作，他会在每次watchEffect执行的时候先执行一次(不包括第一次,第一次是默认执行的)
    const onCleanup = (cb) => {
        cleanup = () => {
            console.log('Calls the function passed in by the user');
            cb();
        };
    };
    let getter;
    getter = () => {
        if (cleanup) {
            cleanup();
        }
        // fn有值说明是watch调用的dowatch
        if (fn) {
            if (isRef(source)) {
                return source.value;
            }
            else if (isReactive(source)) {
                const res = traverse(source);
                return res;
            }
            else if (isFunction(source)) {
                return source();
            }
        }
        else {
            // 否则的话就是watchEffect调用的dowatch
            source(onCleanup);
        }
    };
    const effect = new EffectDepend(getter, scheduler);
    //当用户没有传入fn的时候，代表用户使用的是watchEffect 执行一次用户传入的source  watchEffect是会默认执行一次的
    // 当用户传入的时候，说明使用的是watch 它在immediate为false的时候是不需要执行一次的
    if (fn) {
        // 这里需要清楚，watch既然不执行，那他下次执行的时候就是依赖发生变化的时候，如果依赖发生变化，用户就需要拿到一个旧值，这个旧值(oldVal)不就是getter函数的返回值(这里需要考虑的情况有点多，我这里进行笼统的概括)
        // watch的第一个依赖集合(source)可以使多种类型的，比如说ref、reactive、function、甚至是一个Array，区分类型是在getter里面区分好了，我们在这里只需要确定: 我这里执行getter 就能拿到对应类型的返回值
        oldVal = effect.run();
    }
    else {
        effect.run();
    }
    return () => {
        effect.stop();
    };
}
function watch(source, fn, WatchSource = {}) {
    return doWatch(source, fn, WatchSource);
}
function traverse(value, seen) {
    if (!isObject(value)) {
        return value;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (isRef(value)) {
        traverse(value, seen);
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    else if (Object.prototype.toString.call(value)) {
        for (const key in value) {
            traverse(value[key], seen);
        }
        // TODO  map  set object
    }
    return value;
}

// 定义关于浏览器的渲染器
function createElement(type) {
    console.log('create el 操作', type);
    const element = document.createElement(type);
    return element;
}
function createText(text) {
    return document.createTextNode(text);
}
function setText(node, text) {
    console.log('调用到这里了', node, text);
    node.nodeValue = text;
}
function setElementText(el, text) {
    console.log('SetElementText', el, text);
    el.textContent = text;
}
function patchProp(el, key, preValue, nextValue) {
    // preValue 之前的值
    // 为了之后 update 做准备的值
    // nextValue 当前的值
    console.log(`PatchProp 设置属性:${key} 值:${nextValue}`);
    console.log(`key: ${key} 之前的值是:${preValue}`);
    if (isOn(key)) {
        // 添加事件处理函数的时候需要注意一下
        // 1. 添加的和删除的必须是一个函数，不然的话 删除不掉
        //    那么就需要把之前 add 的函数给存起来，后面删除的时候需要用到
        // 2. nextValue 有可能是匿名函数，当对比发现不一样的时候也可以通过缓存的机制来避免注册多次
        // 存储所有的事件函数
        const invokers = el._vei || (el._vei = {});
        const existingInvoker = invokers[key];
        if (nextValue && existingInvoker) {
            // patch
            // 直接修改函数的值即可
            existingInvoker.value = nextValue;
        }
        else {
            const eventName = key.slice(2).toLowerCase();
            if (nextValue) {
                const invoker = (invokers[key] = nextValue);
                el.addEventListener(eventName, invoker);
            }
            else {
                el.removeEventListener(eventName, existingInvoker);
                invokers[key] = undefined;
            }
        }
    }
    else {
        if (nextValue === null || nextValue === undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(child, parent, anchor = null) {
    console.log('Insert操作');
    parent.insertBefore(child, anchor);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
let renderer;
function ensureRenderer() {
    // 如果 renderer 有值的话，那么以后都不会初始化了
    return (renderer ||
        (renderer = createRenderer({
            createElement,
            createText,
            setText,
            setElementText,
            patchProp,
            insert,
            remove
        })));
}
const createApp = (...args) => {
    return ensureRenderer().createApp(...args);
};

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    watchEffect: watchEffect,
    watch: watch,
    toDisplayString: toDisplayString,
    initSlots: initSlots,
    renderSlot: renderSlot,
    publicInstanceProxyHandlers: publicInstanceProxyHandlers,
    get currentInstance () { return currentInstance; },
    setCurrentInstance: setCurrentInstance,
    getCurrentInstance: getCurrentInstance,
    createComponentInstance: createComponentInstance,
    setupComponent: setupComponent,
    provide: provide,
    inject: inject,
    createCompiler: createCompiler,
    emit: emit,
    initProps: initProps,
    createAppAPI: createAppAPI,
    h: h,
    createRenderer: createRenderer,
    remove: remove$1,
    Fragment: Fragment,
    Text: Text,
    createElementBlock: createVNode,
    createVNode: createVNode,
    getShapeFlag: getShapeFlag,
    normalizeChildren: normalizeChildren,
    createTextVNode: createTextVNode,
    nextTick: nextTick,
    queueJobs: queueJobs,
    queuePreFlushCb: queuePreFlushCb,
    queuePosstFlushCb: queuePosstFlushCb,
    EffectDepend: EffectDepend,
    cleanupEffect: cleanupEffect,
    effect: effect,
    tarckEffect: tarckEffect,
    triggerEffect: triggerEffect,
    isTracking: isTracking,
    track: track,
    trigger: trigger,
    stop: stop,
    createGetter: createGetter,
    createSetter: createSetter,
    mutableHandlers: mutableHandlers,
    readonlyHandlers: readonlyHandlers,
    reactive: reactive,
    readonly: readonly,
    get ReactiveFlags () { return ReactiveFlags; },
    isReadonly: isReadonly,
    isReactive: isReactive,
    isShallow: isShallow,
    isProxy: isProxy,
    toRaw: toRaw,
    shallowReadonlyHandlers: shallowReadonlyHandlers,
    shallowReadonly: shallowReadonly,
    shallowReactiveHandlers: shallowReactiveHandlers,
    shallowReactive: shallowReactive,
    convert: convert,
    trackRefValue: trackRefValue,
    ref: ref,
    isRef: isRef,
    unref: unref,
    proxyRefs: proxyRefs,
    computed: computed
});

const TO_DISPLAY_STRING = Symbol('toDisplayString');
const OPEN_BLOCK = Symbol('openBlock');
const CREATE_ELEMENT_BLOCK = Symbol('createElementBlock');
const helperNameMap = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [OPEN_BLOCK]: 'openBlock',
    [CREATE_ELEMENT_BLOCK]: 'createElementBlock'
};

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    // 处理插值语法
    if (ast.helpers.length != 0)
        genFunctionPreamble(ast, context);
    push('return ');
    const functionName = 'render';
    const args = ['_ctx', '_cache'];
    const signature = args.join(',');
    push(`function ${functionName}(${signature}){`);
    push(' return ');
    getNode(ast.codegenNode, context);
    push('}');
    return {
        code: context.code
    };
}
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const VueBinging = 'Vue';
    const helpers = ast.helpers;
    const ailasHelper = (helperName) => `${helperNameMap[helperName]}: _${helperNameMap[helperName]}`;
    push(`const { ${helpers.map(ailasHelper).join(', ')} } = ${VueBinging}`);
    push('\n');
}
function getNode(ast, context) {
    switch (ast.type) {
        case 3 /* NodeTypes.TEXT */:
            // 处理文本类型
            genText(ast, context);
            break;
        case 0 /* NodeTypes.INTERPOLATION */:
            // 处理插值类型
            genInterpolation(ast, context);
            break;
        case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
            // 处理表达式 指的是插值类型里面那个变量
            genExpression(ast, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            genElement(ast, context);
            break;
        case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompundExpression(ast, context);
            break;
    }
}
function genExpression(ast, context) {
    const { push } = context;
    push(`${ast.content}`);
}
function genText(ast, context) {
    const { push } = context;
    push(`'${ast.content}'`);
}
function genInterpolation(ast, context) {
    const { push } = context;
    push(`_${helperNameMap[TO_DISPLAY_STRING]}(`);
    getNode(ast.content, context);
    push(')');
}
function genElement(ast, context) {
    const { push } = context;
    push(`_${helperNameMap[CREATE_ELEMENT_BLOCK]}(`);
    genNodeList(genNullable([ast.tag, ast.prop, ast.children]), context);
    // getNode(ast.children, context);
    push(')');
}
function genNullable(nodesList) {
    return nodesList.map((node) => node || 'null');
}
function genNodeList(nodesList, context) {
    const { push } = context;
    for (let i = 0; i < nodesList.length; i++) {
        let node = nodesList[i];
        if (isString(node)) {
            push(node);
        }
        else {
            getNode(node, context);
        }
        if (i < nodesList.length - 1) {
            push(',');
        }
    }
}
function genCompundExpression(ast, context) {
    const { children } = ast;
    const { push } = context;
    children.forEach((child) => {
        if (isString(child)) {
            push(child);
        }
        else {
            getNode(child, context);
        }
    });
}
function createCodegenContext() {
    const context = {
        code: '',
        push: (source) => (context.code += source)
    };
    return context;
}

/**
 * 处理插值的整体流程 {{message}}
 * 思路:  拿到{{message}}后 对其进行处理  首先我们需要明确一点 我们拿到的是字符串  就是无脑切割、推进的一个过程
 *        首先先确定结束的位置 根据插值语法的使用  我们很明确的清楚 }}就是我们的结束标记  所以先通过indexOf拿到该从那个位置进行截断
 *        然后同样的 {{ 这个也就是我们的开始标记
 * 1. 我们先将{{message}} 切割掉"{{"这两个开始的标记获取到message}}
 * 2. 然后上面讲了 "}}"这个就是我们的结束标记  我们定义一个变量标志结束的位置
 * 3. 根据结束的位置 切割掉"}}" 然后我们就能拿到中间核心的变量了 当然这里要注意 我们获取的结束标记是完整的字符串{{message}} 经过第一步 实际上字符串已经变成了message}}这个玩意 所以我们的结束标记也要-2
 * 4. 最后进行推进 因为后面可能还有别的标签我们需要处理 比如说</div>这种dom标签 我们要进行别的处理 推进的方式也很简单 说白了就是将整个{{message}}删掉  然后继续后面的字符串解析
 *
 */
// 定义开始标识符和结束标识符
const OPENDELIMITER = '{{';
const CLOSEDELIMITER = '}}';
// 定义标签的开始于结束
var TagTypes;
(function (TagTypes) {
    TagTypes[TagTypes["TAGSSTART"] = 0] = "TAGSSTART";
    TagTypes[TagTypes["TAGSEND"] = 1] = "TAGSEND";
})(TagTypes || (TagTypes = {}));
function baseParse(content) {
    const context = createParseContext(content);
    return createRoot(parseChildren(context, []));
}
function isEnd(context, ancestors) {
    // 是否结束
    // 1. 当遇到结束标签 比如:</div>
    // 2. 当context.source.length === 0
    const s = context.source;
    console.log(ancestors);
    if (s.startsWith('</')) {
        for (let i = 0; i < ancestors.length; i++) {
            const tag = ancestors[i].tag;
            if (s.slice(2, 2 + tag.length) == tag) {
                return true;
            }
        }
    }
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //   return true;
    // }
    return !s;
}
function parseChildren(context, ancestors) {
    // console.log(context.source, "-------------");
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        if (context.source.startsWith(OPENDELIMITER)) {
            node = parseInterpolation(context);
        }
        else if (context.source[0] === '<') {
            // console.log("parse");
            if (/[a-z]/i.test(context.source[1])) {
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            // 如果node没有值的情况下 我们默认当做text类型来处理 就是普通文本
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function parseInterpolation(context) {
    // "{{message}}"
    // "message}}"
    const closeIndex = context.source.indexOf(CLOSEDELIMITER, OPENDELIMITER.length);
    // console.log(closeIndex, "clostIndex");
    advanceBy(context, OPENDELIMITER.length);
    // console.log(context.source.slice(0, closeIndex - 2));
    const rawContent = context.source.slice(0, closeIndex - 2);
    const content = rawContent.trim();
    advanceBy(context, closeIndex);
    // console.log(context.source, "处理完成之后  content");
    return {
        type: 0 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 1 /* NodeTypes.SIMPLE_EXPRESSION */,
            content: content
        }
    };
}
function createParseContext(content) {
    // throw new Error("Function not implemented.");
    return {
        source: content
    };
}
function createRoot(children) {
    return {
        children,
        type: 4 /* NodeTypes.ROOT */
    };
}
// 插值语法的推进函数
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function parseElement(context, ancestors) {
    const element = parasTag(context, TagTypes.TAGSSTART); //处理开始标签
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    console.log(context.source, context.source.slice(2, 2 + element.tag.length), element.tag, '--------------------');
    if (context.source.slice(2, 2 + element.tag.length) == element.tag) {
        // 先判断结束标签是否和开始标签一致
        parasTag(context, TagTypes.TAGSEND); //处理结束标签
    }
    else {
        throw new Error('没有结束标签');
    }
    // console.log(context.source);
    return element;
}
function parasTag(context, type) {
    console.log(context.source);
    const match = /^<\/?([a-z]*)/i.exec(context.source);
    console.log(match, '------------');
    advanceBy(context, match[0].length); //推进开始标签
    advanceBy(context, 1); //推进多余的>
    const tag = match[1];
    if (type == TagTypes.TAGSEND)
        return; //如果是结束标签 就没必要返回内容了
    return {
        type: 2 /* NodeTypes.ELEMENT */,
        tag
    };
}
function parseText(context) {
    let endIndex = context.source.length;
    let endToken = ['<', '{{'];
    for (let i = 0; i < endToken.length; i++) {
        const index = context.source.indexOf(endToken[i]);
        console.log(index, 'index');
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    const content = context.source.slice(0, endIndex);
    // console.log(content);
    advanceBy(context, content.length);
    return {
        type: 3 /* NodeTypes.TEXT */,
        content
    };
}

// 思路 遍历整个ast语法树 采取深度遍历优先 一条路走到黑
const transform = (ast, options = {}) => {
    const context = createTransformContext(ast, options);
    dfs(ast, context);
    createRootCodegen(ast);
    ast.helpers = [...context.helpers.keys()];
};
// 遍历整个ast语法树
const dfs = (node, context) => {
    // 修改text文本的值 外面传入的修改方法 如何修改给外部决定如何执行
    const nodeTransform = context.nodeTransform;
    const exitFns = [];
    nodeTransform.forEach((fn) => {
        const exitFn = fn(node, context);
        if (exitFn)
            exitFns.push(exitFn);
    });
    // 插值语法  在context.helps(数组)上添加一项toDisplayString，用于后续生成js的时候引入，后续插值语法生成的js需要借助这些工具函数
    switch (node.type) {
        case 0 /* NodeTypes.INTERPOLATION */:
            context.push(TO_DISPLAY_STRING);
            break;
        case 4 /* NodeTypes.ROOT */:
            dfsChildren(node, context);
            break;
        case 2 /* NodeTypes.ELEMENT */:
            dfsChildren(node, context);
            break;
    }
    let len = exitFns.length;
    console.log(len);
    while (len--) {
        exitFns[len]();
    }
};
function createRootCodegen(ast) {
    const child = ast.children[0];
    if (child.type === 2 /* NodeTypes.ELEMENT */) {
        ast.codegenNode = child.codegenNode;
    }
    else {
        ast.codegenNode = ast.children[0];
    }
}
// 遍历ast语法树children
function dfsChildren(node, context) {
    if (node.children) {
        node.children.forEach((childrenItem) => {
            dfs(childrenItem, context);
        });
    }
}
// 创建transform全局上下文
function createTransformContext(root, options) {
    return {
        nodeTransform: options.nodeTransform || [],
        root,
        helpers: new Map(),
        push(helperName) {
            this.helpers.set(helperName, 1);
        }
    };
}

function transformElement(ast, context) {
    if (ast.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            context.push(CREATE_ELEMENT_BLOCK);
            // 中间层
            // tag
            const vnodeTag = `'${ast.tag}'`;
            // prop
            let vnodeProp;
            // children
            const children = ast.children;
            const vnodeChildren = children[0];
            ast.codegenNode = {
                type: 2 /* NodeTypes.ELEMENT */,
                tag: vnodeTag,
                prop: vnodeProp,
                children: vnodeChildren
            };
        };
    }
}

function transformsExpression(ast) {
    if (0 /* NodeTypes.INTERPOLATION */ === ast.type) {
        ast.content.content = '_ctx.' + ast.content.content;
    }
}

function isTextorInterpolation(node) {
    return node.type === 3 /* NodeTypes.TEXT */ || node.type === 0 /* NodeTypes.INTERPOLATION */;
}
function transformText(ast) {
    // 前提是element类型
    if (ast.type === 2 /* NodeTypes.ELEMENT */) {
        return () => {
            const { children } = ast;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                // 如果是text或者插值类型 就将他们组合成一个新的类型
                if (isTextorInterpolation(children[i])) {
                    for (let j = i + 1; j < children.length; j++) {
                        if (isTextorInterpolation(children[j])) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [children[i]]
                                };
                            }
                            currentContainer.children.push(' + ');
                            currentContainer.children.push(children[j]);
                            ast.children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

const baseCompile = (template) => {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransform: [transformsExpression, transformElement, transformText]
    });
    return generate(ast);
};

function compilerToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function('Vue', code)(runtimeDom);
    return render;
}
createCompiler(compilerToFunction);

export { EffectDepend, Fragment, ReactiveFlags, Text, cleanupEffect, computed, convert, createApp, createAppAPI, createCompiler, createComponentInstance, createVNode as createElementBlock, createGetter, createRenderer, createSetter, createTextVNode, createVNode, currentInstance, effect, emit, getCurrentInstance, getShapeFlag, h, initProps, initSlots, inject, isProxy, isReactive, isReadonly, isRef, isShallow, isTracking, mutableHandlers, nextTick, normalizeChildren, provide, proxyRefs, publicInstanceProxyHandlers, queueJobs, queuePosstFlushCb, queuePreFlushCb, reactive, readonly, readonlyHandlers, ref, remove$1 as remove, renderSlot, setCurrentInstance, setupComponent, shallowReactive, shallowReactiveHandlers, shallowReadonly, shallowReadonlyHandlers, stop, tarckEffect, toDisplayString, toRaw, track, trackRefValue, trigger, triggerEffect, unref, watch, watchEffect };
//# sourceMappingURL=vue3.esm.js.map
