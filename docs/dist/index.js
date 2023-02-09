/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}

function normalizeStyle(value) {
    if (isArray(value)) {
        const res = {};
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const normalized = isString(item)
                ? parseStringStyle(item)
                : normalizeStyle(item);
            if (normalized) {
                for (const key in normalized) {
                    res[key] = normalized[key];
                }
            }
        }
        return res;
    }
    else if (isString(value)) {
        return value;
    }
    else if (isObject(value)) {
        return value;
    }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*.*?\*\//gs;
function parseStringStyle(cssText) {
    const ret = {};
    cssText
        .replace(styleCommentRE, '')
        .split(listDelimiterRE)
        .forEach(item => {
        if (item) {
            const tmp = item.split(propertyDelimiterRE);
            tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
        }
    });
    return ret;
}
function normalizeClass(value) {
    let res = '';
    if (isString(value)) {
        res = value;
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i]);
            if (normalized) {
                res += normalized + ' ';
            }
        }
    }
    else if (isObject(value)) {
        for (const name in value) {
            if (value[name]) {
                res += name + ' ';
            }
        }
    }
    return res.trim();
}

/**
 * On the client we only need to offer special cases for boolean attributes that
 * have different names from their corresponding dom properties:
 * - itemscope -> N/A
 * - allowfullscreen -> allowFullscreen
 * - formnovalidate -> formNoValidate
 * - ismap -> isMap
 * - nomodule -> noModule
 * - novalidate -> noValidate
 * - readonly -> readOnly
 */
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /*#__PURE__*/ makeMap(specialBooleanAttrs);
/**
 * Boolean attributes should be included if the value is truthy or ''.
 * e.g. `<select multiple>` compiles to `{ multiple: '' }`
 */
function includeBooleanAttr(value) {
    return !!value || value === '';
}

/**
 * For converting {{ interpolation }} values to displayed strings.
 * @private
 */
const toDisplayString = (val) => {
    return isString(val)
        ? val
        : val == null
            ? ''
            : isArray(val) ||
                (isObject(val) &&
                    (val.toString === objectToString || !isFunction(val.toString)))
                ? JSON.stringify(val, replacer, 2)
                : String(val);
};
const replacer = (_key, val) => {
    // can't use isRef here since @vue/shared has no deps
    if (val && val.__v_isRef) {
        return replacer(_key, val.value);
    }
    else if (isMap(val)) {
        return {
            [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val]) => {
                entries[`${key} =>`] = val;
                return entries;
            }, {})
        };
    }
    else if (isSet(val)) {
        return {
            [`Set(${val.size})`]: [...val.values()]
        };
    }
    else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
        return String(val);
    }
    return val;
};

const EMPTY_OBJ = Object.freeze({})
    ;
const EMPTY_ARR = Object.freeze([]) ;
const NOOP = () => { };
/**
 * Always return false.
 */
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith('onUpdate:');
const extend = Object.assign;
const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
        arr.splice(i, 1);
    }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === '[object Map]';
const isSet = (val) => toTypeString(val) === '[object Set]';
const isFunction = (val) => typeof val === 'function';
const isString = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';
const isObject = (val) => val !== null && typeof val === 'object';
const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === '[object Object]';
const isIntegerKey = (key) => isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
const isReservedProp = /*#__PURE__*/ makeMap(
// the leading comma is intentional so empty string "" is also included
',key,ref,ref_for,ref_key,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted');
const isBuiltInDirective = /*#__PURE__*/ makeMap('bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo');
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
const camelizeRE = /-(\w)/g;
/**
 * @private
 */
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
/**
 * @private
 */
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
/**
 * @private
 */
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
    for (let i = 0; i < fns.length; i++) {
        fns[i](arg);
    }
};
const def = (obj, key, value) => {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: false,
        value
    });
};
/**
 * "123-foo" will be parsed to 123
 * This is used for the .number modifier in v-model
 */
const looseToNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};
/**
 * Only conerces number-like strings
 * "123-foo" will be returned as-is
 */
const toNumber = (val) => {
    const n = isString(val) ? Number(val) : NaN;
    return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
    return (_globalThis ||
        (_globalThis =
            typeof globalThis !== 'undefined'
                ? globalThis
                : typeof self !== 'undefined'
                    ? self
                    : typeof window !== 'undefined'
                        ? window
                        : typeof global !== 'undefined'
                            ? global
                            : {}));
};

function warn$1(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
}

let activeEffectScope;
class EffectScope {
    constructor(detached = false) {
        this.detached = detached;
        /**
         * @internal
         */
        this._active = true;
        /**
         * @internal
         */
        this.effects = [];
        /**
         * @internal
         */
        this.cleanups = [];
        this.parent = activeEffectScope;
        if (!detached && activeEffectScope) {
            this.index =
                (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
        }
    }
    get active() {
        return this._active;
    }
    run(fn) {
        if (this._active) {
            const currentEffectScope = activeEffectScope;
            try {
                activeEffectScope = this;
                return fn();
            }
            finally {
                activeEffectScope = currentEffectScope;
            }
        }
        else {
            warn$1(`cannot run an inactive effect scope.`);
        }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    on() {
        activeEffectScope = this;
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    off() {
        activeEffectScope = this.parent;
    }
    stop(fromParent) {
        if (this._active) {
            let i, l;
            for (i = 0, l = this.effects.length; i < l; i++) {
                this.effects[i].stop();
            }
            for (i = 0, l = this.cleanups.length; i < l; i++) {
                this.cleanups[i]();
            }
            if (this.scopes) {
                for (i = 0, l = this.scopes.length; i < l; i++) {
                    this.scopes[i].stop(true);
                }
            }
            // nested scope, dereference from parent to avoid memory leaks
            if (!this.detached && this.parent && !fromParent) {
                // optimized O(1) removal
                const last = this.parent.scopes.pop();
                if (last && last !== this) {
                    this.parent.scopes[this.index] = last;
                    last.index = this.index;
                }
            }
            this.parent = undefined;
            this._active = false;
        }
    }
}
function recordEffectScope(effect, scope = activeEffectScope) {
    if (scope && scope.active) {
        scope.effects.push(effect);
    }
}
function getCurrentScope() {
    return activeEffectScope;
}

const createDep = (effects) => {
    const dep = new Set(effects);
    dep.w = 0;
    dep.n = 0;
    return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].w |= trackOpBit; // set was tracked
        }
    }
};
const finalizeDepMarkers = (effect) => {
    const { deps } = effect;
    if (deps.length) {
        let ptr = 0;
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i];
            if (wasTracked(dep) && !newTracked(dep)) {
                dep.delete(effect);
            }
            else {
                deps[ptr++] = dep;
            }
            // clear bits
            dep.w &= ~trackOpBit;
            dep.n &= ~trackOpBit;
        }
        deps.length = ptr;
    }
};

const targetMap = new WeakMap();
// The number of effects currently being tracked recursively.
let effectTrackDepth = 0;
let trackOpBit = 1;
/**
 * The bitwise track markers support at most 30 levels of recursion.
 * This value is chosen to enable modern JS engines to use a SMI on all platforms.
 * When recursion depth is greater, fall back to using a full cleanup.
 */
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol('iterate' );
const MAP_KEY_ITERATE_KEY = Symbol('Map key iterate' );
class ReactiveEffect {
    constructor(fn, scheduler = null, scope) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        this.parent = undefined;
        recordEffectScope(this, scope);
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        let parent = activeEffect;
        let lastShouldTrack = shouldTrack;
        while (parent) {
            if (parent === this) {
                return;
            }
            parent = parent.parent;
        }
        try {
            this.parent = activeEffect;
            activeEffect = this;
            shouldTrack = true;
            trackOpBit = 1 << ++effectTrackDepth;
            if (effectTrackDepth <= maxMarkerBits) {
                initDepMarkers(this);
            }
            else {
                cleanupEffect(this);
            }
            return this.fn();
        }
        finally {
            if (effectTrackDepth <= maxMarkerBits) {
                finalizeDepMarkers(this);
            }
            trackOpBit = 1 << --effectTrackDepth;
            activeEffect = this.parent;
            shouldTrack = lastShouldTrack;
            this.parent = undefined;
            if (this.deferStop) {
                this.stop();
            }
        }
    }
    stop() {
        // stopped while running itself - defer the cleanup
        if (activeEffect === this) {
            this.deferStop = true;
        }
        else if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
}
function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
}
function track(target, type, key) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        const eventInfo = { effect: activeEffect, target, type, key }
            ;
        trackEffects(dep, eventInfo);
    }
}
function trackEffects(dep, debuggerEventExtraInfo) {
    let shouldTrack = false;
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit; // set newly tracked
            shouldTrack = !wasTracked(dep);
        }
    }
    else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeEffect);
    }
    if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
        if (activeEffect.onTrack) {
            activeEffect.onTrack(Object.assign({ effect: activeEffect }, debuggerEventExtraInfo));
        }
    }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    let deps = [];
    if (type === "clear" /* TriggerOpTypes.CLEAR */) {
        // collection being cleared
        // trigger all effects for target
        deps = [...depsMap.values()];
    }
    else if (key === 'length' && isArray(target)) {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= newLength) {
                deps.push(dep);
            }
        });
    }
    else {
        // schedule runs for SET | ADD | DELETE
        if (key !== void 0) {
            deps.push(depsMap.get(key));
        }
        // also run for iteration key on ADD | DELETE | Map.SET
        switch (type) {
            case "add" /* TriggerOpTypes.ADD */:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                else if (isIntegerKey(key)) {
                    // new index added to array -> length changes
                    deps.push(depsMap.get('length'));
                }
                break;
            case "delete" /* TriggerOpTypes.DELETE */:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                break;
            case "set" /* TriggerOpTypes.SET */:
                if (isMap(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                }
                break;
        }
    }
    const eventInfo = { target, type, key, newValue, oldValue, oldTarget }
        ;
    if (deps.length === 1) {
        if (deps[0]) {
            {
                triggerEffects(deps[0], eventInfo);
            }
        }
    }
    else {
        const effects = [];
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep);
            }
        }
        {
            triggerEffects(createDep(effects), eventInfo);
        }
    }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
    // spread into array for stabilization
    const effects = isArray(dep) ? dep : [...dep];
    for (const effect of effects) {
        if (effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
}
function triggerEffect(effect, debuggerEventExtraInfo) {
    if (effect !== activeEffect || effect.allowRecurse) {
        if (effect.onTrigger) {
            effect.onTrigger(extend({ effect }, debuggerEventExtraInfo));
        }
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const isNonTrackableKeys = /*#__PURE__*/ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
/*#__PURE__*/
Object.getOwnPropertyNames(Symbol)
    // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
    // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
    // function
    .filter(key => key !== 'arguments' && key !== 'caller')
    .map(key => Symbol[key])
    .filter(isSymbol));
const get$1 = /*#__PURE__*/ createGetter();
const shallowGet = /*#__PURE__*/ createGetter(false, true);
const readonlyGet = /*#__PURE__*/ createGetter(true);
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true);
const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations();
function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
        instrumentations[key] = function (...args) {
            const arr = toRaw(this);
            for (let i = 0, l = this.length; i < l; i++) {
                track(arr, "get" /* TrackOpTypes.GET */, i + '');
            }
            // we run the method using the original args first (which may be reactive)
            const res = arr[key](...args);
            if (res === -1 || res === false) {
                // if that didn't work, run it again using raw values.
                return arr[key](...args.map(toRaw));
            }
            else {
                return res;
            }
        };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
        instrumentations[key] = function (...args) {
            pauseTracking();
            const res = toRaw(this)[key].apply(this, args);
            resetTracking();
            return res;
        };
    });
    return instrumentations;
}
function hasOwnProperty(key) {
    const obj = toRaw(this);
    track(obj, "has" /* TrackOpTypes.HAS */, key);
    return obj.hasOwnProperty(key);
}
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_isShallow" /* ReactiveFlags.IS_SHALLOW */) {
            return shallow;
        }
        else if (key === "__v_raw" /* ReactiveFlags.RAW */ &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap).get(target)) {
            return target;
        }
        const targetIsArray = isArray(target);
        if (!isReadonly) {
            if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
                return Reflect.get(arrayInstrumentations, key, receiver);
            }
            if (key === 'hasOwnProperty') {
                return hasOwnProperty;
            }
        }
        const res = Reflect.get(target, key, receiver);
        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res;
        }
        if (!isReadonly) {
            track(target, "get" /* TrackOpTypes.GET */, key);
        }
        if (shallow) {
            return res;
        }
        if (isRef(res)) {
            // ref unwrapping - skip unwrap for Array + integer key.
            return targetIsArray && isIntegerKey(key) ? res : res.value;
        }
        if (isObject(res)) {
            // Convert returned value into a proxy as well. we do the isObject check
            // here to avoid invalid value warning. Also need to lazy access readonly
            // and reactive here to avoid circular dependency.
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const set$1 = /*#__PURE__*/ createSetter();
const shallowSet = /*#__PURE__*/ createSetter(true);
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        let oldValue = target[key];
        if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
            return false;
        }
        if (!shallow) {
            if (!isShallow$1(value) && !isReadonly(value)) {
                oldValue = toRaw(oldValue);
                value = toRaw(value);
            }
            if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            }
        }
        const hadKey = isArray(target) && isIntegerKey(key)
            ? Number(key) < target.length
            : hasOwn(target, key);
        const result = Reflect.set(target, key, value, receiver);
        // don't trigger if target is something up in the prototype chain of original
        if (target === toRaw(receiver)) {
            if (!hadKey) {
                trigger(target, "add" /* TriggerOpTypes.ADD */, key, value);
            }
            else if (hasChanged(value, oldValue)) {
                trigger(target, "set" /* TriggerOpTypes.SET */, key, value, oldValue);
            }
        }
        return result;
    };
}
function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
        trigger(target, "delete" /* TriggerOpTypes.DELETE */, key, undefined, oldValue);
    }
    return result;
}
function has$1(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
        track(target, "has" /* TrackOpTypes.HAS */, key);
    }
    return result;
}
function ownKeys(target) {
    track(target, "iterate" /* TrackOpTypes.ITERATE */, isArray(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
}
const mutableHandlers = {
    get: get$1,
    set: set$1,
    deleteProperty,
    has: has$1,
    ownKeys
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        {
            warn$1(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    },
    deleteProperty(target, key) {
        {
            warn$1(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    }
};
const shallowReactiveHandlers = /*#__PURE__*/ extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
});
// Props handlers are special in the sense that it should not unwrap top-level
// refs (in order to allow refs to be explicitly passed down), but should
// retain the reactivity of the normal readonly object.
const shallowReadonlyHandlers = /*#__PURE__*/ extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get(target, key, isReadonly = false, isShallow = false) {
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = target["__v_raw" /* ReactiveFlags.RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if (key !== rawKey) {
            track(rawTarget, "get" /* TrackOpTypes.GET */, key);
        }
        track(rawTarget, "get" /* TrackOpTypes.GET */, rawKey);
    }
    const { has } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
    }
    else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
    }
    else if (target !== rawTarget) {
        // #3602 readonly(reactive(Map))
        // ensure that the nested reactive `Map` can do tracking for itself
        target.get(key);
    }
}
function has(key, isReadonly = false) {
    const target = this["__v_raw" /* ReactiveFlags.RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if (key !== rawKey) {
            track(rawTarget, "has" /* TrackOpTypes.HAS */, key);
        }
        track(rawTarget, "has" /* TrackOpTypes.HAS */, rawKey);
    }
    return key === rawKey
        ? target.has(key)
        : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
    target = target["__v_raw" /* ReactiveFlags.RAW */];
    !isReadonly && track(toRaw(target), "iterate" /* TrackOpTypes.ITERATE */, ITERATE_KEY);
    return Reflect.get(target, 'size', target);
}
function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
        target.add(value);
        trigger(target, "add" /* TriggerOpTypes.ADD */, value, value);
    }
    return this;
}
function set(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get.call(target, key);
    target.set(key, value);
    if (!hadKey) {
        trigger(target, "add" /* TriggerOpTypes.ADD */, key, value);
    }
    else if (hasChanged(value, oldValue)) {
        trigger(target, "set" /* TriggerOpTypes.SET */, key, value, oldValue);
    }
    return this;
}
function deleteEntry(key) {
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get ? get.call(target, key) : undefined;
    // forward the operation before queueing reactions
    const result = target.delete(key);
    if (hadKey) {
        trigger(target, "delete" /* TriggerOpTypes.DELETE */, key, undefined, oldValue);
    }
    return result;
}
function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = isMap(target)
            ? new Map(target)
            : new Set(target)
        ;
    // forward the operation before queueing reactions
    const result = target.clear();
    if (hadItems) {
        trigger(target, "clear" /* TriggerOpTypes.CLEAR */, undefined, undefined, oldTarget);
    }
    return result;
}
function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw" /* ReactiveFlags.RAW */];
        const rawTarget = toRaw(target);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly && track(rawTarget, "iterate" /* TrackOpTypes.ITERATE */, ITERATE_KEY);
        return target.forEach((value, key) => {
            // important: make sure the callback is
            // 1. invoked with the reactive map as `this` and 3rd arg
            // 2. the value received should be a corresponding reactive/readonly.
            return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
    };
}
function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
        const target = this["__v_raw" /* ReactiveFlags.RAW */];
        const rawTarget = toRaw(target);
        const targetIsMap = isMap(rawTarget);
        const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
        const isKeyOnly = method === 'keys' && targetIsMap;
        const innerIterator = target[method](...args);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly &&
            track(rawTarget, "iterate" /* TrackOpTypes.ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
        // return a wrapped iterator which returns observed versions of the
        // values emitted from the real iterator
        return {
            // iterator protocol
            next() {
                const { value, done } = innerIterator.next();
                return done
                    ? { value, done }
                    : {
                        value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                        done
                    };
            },
            // iterable protocol
            [Symbol.iterator]() {
                return this;
            }
        };
    };
}
function createReadonlyMethod(type) {
    return function (...args) {
        {
            const key = args[0] ? `on key "${args[0]}" ` : ``;
            console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
        }
        return type === "delete" /* TriggerOpTypes.DELETE */ ? false : this;
    };
}
function createInstrumentations() {
    const mutableInstrumentations = {
        get(key) {
            return get(this, key);
        },
        get size() {
            return size(this);
        },
        has,
        add,
        set,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
    };
    const shallowInstrumentations = {
        get(key) {
            return get(this, key, false, true);
        },
        get size() {
            return size(this);
        },
        has,
        add,
        set,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
    };
    const readonlyInstrumentations = {
        get(key) {
            return get(this, key, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* TriggerOpTypes.ADD */),
        set: createReadonlyMethod("set" /* TriggerOpTypes.SET */),
        delete: createReadonlyMethod("delete" /* TriggerOpTypes.DELETE */),
        clear: createReadonlyMethod("clear" /* TriggerOpTypes.CLEAR */),
        forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations = {
        get(key) {
            return get(this, key, true, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* TriggerOpTypes.ADD */),
        set: createReadonlyMethod("set" /* TriggerOpTypes.SET */),
        delete: createReadonlyMethod("delete" /* TriggerOpTypes.DELETE */),
        clear: createReadonlyMethod("clear" /* TriggerOpTypes.CLEAR */),
        forEach: createForEach(true, true)
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach(method => {
        mutableInstrumentations[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true, false);
        shallowInstrumentations[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
    });
    return [
        mutableInstrumentations,
        readonlyInstrumentations,
        shallowInstrumentations,
        shallowReadonlyInstrumentations
    ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* #__PURE__*/ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
        ? isReadonly
            ? shallowReadonlyInstrumentations
            : shallowInstrumentations
        : isReadonly
            ? readonlyInstrumentations
            : mutableInstrumentations;
    return (target, key, receiver) => {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* ReactiveFlags.RAW */) {
            return target;
        }
        return Reflect.get(hasOwn(instrumentations, key) && key in target
            ? instrumentations
            : target, key, receiver);
    };
}
const mutableCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has.call(target, rawKey)) {
        const type = toRawType(target);
        console.warn(`Reactive ${type} contains both the raw and reactive ` +
            `versions of the same object${type === `Map` ? ` as keys` : ``}, ` +
            `which can lead to inconsistencies. ` +
            `Avoid differentiating between the raw and reactive versions ` +
            `of an object and only use the reactive version if possible.`);
    }
}

const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function targetTypeMap(rawType) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return 1 /* TargetType.COMMON */;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return 2 /* TargetType.COLLECTION */;
        default:
            return 0 /* TargetType.INVALID */;
    }
}
function getTargetType(value) {
    return value["__v_skip" /* ReactiveFlags.SKIP */] || !Object.isExtensible(value)
        ? 0 /* TargetType.INVALID */
        : targetTypeMap(toRawType(value));
}
function reactive(target) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (isReadonly(target)) {
        return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
/**
 * Creates a readonly copy of the original object. Note the returned copy is not
 * made reactive, but `readonly` can be called on an already reactive object.
 */
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
/**
 * Returns a reactive-copy of the original object, where only the root level
 * properties are readonly, and does NOT unwrap refs nor recursively convert
 * returned properties.
 * This is used for creating the props proxy object for stateful components.
 */
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
        {
            console.warn(`value cannot be made reactive: ${String(target)}`);
        }
        return target;
    }
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    if (target["__v_raw" /* ReactiveFlags.RAW */] &&
        !(isReadonly && target["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */])) {
        return target;
    }
    // target already has corresponding Proxy
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // only specific value types can be observed.
    const targetType = getTargetType(target);
    if (targetType === 0 /* TargetType.INVALID */) {
        return target;
    }
    const proxy = new Proxy(target, targetType === 2 /* TargetType.COLLECTION */ ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function isReactive(value) {
    if (isReadonly(value)) {
        return isReactive(value["__v_raw" /* ReactiveFlags.RAW */]);
    }
    return !!(value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
}
function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */]);
}
function isShallow$1(value) {
    return !!(value && value["__v_isShallow" /* ReactiveFlags.IS_SHALLOW */]);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw" /* ReactiveFlags.RAW */];
    return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
    def(value, "__v_skip" /* ReactiveFlags.SKIP */, true);
    return value;
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;
const toReadonly = (value) => isObject(value) ? readonly(value) : value;

function trackRefValue(ref) {
    if (shouldTrack && activeEffect) {
        ref = toRaw(ref);
        {
            trackEffects(ref.dep || (ref.dep = createDep()), {
                target: ref,
                type: "get" /* TrackOpTypes.GET */,
                key: 'value'
            });
        }
    }
}
function triggerRefValue(ref, newVal) {
    ref = toRaw(ref);
    const dep = ref.dep;
    if (dep) {
        {
            triggerEffects(dep, {
                target: ref,
                type: "set" /* TriggerOpTypes.SET */,
                key: 'value',
                newValue: newVal
            });
        }
    }
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
const shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    }
};
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}

var _a$1;
class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, isSSR) {
        this._setter = _setter;
        this.dep = undefined;
        this.__v_isRef = true;
        this[_a$1] = false;
        this._dirty = true;
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
                triggerRefValue(this);
            }
        });
        this.effect.computed = this;
        this.effect.active = this._cacheable = !isSSR;
        this["__v_isReadonly" /* ReactiveFlags.IS_READONLY */] = isReadonly;
    }
    get value() {
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376
        const self = toRaw(this);
        trackRefValue(self);
        if (self._dirty || !self._cacheable) {
            self._dirty = false;
            self._value = self.effect.run();
        }
        return self._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
_a$1 = "__v_isReadonly" /* ReactiveFlags.IS_READONLY */;
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    const onlyGetter = isFunction(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => {
                console.warn('Write operation failed: computed value is readonly');
            }
            ;
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
    if (debugOptions && !isSSR) {
        cRef.effect.onTrack = debugOptions.onTrack;
        cRef.effect.onTrigger = debugOptions.onTrigger;
    }
    return cRef;
}

const stack = [];
function pushWarningContext(vnode) {
    stack.push(vnode);
}
function popWarningContext() {
    stack.pop();
}
function warn(msg, ...args) {
    // avoid props formatting or warn handler tracking deps that might be mutated
    // during patch, leading to infinite recursion.
    pauseTracking();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) {
        callWithErrorHandling(appWarnHandler, instance, 11 /* ErrorCodes.APP_WARN_HANDLER */, [
            msg + args.join(''),
            instance && instance.proxy,
            trace
                .map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`)
                .join('\n'),
            trace
        ]);
    }
    else {
        const warnArgs = [`[Vue warn]: ${msg}`, ...args];
        /* istanbul ignore if */
        if (trace.length &&
            // avoid spamming console during tests
            !false) {
            warnArgs.push(`\n`, ...formatTrace(trace));
        }
        console.warn(...warnArgs);
    }
    resetTracking();
}
function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) {
        return [];
    }
    // we can't just use the stack because it will be incomplete during updates
    // that did not start from the root. Re-construct the parent chain using
    // instance parent pointers.
    const normalizedStack = [];
    while (currentVNode) {
        const last = normalizedStack[0];
        if (last && last.vnode === currentVNode) {
            last.recurseCount++;
        }
        else {
            normalizedStack.push({
                vnode: currentVNode,
                recurseCount: 0
            });
        }
        const parentInstance = currentVNode.component && currentVNode.component.parent;
        currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
}
/* istanbul ignore next */
function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i) => {
        logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry(entry));
    });
    return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
    const close = `>` + postfix;
    return vnode.props
        ? [open, ...formatProps(vnode.props), close]
        : [open + close];
}
/* istanbul ignore next */
function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach(key => {
        res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) {
        res.push(` ...`);
    }
    return res;
}
/* istanbul ignore next */
function formatProp(key, value, raw) {
    if (isString(value)) {
        value = JSON.stringify(value);
        return raw ? value : [`${key}=${value}`];
    }
    else if (typeof value === 'number' ||
        typeof value === 'boolean' ||
        value == null) {
        return raw ? value : [`${key}=${value}`];
    }
    else if (isRef(value)) {
        value = formatProp(key, toRaw(value.value), true);
        return raw ? value : [`${key}=Ref<`, value, `>`];
    }
    else if (isFunction(value)) {
        return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
    }
    else {
        value = toRaw(value);
        return raw ? value : [`${key}=`, value];
    }
}

const ErrorTypeStrings = {
    ["sp" /* LifecycleHooks.SERVER_PREFETCH */]: 'serverPrefetch hook',
    ["bc" /* LifecycleHooks.BEFORE_CREATE */]: 'beforeCreate hook',
    ["c" /* LifecycleHooks.CREATED */]: 'created hook',
    ["bm" /* LifecycleHooks.BEFORE_MOUNT */]: 'beforeMount hook',
    ["m" /* LifecycleHooks.MOUNTED */]: 'mounted hook',
    ["bu" /* LifecycleHooks.BEFORE_UPDATE */]: 'beforeUpdate hook',
    ["u" /* LifecycleHooks.UPDATED */]: 'updated',
    ["bum" /* LifecycleHooks.BEFORE_UNMOUNT */]: 'beforeUnmount hook',
    ["um" /* LifecycleHooks.UNMOUNTED */]: 'unmounted hook',
    ["a" /* LifecycleHooks.ACTIVATED */]: 'activated hook',
    ["da" /* LifecycleHooks.DEACTIVATED */]: 'deactivated hook',
    ["ec" /* LifecycleHooks.ERROR_CAPTURED */]: 'errorCaptured hook',
    ["rtc" /* LifecycleHooks.RENDER_TRACKED */]: 'renderTracked hook',
    ["rtg" /* LifecycleHooks.RENDER_TRIGGERED */]: 'renderTriggered hook',
    [0 /* ErrorCodes.SETUP_FUNCTION */]: 'setup function',
    [1 /* ErrorCodes.RENDER_FUNCTION */]: 'render function',
    [2 /* ErrorCodes.WATCH_GETTER */]: 'watcher getter',
    [3 /* ErrorCodes.WATCH_CALLBACK */]: 'watcher callback',
    [4 /* ErrorCodes.WATCH_CLEANUP */]: 'watcher cleanup function',
    [5 /* ErrorCodes.NATIVE_EVENT_HANDLER */]: 'native event handler',
    [6 /* ErrorCodes.COMPONENT_EVENT_HANDLER */]: 'component event handler',
    [7 /* ErrorCodes.VNODE_HOOK */]: 'vnode hook',
    [8 /* ErrorCodes.DIRECTIVE_HOOK */]: 'directive hook',
    [9 /* ErrorCodes.TRANSITION_HOOK */]: 'transition hook',
    [10 /* ErrorCodes.APP_ERROR_HANDLER */]: 'app errorHandler',
    [11 /* ErrorCodes.APP_WARN_HANDLER */]: 'app warnHandler',
    [12 /* ErrorCodes.FUNCTION_REF */]: 'ref function',
    [13 /* ErrorCodes.ASYNC_COMPONENT_LOADER */]: 'async component loader',
    [14 /* ErrorCodes.SCHEDULER */]: 'scheduler flush. This is likely a Vue internals bug. ' +
        'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core'
};
function callWithErrorHandling(fn, instance, type, args) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    }
    catch (err) {
        handleError(err, instance, type);
    }
    return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
        const res = callWithErrorHandling(fn, instance, type, args);
        if (res && isPromise(res)) {
            res.catch(err => {
                handleError(err, instance, type);
            });
        }
        return res;
    }
    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
}
function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    if (instance) {
        let cur = instance.parent;
        // the exposed instance is the render proxy to keep it consistent with 2.x
        const exposedInstance = instance.proxy;
        // in production the hook receives only the error code
        const errorInfo = ErrorTypeStrings[type] ;
        while (cur) {
            const errorCapturedHooks = cur.ec;
            if (errorCapturedHooks) {
                for (let i = 0; i < errorCapturedHooks.length; i++) {
                    if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
                        return;
                    }
                }
            }
            cur = cur.parent;
        }
        // app-level handling
        const appErrorHandler = instance.appContext.config.errorHandler;
        if (appErrorHandler) {
            callWithErrorHandling(appErrorHandler, null, 10 /* ErrorCodes.APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
            return;
        }
    }
    logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
    {
        const info = ErrorTypeStrings[type];
        if (contextVNode) {
            pushWarningContext(contextVNode);
        }
        warn(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
        if (contextVNode) {
            popWarningContext();
        }
        // crash in dev by default so it's more noticeable
        if (throwInDev) {
            throw err;
        }
        else {
            console.error(err);
        }
    }
}

let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /*#__PURE__*/ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
// #2768
// Use binary-search to find a suitable position in the queue,
// so that the queue maintains the increasing order of job's id,
// which can prevent the job from being skipped and also can avoid repeated patching.
function findInsertionIndex(id) {
    // the start index should be `flushIndex + 1`
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
        const middle = (start + end) >>> 1;
        const middleJobId = getId(queue[middle]);
        middleJobId < id ? (start = middle + 1) : (end = middle);
    }
    return start;
}
function queueJob(job) {
    // the dedupe search uses the startIndex argument of Array.includes()
    // by default the search index includes the current job that is being run
    // so it cannot recursively trigger itself again.
    // if the job is a watch() callback, the search will start with a +1 index to
    // allow it recursively trigger itself - it is the user's responsibility to
    // ensure it doesn't end up in an infinite loop.
    if (!queue.length ||
        !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
        if (job.id == null) {
            queue.push(job);
        }
        else {
            queue.splice(findInsertionIndex(job.id), 0, job);
        }
        queueFlush();
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true;
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function invalidateJob(job) {
    const i = queue.indexOf(job);
    if (i > flushIndex) {
        queue.splice(i, 1);
    }
}
function queuePostFlushCb(cb) {
    if (!isArray(cb)) {
        if (!activePostFlushCbs ||
            !activePostFlushCbs.includes(cb, cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex)) {
            pendingPostFlushCbs.push(cb);
        }
    }
    else {
        // if cb is an array, it is a component lifecycle hook which can only be
        // triggered by a job, which is already deduped in the main queue, so
        // we can skip duplicate check here to improve perf
        pendingPostFlushCbs.push(...cb);
    }
    queueFlush();
}
function flushPreFlushCbs(seen, 
// if currently flushing, skip the current job itself
i = isFlushing ? flushIndex + 1 : 0) {
    {
        seen = seen || new Map();
    }
    for (; i < queue.length; i++) {
        const cb = queue[i];
        if (cb && cb.pre) {
            if (checkRecursiveUpdates(seen, cb)) {
                continue;
            }
            queue.splice(i, 1);
            i--;
            cb();
        }
    }
}
function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
        const deduped = [...new Set(pendingPostFlushCbs)];
        pendingPostFlushCbs.length = 0;
        // #1947 already has active queue, nested flushPostFlushCbs call
        if (activePostFlushCbs) {
            activePostFlushCbs.push(...deduped);
            return;
        }
        activePostFlushCbs = deduped;
        {
            seen = seen || new Map();
        }
        activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            if (checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex])) {
                continue;
            }
            activePostFlushCbs[postFlushIndex]();
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
    const diff = getId(a) - getId(b);
    if (diff === 0) {
        if (a.pre && !b.pre)
            return -1;
        if (b.pre && !a.pre)
            return 1;
    }
    return diff;
};
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    {
        seen = seen || new Map();
    }
    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child so its render effect will have smaller
    //    priority number)
    // 2. If a component is unmounted during a parent component's update,
    //    its update can be skipped.
    queue.sort(comparator);
    // conditional usage of checkRecursiveUpdate must be determined out of
    // try ... catch block since Rollup by default de-optimizes treeshaking
    // inside try-catch. This can leave all warning code unshaked. Although
    // they would get eventually shaken by a minifier like terser, some minifiers
    // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
    const check = (job) => checkRecursiveUpdates(seen, job)
        ;
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job && job.active !== false) {
                if (("development" !== 'production') && check(job)) {
                    continue;
                }
                // console.log(`running:`, job.id)
                callWithErrorHandling(job, null, 14 /* ErrorCodes.SCHEDULER */);
            }
        }
    }
    finally {
        flushIndex = 0;
        queue.length = 0;
        flushPostFlushCbs(seen);
        isFlushing = false;
        currentFlushPromise = null;
        // some postFlushCb queued jobs!
        // keep flushing until it drains.
        if (queue.length || pendingPostFlushCbs.length) {
            flushJobs(seen);
        }
    }
}
function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) {
        seen.set(fn, 1);
    }
    else {
        const count = seen.get(fn);
        if (count > RECURSION_LIMIT) {
            const instance = fn.ownerInstance;
            const componentName = instance && getComponentName(instance.type);
            warn(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. ` +
                `This means you have a reactive effect that is mutating its own ` +
                `dependencies and thus recursively triggering itself. Possible sources ` +
                `include component template, render function, updated hook or ` +
                `watcher source function.`);
            return true;
        }
        else {
            seen.set(fn, count + 1);
        }
    }
}

/* eslint-disable no-restricted-globals */
let isHmrUpdating = false;
const hmrDirtyComponents = new Set();
// Expose the HMR runtime on the global object
// This makes it entirely tree-shakable without polluting the exports and makes
// it easier to be used in toolings like vue-loader
// Note: for a component to be eligible for HMR it also needs the __hmrId option
// to be set so that its instances can be registered / removed.
{
    getGlobalThis().__VUE_HMR_RUNTIME__ = {
        createRecord: tryWrap(createRecord),
        rerender: tryWrap(rerender),
        reload: tryWrap(reload)
    };
}
const map = new Map();
function registerHMR(instance) {
    const id = instance.type.__hmrId;
    let record = map.get(id);
    if (!record) {
        createRecord(id, instance.type);
        record = map.get(id);
    }
    record.instances.add(instance);
}
function unregisterHMR(instance) {
    map.get(instance.type.__hmrId).instances.delete(instance);
}
function createRecord(id, initialDef) {
    if (map.has(id)) {
        return false;
    }
    map.set(id, {
        initialDef: normalizeClassComponent(initialDef),
        instances: new Set()
    });
    return true;
}
function normalizeClassComponent(component) {
    return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
    const record = map.get(id);
    if (!record) {
        return;
    }
    // update initial record (for not-yet-rendered component)
    record.initialDef.render = newRender;
    [...record.instances].forEach(instance => {
        if (newRender) {
            instance.render = newRender;
            normalizeClassComponent(instance.type).render = newRender;
        }
        instance.renderCache = [];
        // this flag forces child components with slot content to update
        isHmrUpdating = true;
        instance.update();
        isHmrUpdating = false;
    });
}
function reload(id, newComp) {
    const record = map.get(id);
    if (!record)
        return;
    newComp = normalizeClassComponent(newComp);
    // update initial def (for not-yet-rendered components)
    updateComponentDef(record.initialDef, newComp);
    // create a snapshot which avoids the set being mutated during updates
    const instances = [...record.instances];
    for (const instance of instances) {
        const oldComp = normalizeClassComponent(instance.type);
        if (!hmrDirtyComponents.has(oldComp)) {
            // 1. Update existing comp definition to match new one
            if (oldComp !== record.initialDef) {
                updateComponentDef(oldComp, newComp);
            }
            // 2. mark definition dirty. This forces the renderer to replace the
            // component on patch.
            hmrDirtyComponents.add(oldComp);
        }
        // 3. invalidate options resolution cache
        instance.appContext.optionsCache.delete(instance.type);
        // 4. actually update
        if (instance.ceReload) {
            // custom element
            hmrDirtyComponents.add(oldComp);
            instance.ceReload(newComp.styles);
            hmrDirtyComponents.delete(oldComp);
        }
        else if (instance.parent) {
            // 4. Force the parent instance to re-render. This will cause all updated
            // components to be unmounted and re-mounted. Queue the update so that we
            // don't end up forcing the same parent to re-render multiple times.
            queueJob(instance.parent.update);
        }
        else if (instance.appContext.reload) {
            // root instance mounted via createApp() has a reload method
            instance.appContext.reload();
        }
        else if (typeof window !== 'undefined') {
            // root instance inside tree created via raw render(). Force reload.
            window.location.reload();
        }
        else {
            console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
        }
    }
    // 5. make sure to cleanup dirty hmr components after update
    queuePostFlushCb(() => {
        for (const instance of instances) {
            hmrDirtyComponents.delete(normalizeClassComponent(instance.type));
        }
    });
}
function updateComponentDef(oldComp, newComp) {
    extend(oldComp, newComp);
    for (const key in oldComp) {
        if (key !== '__file' && !(key in newComp)) {
            delete oldComp[key];
        }
    }
}
function tryWrap(fn) {
    return (id, arg) => {
        try {
            return fn(id, arg);
        }
        catch (e) {
            console.error(e);
            console.warn(`[HMR] Something went wrong during Vue component hot-reload. ` +
                `Full reload required.`);
        }
    };
}

let devtools;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
    if (devtools) {
        devtools.emit(event, ...args);
    }
    else if (!devtoolsNotInstalled) {
        buffer.push({ event, args });
    }
}
function setDevtoolsHook(hook, target) {
    var _a, _b;
    devtools = hook;
    if (devtools) {
        devtools.enabled = true;
        buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
        buffer = [];
    }
    else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== 'undefined' &&
        // some envs mock window but not fully
        window.HTMLElement &&
        // also exclude jsdom
        !((_b = (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.includes('jsdom'))) {
        const replay = (target.__VUE_DEVTOOLS_HOOK_REPLAY__ =
            target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []);
        replay.push((newHook) => {
            setDevtoolsHook(newHook, target);
        });
        // clear buffer after 3s - the user probably doesn't have devtools installed
        // at all, and keeping the buffer will cause memory leaks (#4738)
        setTimeout(() => {
            if (!devtools) {
                target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
                devtoolsNotInstalled = true;
                buffer = [];
            }
        }, 3000);
    }
    else {
        // non-browser env, assume not installed
        devtoolsNotInstalled = true;
        buffer = [];
    }
}
function devtoolsInitApp(app, version) {
    emit$1("app:init" /* DevtoolsHooks.APP_INIT */, app, version, {
        Fragment,
        Text,
        Comment,
        Static
    });
}
function devtoolsUnmountApp(app) {
    emit$1("app:unmount" /* DevtoolsHooks.APP_UNMOUNT */, app);
}
const devtoolsComponentAdded = /*#__PURE__*/ createDevtoolsComponentHook("component:added" /* DevtoolsHooks.COMPONENT_ADDED */);
const devtoolsComponentUpdated = 
/*#__PURE__*/ createDevtoolsComponentHook("component:updated" /* DevtoolsHooks.COMPONENT_UPDATED */);
const _devtoolsComponentRemoved = /*#__PURE__*/ createDevtoolsComponentHook("component:removed" /* DevtoolsHooks.COMPONENT_REMOVED */);
const devtoolsComponentRemoved = (component) => {
    if (devtools &&
        typeof devtools.cleanupBuffer === 'function' &&
        // remove the component if it wasn't buffered
        !devtools.cleanupBuffer(component)) {
        _devtoolsComponentRemoved(component);
    }
};
function createDevtoolsComponentHook(hook) {
    return (component) => {
        emit$1(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : undefined, component);
    };
}
const devtoolsPerfStart = /*#__PURE__*/ createDevtoolsPerformanceHook("perf:start" /* DevtoolsHooks.PERFORMANCE_START */);
const devtoolsPerfEnd = /*#__PURE__*/ createDevtoolsPerformanceHook("perf:end" /* DevtoolsHooks.PERFORMANCE_END */);
function createDevtoolsPerformanceHook(hook) {
    return (component, type, time) => {
        emit$1(hook, component.appContext.app, component.uid, component, type, time);
    };
}
function devtoolsComponentEmit(component, event, params) {
    emit$1("component:emit" /* DevtoolsHooks.COMPONENT_EMIT */, component.appContext.app, component, event, params);
}

function emit(instance, event, ...rawArgs) {
    if (instance.isUnmounted)
        return;
    const props = instance.vnode.props || EMPTY_OBJ;
    {
        const { emitsOptions, propsOptions: [propsOptions] } = instance;
        if (emitsOptions) {
            if (!(event in emitsOptions) &&
                !(false )) {
                if (!propsOptions || !(toHandlerKey(event) in propsOptions)) {
                    warn(`Component emitted event "${event}" but it is neither declared in ` +
                        `the emits option nor as an "${toHandlerKey(event)}" prop.`);
                }
            }
            else {
                const validator = emitsOptions[event];
                if (isFunction(validator)) {
                    const isValid = validator(...rawArgs);
                    if (!isValid) {
                        warn(`Invalid event arguments: event validation failed for event "${event}".`);
                    }
                }
            }
        }
    }
    let args = rawArgs;
    const isModelListener = event.startsWith('update:');
    // for v-model update:xxx events, apply modifiers on args
    const modelArg = isModelListener && event.slice(7);
    if (modelArg && modelArg in props) {
        const modifiersKey = `${modelArg === 'modelValue' ? 'model' : modelArg}Modifiers`;
        const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
        if (trim) {
            args = rawArgs.map(a => (isString(a) ? a.trim() : a));
        }
        if (number) {
            args = rawArgs.map(looseToNumber);
        }
    }
    {
        devtoolsComponentEmit(instance, event, args);
    }
    {
        const lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
            warn(`Event "${lowerCaseEvent}" is emitted in component ` +
                `${formatComponentName(instance, instance.type)} but the handler is registered for "${event}". ` +
                `Note that HTML attributes are case-insensitive and you cannot use ` +
                `v-on to listen to camelCase events when using in-DOM templates. ` +
                `You should probably use "${hyphenate(event)}" instead of "${event}".`);
        }
    }
    let handlerName;
    let handler = props[(handlerName = toHandlerKey(event))] ||
        // also try camelCase event handler (#2249)
        props[(handlerName = toHandlerKey(camelize(event)))];
    // for v-model update:xxx events, also trigger kebab-case equivalent
    // for props passed via kebab-case
    if (!handler && isModelListener) {
        handler = props[(handlerName = toHandlerKey(hyphenate(event)))];
    }
    if (handler) {
        callWithAsyncErrorHandling(handler, instance, 6 /* ErrorCodes.COMPONENT_EVENT_HANDLER */, args);
    }
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
        if (!instance.emitted) {
            instance.emitted = {};
        }
        else if (instance.emitted[handlerName]) {
            return;
        }
        instance.emitted[handlerName] = true;
        callWithAsyncErrorHandling(onceHandler, instance, 6 /* ErrorCodes.COMPONENT_EVENT_HANDLER */, args);
    }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== undefined) {
        return cached;
    }
    const raw = comp.emits;
    let normalized = {};
    // apply mixin/extends props
    let hasExtends = false;
    if (!isFunction(comp)) {
        const extendEmits = (raw) => {
            const normalizedFromExtend = normalizeEmitsOptions(raw, appContext, true);
            if (normalizedFromExtend) {
                hasExtends = true;
                extend(normalized, normalizedFromExtend);
            }
        };
        if (!asMixin && appContext.mixins.length) {
            appContext.mixins.forEach(extendEmits);
        }
        if (comp.extends) {
            extendEmits(comp.extends);
        }
        if (comp.mixins) {
            comp.mixins.forEach(extendEmits);
        }
    }
    if (!raw && !hasExtends) {
        if (isObject(comp)) {
            cache.set(comp, null);
        }
        return null;
    }
    if (isArray(raw)) {
        raw.forEach(key => (normalized[key] = null));
    }
    else {
        extend(normalized, raw);
    }
    if (isObject(comp)) {
        cache.set(comp, normalized);
    }
    return normalized;
}
// Check if an incoming prop key is a declared emit event listener.
// e.g. With `emits: { click: null }`, props named `onClick` and `onclick` are
// both considered matched listeners.
function isEmitListener(options, key) {
    if (!options || !isOn(key)) {
        return false;
    }
    key = key.slice(2).replace(/Once$/, '');
    return (hasOwn(options, key[0].toLowerCase() + key.slice(1)) ||
        hasOwn(options, hyphenate(key)) ||
        hasOwn(options, key));
}

/**
 * mark the current rendering instance for asset resolution (e.g.
 * resolveComponent, resolveDirective) during render
 */
let currentRenderingInstance = null;
let currentScopeId = null;
/**
 * Note: rendering calls maybe nested. The function returns the parent rendering
 * instance if present, which should be restored after the render is done:
 *
 * ```js
 * const prev = setCurrentRenderingInstance(i)
 * // ...render
 * setCurrentRenderingInstance(prev)
 * ```
 */
function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = (instance && instance.type.__scopeId) || null;
    return prev;
}
/**
 * Set scope id when creating hoisted vnodes.
 * @private compiler helper
 */
function pushScopeId(id) {
    currentScopeId = id;
}
/**
 * Technically we no longer need this after 3.0.8 but we need to keep the same
 * API for backwards compat w/ code generated by compilers.
 * @private
 */
function popScopeId() {
    currentScopeId = null;
}
/**
 * Wrap a slot function to memoize current rendering instance
 * @private compiler helper
 */
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot // false only
) {
    if (!ctx)
        return fn;
    // already normalized
    if (fn._n) {
        return fn;
    }
    const renderFnWithContext = (...args) => {
        // If a user calls a compiled slot inside a template expression (#1745), it
        // can mess up block tracking, so by default we disable block tracking and
        // force bail out when invoking a compiled slot (indicated by the ._d flag).
        // This isn't necessary if rendering a compiled `<slot>`, so we flip the
        // ._d flag off when invoking the wrapped fn inside `renderSlot`.
        if (renderFnWithContext._d) {
            setBlockTracking(-1);
        }
        const prevInstance = setCurrentRenderingInstance(ctx);
        let res;
        try {
            res = fn(...args);
        }
        finally {
            setCurrentRenderingInstance(prevInstance);
            if (renderFnWithContext._d) {
                setBlockTracking(1);
            }
        }
        {
            devtoolsComponentUpdated(ctx);
        }
        return res;
    };
    // mark normalized to avoid duplicated wrapping
    renderFnWithContext._n = true;
    // mark this as compiled by default
    // this is used in vnode.ts -> normalizeChildren() to set the slot
    // rendering flag.
    renderFnWithContext._c = true;
    // disable block tracking by default
    renderFnWithContext._d = true;
    return renderFnWithContext;
}

/**
 * dev only flag to track whether $attrs was used during render.
 * If $attrs was used during render then the warning for failed attrs
 * fallthrough can be suppressed.
 */
let accessedAttrs = false;
function markAttrsAccessed() {
    accessedAttrs = true;
}
function renderComponentRoot(instance) {
    const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
    let result;
    let fallthroughAttrs;
    const prev = setCurrentRenderingInstance(instance);
    {
        accessedAttrs = false;
    }
    try {
        if (vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
            // withProxy is a proxy with a different `has` trap only for
            // runtime-compiled render functions using `with` block.
            const proxyToUse = withProxy || proxy;
            result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
            fallthroughAttrs = attrs;
        }
        else {
            // functional
            const render = Component;
            // in dev, mark attrs accessed if optional props (attrs === props)
            if (("development" !== 'production') && attrs === props) {
                markAttrsAccessed();
            }
            result = normalizeVNode(render.length > 1
                ? render(props, ("development" !== 'production')
                    ? {
                        get attrs() {
                            markAttrsAccessed();
                            return attrs;
                        },
                        slots,
                        emit
                    }
                    : { attrs, slots, emit })
                : render(props, null /* we know it doesn't need it */));
            fallthroughAttrs = Component.props
                ? attrs
                : getFunctionalFallthrough(attrs);
        }
    }
    catch (err) {
        blockStack.length = 0;
        handleError(err, instance, 1 /* ErrorCodes.RENDER_FUNCTION */);
        result = createVNode(Comment);
    }
    // attr merging
    // in dev mode, comments are preserved, and it's possible for a template
    // to have comments along side the root element which makes it a fragment
    let root = result;
    let setRoot = undefined;
    if (result.patchFlag > 0 &&
        result.patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */) {
        [root, setRoot] = getChildRoot(result);
    }
    if (fallthroughAttrs && inheritAttrs !== false) {
        const keys = Object.keys(fallthroughAttrs);
        const { shapeFlag } = root;
        if (keys.length) {
            if (shapeFlag & (1 /* ShapeFlags.ELEMENT */ | 6 /* ShapeFlags.COMPONENT */)) {
                if (propsOptions && keys.some(isModelListener)) {
                    // If a v-model listener (onUpdate:xxx) has a corresponding declared
                    // prop, it indicates this component expects to handle v-model and
                    // it should not fallthrough.
                    // related: #1543, #1643, #1989
                    fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
                }
                root = cloneVNode(root, fallthroughAttrs);
            }
            else if (!accessedAttrs && root.type !== Comment) {
                const allAttrs = Object.keys(attrs);
                const eventAttrs = [];
                const extraAttrs = [];
                for (let i = 0, l = allAttrs.length; i < l; i++) {
                    const key = allAttrs[i];
                    if (isOn(key)) {
                        // ignore v-model handlers when they fail to fallthrough
                        if (!isModelListener(key)) {
                            // remove `on`, lowercase first letter to reflect event casing
                            // accurately
                            eventAttrs.push(key[2].toLowerCase() + key.slice(3));
                        }
                    }
                    else {
                        extraAttrs.push(key);
                    }
                }
                if (extraAttrs.length) {
                    warn(`Extraneous non-props attributes (` +
                        `${extraAttrs.join(', ')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes.`);
                }
                if (eventAttrs.length) {
                    warn(`Extraneous non-emits event listeners (` +
                        `${eventAttrs.join(', ')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes. ` +
                        `If the listener is intended to be a component custom event listener only, ` +
                        `declare it using the "emits" option.`);
                }
            }
        }
    }
    // inherit directives
    if (vnode.dirs) {
        if (!isElementRoot(root)) {
            warn(`Runtime directive used on component with non-element root node. ` +
                `The directives will not function as intended.`);
        }
        // clone before mutating since the root may be a hoisted vnode
        root = cloneVNode(root);
        root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    // inherit transition data
    if (vnode.transition) {
        if (!isElementRoot(root)) {
            warn(`Component inside <Transition> renders non-element root node ` +
                `that cannot be animated.`);
        }
        root.transition = vnode.transition;
    }
    if (setRoot) {
        setRoot(root);
    }
    else {
        result = root;
    }
    setCurrentRenderingInstance(prev);
    return result;
}
/**
 * dev only
 * In dev mode, template root level comments are rendered, which turns the
 * template into a fragment root, but we need to locate the single element
 * root for attrs and scope id processing.
 */
const getChildRoot = (vnode) => {
    const rawChildren = vnode.children;
    const dynamicChildren = vnode.dynamicChildren;
    const childRoot = filterSingleRoot(rawChildren);
    if (!childRoot) {
        return [vnode, undefined];
    }
    const index = rawChildren.indexOf(childRoot);
    const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
    const setRoot = (updatedRoot) => {
        rawChildren[index] = updatedRoot;
        if (dynamicChildren) {
            if (dynamicIndex > -1) {
                dynamicChildren[dynamicIndex] = updatedRoot;
            }
            else if (updatedRoot.patchFlag > 0) {
                vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
            }
        }
    };
    return [normalizeVNode(childRoot), setRoot];
};
function filterSingleRoot(children) {
    let singleRoot;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isVNode(child)) {
            // ignore user comment
            if (child.type !== Comment || child.children === 'v-if') {
                if (singleRoot) {
                    // has more than 1 non-comment child, return now
                    return;
                }
                else {
                    singleRoot = child;
                }
            }
        }
        else {
            return;
        }
    }
    return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
    let res;
    for (const key in attrs) {
        if (key === 'class' || key === 'style' || isOn(key)) {
            (res || (res = {}))[key] = attrs[key];
        }
    }
    return res;
};
const filterModelListeners = (attrs, props) => {
    const res = {};
    for (const key in attrs) {
        if (!isModelListener(key) || !(key.slice(9) in props)) {
            res[key] = attrs[key];
        }
    }
    return res;
};
const isElementRoot = (vnode) => {
    return (vnode.shapeFlag & (6 /* ShapeFlags.COMPONENT */ | 1 /* ShapeFlags.ELEMENT */) ||
        vnode.type === Comment // potential v-if branch switch
    );
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    // Parent component's render function was hot-updated. Since this may have
    // caused the child component's slots content to have changed, we need to
    // force the child to update as well.
    if ((prevChildren || nextChildren) && isHmrUpdating) {
        return true;
    }
    // force child update for runtime directive or transition on component vnode.
    if (nextVNode.dirs || nextVNode.transition) {
        return true;
    }
    if (optimized && patchFlag >= 0) {
        if (patchFlag & 1024 /* PatchFlags.DYNAMIC_SLOTS */) {
            // slot content that references values that might have changed,
            // e.g. in a v-for
            return true;
        }
        if (patchFlag & 16 /* PatchFlags.FULL_PROPS */) {
            if (!prevProps) {
                return !!nextProps;
            }
            // presence of this flag indicates props are always non-null
            return hasPropsChanged(prevProps, nextProps, emits);
        }
        else if (patchFlag & 8 /* PatchFlags.PROPS */) {
            const dynamicProps = nextVNode.dynamicProps;
            for (let i = 0; i < dynamicProps.length; i++) {
                const key = dynamicProps[i];
                if (nextProps[key] !== prevProps[key] &&
                    !isEmitListener(emits, key)) {
                    return true;
                }
            }
        }
    }
    else {
        // this path is only taken by manually written render functions
        // so presence of any children leads to a forced update
        if (prevChildren || nextChildren) {
            if (!nextChildren || !nextChildren.$stable) {
                return true;
            }
        }
        if (prevProps === nextProps) {
            return false;
        }
        if (!prevProps) {
            return !!nextProps;
        }
        if (!nextProps) {
            return true;
        }
        return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i];
        if (nextProps[key] !== prevProps[key] &&
            !isEmitListener(emitsOptions, key)) {
            return true;
        }
    }
    return false;
}
function updateHOCHostEl({ vnode, parent }, el // HostNode
) {
    while (parent && parent.subTree === vnode) {
        (vnode = parent.vnode).el = el;
        parent = parent.parent;
    }
}

const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
        if (isArray(fn)) {
            suspense.effects.push(...fn);
        }
        else {
            suspense.effects.push(fn);
        }
    }
    else {
        queuePostFlushCb(fn);
    }
}

function provide(key, value) {
    if (!currentInstance) {
        {
            warn(`provide() can only be used inside setup().`);
        }
    }
    else {
        let provides = currentInstance.provides;
        // by default an instance inherits its parent's provides object
        // but when it needs to provide values of its own, it creates its
        // own provides object using parent provides object as prototype.
        // this way in `inject` we can simply look up injections from direct
        // parent and let the prototype chain do the work.
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        // TS doesn't allow symbol as index type
        provides[key] = value;
    }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
    // fallback to `currentRenderingInstance` so that this can be called in
    // a functional component
    const instance = currentInstance || currentRenderingInstance;
    if (instance) {
        // #2400
        // to support `app.use` plugins,
        // fallback to appContext's `provides` if the instance is at root
        const provides = instance.parent == null
            ? instance.vnode.appContext && instance.vnode.appContext.provides
            : instance.parent.provides;
        if (provides && key in provides) {
            // TS doesn't allow symbol as index type
            return provides[key];
        }
        else if (arguments.length > 1) {
            return treatDefaultAsFactory && isFunction(defaultValue)
                ? defaultValue.call(instance.proxy)
                : defaultValue;
        }
        else {
            warn(`injection "${String(key)}" not found.`);
        }
    }
    else {
        warn(`inject() can only be used inside setup() or functional components.`);
    }
}
// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
// implementation
function watch(source, cb, options) {
    if (!isFunction(cb)) {
        warn(`\`watch(fn, options?)\` signature has been moved to a separate API. ` +
            `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
            `supports \`watch(source, cb, options?) signature.`);
    }
    return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
    if (!cb) {
        if (immediate !== undefined) {
            warn(`watch() "immediate" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
        if (deep !== undefined) {
            warn(`watch() "deep" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
    }
    const warnInvalidSource = (s) => {
        warn(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, ` +
            `a reactive object, or an array of these types.`);
    };
    const instance = getCurrentScope() === (currentInstance === null || currentInstance === void 0 ? void 0 : currentInstance.scope) ? currentInstance : null;
    // const instance = currentInstance
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef(source)) {
        getter = () => source.value;
        forceTrigger = isShallow$1(source);
    }
    else if (isReactive(source)) {
        getter = () => source;
        deep = true;
    }
    else if (isArray(source)) {
        isMultiSource = true;
        forceTrigger = source.some(s => isReactive(s) || isShallow$1(s));
        getter = () => source.map(s => {
            if (isRef(s)) {
                return s.value;
            }
            else if (isReactive(s)) {
                return traverse(s);
            }
            else if (isFunction(s)) {
                return callWithErrorHandling(s, instance, 2 /* ErrorCodes.WATCH_GETTER */);
            }
            else {
                warnInvalidSource(s);
            }
        });
    }
    else if (isFunction(source)) {
        if (cb) {
            // getter with cb
            getter = () => callWithErrorHandling(source, instance, 2 /* ErrorCodes.WATCH_GETTER */);
        }
        else {
            // no cb -> simple effect
            getter = () => {
                if (instance && instance.isUnmounted) {
                    return;
                }
                if (cleanup) {
                    cleanup();
                }
                return callWithAsyncErrorHandling(source, instance, 3 /* ErrorCodes.WATCH_CALLBACK */, [onCleanup]);
            };
        }
    }
    else {
        getter = NOOP;
        warnInvalidSource(source);
    }
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    let cleanup;
    let onCleanup = (fn) => {
        cleanup = effect.onStop = () => {
            callWithErrorHandling(fn, instance, 4 /* ErrorCodes.WATCH_CLEANUP */);
        };
    };
    // in SSR there is no need to setup an actual effect, and it should be noop
    // unless it's eager or sync flush
    let ssrCleanup;
    if (isInSSRComponentSetup) {
        // we will also not call the invalidate callback (+ runner is not set up)
        onCleanup = NOOP;
        if (!cb) {
            getter();
        }
        else if (immediate) {
            callWithAsyncErrorHandling(cb, instance, 3 /* ErrorCodes.WATCH_CALLBACK */, [
                getter(),
                isMultiSource ? [] : undefined,
                onCleanup
            ]);
        }
        if (flush === 'sync') {
            const ctx = useSSRContext();
            ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
        }
        else {
            return NOOP;
        }
    }
    let oldValue = isMultiSource
        ? new Array(source.length).fill(INITIAL_WATCHER_VALUE)
        : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!effect.active) {
            return;
        }
        if (cb) {
            // watch(source, cb)
            const newValue = effect.run();
            if (deep ||
                forceTrigger ||
                (isMultiSource
                    ? newValue.some((v, i) => hasChanged(v, oldValue[i]))
                    : hasChanged(newValue, oldValue)) ||
                (false  )) {
                // cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                callWithAsyncErrorHandling(cb, instance, 3 /* ErrorCodes.WATCH_CALLBACK */, [
                    newValue,
                    // pass undefined as the old value when it's changed for the first time
                    oldValue === INITIAL_WATCHER_VALUE
                        ? undefined
                        : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE
                            ? []
                            : oldValue,
                    onCleanup
                ]);
                oldValue = newValue;
            }
        }
        else {
            // watchEffect
            effect.run();
        }
    };
    // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)
    job.allowRecurse = !!cb;
    let scheduler;
    if (flush === 'sync') {
        scheduler = job; // the scheduler function gets called directly
    }
    else if (flush === 'post') {
        scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
    }
    else {
        // default: 'pre'
        job.pre = true;
        if (instance)
            job.id = instance.uid;
        scheduler = () => queueJob(job);
    }
    const effect = new ReactiveEffect(getter, scheduler);
    {
        effect.onTrack = onTrack;
        effect.onTrigger = onTrigger;
    }
    // initial run
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = effect.run();
        }
    }
    else if (flush === 'post') {
        queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
    }
    else {
        effect.run();
    }
    const unwatch = () => {
        effect.stop();
        if (instance && instance.scope) {
            remove(instance.scope.effects, effect);
        }
    };
    if (ssrCleanup)
        ssrCleanup.push(unwatch);
    return unwatch;
}
// this.$watch
function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = isString(source)
        ? source.includes('.')
            ? createPathGetter(publicThis, source)
            : () => publicThis[source]
        : source.bind(publicThis, publicThis);
    let cb;
    if (isFunction(value)) {
        cb = value;
    }
    else {
        cb = value.handler;
        options = value;
    }
    const cur = currentInstance;
    setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    if (cur) {
        setCurrentInstance(cur);
    }
    else {
        unsetCurrentInstance();
    }
    return res;
}
function createPathGetter(ctx, path) {
    const segments = path.split('.');
    return () => {
        let cur = ctx;
        for (let i = 0; i < segments.length && cur; i++) {
            cur = cur[segments[i]];
        }
        return cur;
    };
}
function traverse(value, seen) {
    if (!isObject(value) || value["__v_skip" /* ReactiveFlags.SKIP */]) {
        return value;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (isRef(value)) {
        traverse(value.value, seen);
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    else if (isSet(value) || isMap(value)) {
        value.forEach((v) => {
            traverse(v, seen);
        });
    }
    else if (isPlainObject(value)) {
        for (const key in value) {
            traverse(value[key], seen);
        }
    }
    return value;
}

// implementation, close to no-op
function defineComponent(options) {
    return isFunction(options) ? { setup: options, name: options.name } : options;
}

const isAsyncWrapper = (i) => !!i.type.__asyncLoader;

const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a" /* LifecycleHooks.ACTIVATED */, target);
}
function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da" /* LifecycleHooks.DEACTIVATED */, target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
    // cache the deactivate branch check wrapper for injected hooks so the same
    // hook can be properly deduped by the scheduler. "__wdc" stands for "with
    // deactivation check".
    const wrappedHook = hook.__wdc ||
        (hook.__wdc = () => {
            // only fire the hook if the target instance is NOT in a deactivated branch.
            let current = target;
            while (current) {
                if (current.isDeactivated) {
                    return;
                }
                current = current.parent;
            }
            return hook();
        });
    injectHook(type, wrappedHook, target);
    // In addition to registering it on the target instance, we walk up the parent
    // chain and register it on all ancestor instances that are keep-alive roots.
    // This avoids the need to walk the entire component tree when invoking these
    // hooks, and more importantly, avoids the need to track child components in
    // arrays.
    if (target) {
        let current = target.parent;
        while (current && current.parent) {
            if (isKeepAlive(current.parent.vnode)) {
                injectToKeepAliveRoot(wrappedHook, type, target, current);
            }
            current = current.parent;
        }
    }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    // injectHook wraps the original for error handling, so make sure to remove
    // the wrapped version.
    const injected = injectHook(type, hook, keepAliveRoot, true /* prepend */);
    onUnmounted(() => {
        remove(keepAliveRoot[type], injected);
    }, target);
}

function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
        const hooks = target[type] || (target[type] = []);
        // cache the error handling wrapper for injected hooks so the same hook
        // can be properly deduped by the scheduler. "__weh" stands for "with error
        // handling".
        const wrappedHook = hook.__weh ||
            (hook.__weh = (...args) => {
                if (target.isUnmounted) {
                    return;
                }
                // disable tracking inside all lifecycle hooks
                // since they can potentially be called inside effects.
                pauseTracking();
                // Set currentInstance during hook invocation.
                // This assumes the hook does not synchronously trigger other hooks, which
                // can only be false when the user does something really funky.
                setCurrentInstance(target);
                const res = callWithAsyncErrorHandling(hook, target, type, args);
                unsetCurrentInstance();
                resetTracking();
                return res;
            });
        if (prepend) {
            hooks.unshift(wrappedHook);
        }
        else {
            hooks.push(wrappedHook);
        }
        return wrappedHook;
    }
    else {
        const apiName = toHandlerKey(ErrorTypeStrings[type].replace(/ hook$/, ''));
        warn(`${apiName} is called when there is no active component instance to be ` +
            `associated with. ` +
            `Lifecycle injection APIs can only be used during execution of setup().` +
            (` If you are using async setup(), make sure to register lifecycle ` +
                    `hooks before the first await statement.`
                ));
    }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => 
// post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
(!isInSSRComponentSetup || lifecycle === "sp" /* LifecycleHooks.SERVER_PREFETCH */) &&
    injectHook(lifecycle, (...args) => hook(...args), target);
const onBeforeMount = createHook("bm" /* LifecycleHooks.BEFORE_MOUNT */);
const onMounted = createHook("m" /* LifecycleHooks.MOUNTED */);
const onBeforeUpdate = createHook("bu" /* LifecycleHooks.BEFORE_UPDATE */);
const onUpdated = createHook("u" /* LifecycleHooks.UPDATED */);
const onBeforeUnmount = createHook("bum" /* LifecycleHooks.BEFORE_UNMOUNT */);
const onUnmounted = createHook("um" /* LifecycleHooks.UNMOUNTED */);
const onServerPrefetch = createHook("sp" /* LifecycleHooks.SERVER_PREFETCH */);
const onRenderTriggered = createHook("rtg" /* LifecycleHooks.RENDER_TRIGGERED */);
const onRenderTracked = createHook("rtc" /* LifecycleHooks.RENDER_TRACKED */);
function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec" /* LifecycleHooks.ERROR_CAPTURED */, hook, target);
}

/**
Runtime helper for applying directives to a vnode. Example usage:

const comp = resolveComponent('comp')
const foo = resolveDirective('foo')
const bar = resolveDirective('bar')

return withDirectives(h(comp), [
  [foo, this.x],
  [bar, this.y]
])
*/
function validateDirectiveName(name) {
    if (isBuiltInDirective(name)) {
        warn('Do not use built-in directive ids as custom directive id: ' + name);
    }
}
/**
 * Adds directives to a VNode.
 */
function withDirectives(vnode, directives) {
    const internalInstance = currentRenderingInstance;
    if (internalInstance === null) {
        warn(`withDirectives can only be used inside render functions.`);
        return vnode;
    }
    const instance = getExposeProxy(internalInstance) ||
        internalInstance.proxy;
    const bindings = vnode.dirs || (vnode.dirs = []);
    for (let i = 0; i < directives.length; i++) {
        let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
        if (dir) {
            if (isFunction(dir)) {
                dir = {
                    mounted: dir,
                    updated: dir
                };
            }
            if (dir.deep) {
                traverse(value);
            }
            bindings.push({
                dir,
                instance,
                value,
                oldValue: void 0,
                arg,
                modifiers
            });
        }
    }
    return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        if (oldBindings) {
            binding.oldValue = oldBindings[i].value;
        }
        let hook = binding.dir[name];
        if (hook) {
            // disable tracking inside all lifecycle hooks
            // since they can potentially be called inside effects.
            pauseTracking();
            callWithAsyncErrorHandling(hook, instance, 8 /* ErrorCodes.DIRECTIVE_HOOK */, [
                vnode.el,
                binding,
                vnode,
                prevVNode
            ]);
            resetTracking();
        }
    }
}
const NULL_DYNAMIC_COMPONENT = Symbol();

/**
 * #2437 In Vue 3, functional components do not have a public instance proxy but
 * they exist in the internal parent chain. For code that relies on traversing
 * public $parent chains, skip functional ones and go to the parent instead.
 */
const getPublicInstance = (i) => {
    if (!i)
        return null;
    if (isStatefulComponent(i))
        return getExposeProxy(i) || i.proxy;
    return getPublicInstance(i.parent);
};
const publicPropertiesMap = 
// Move PURE marker to new line to workaround compiler discarding it
// due to type annotation
/*#__PURE__*/ extend(Object.create(null), {
    $: i => i,
    $el: i => i.vnode.el,
    $data: i => i.data,
    $props: i => (shallowReadonly(i.props) ),
    $attrs: i => (shallowReadonly(i.attrs) ),
    $slots: i => (shallowReadonly(i.slots) ),
    $refs: i => (shallowReadonly(i.refs) ),
    $parent: i => getPublicInstance(i.parent),
    $root: i => getPublicInstance(i.root),
    $emit: i => i.emit,
    $options: i => (resolveMergedOptions(i) ),
    $forceUpdate: i => i.f || (i.f = () => queueJob(i.update)),
    $nextTick: i => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: i => (instanceWatch.bind(i) )
});
const isReservedPrefix = (key) => key === '_' || key === '$';
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
        // for internal formatters to know that this is a Vue instance
        if (key === '__isVue') {
            return true;
        }
        // data / props / ctx
        // This getter gets called for every property access on the render context
        // during render and is a major hotspot. The most expensive part of this
        // is the multiple hasOwn() calls. It's much faster to do a simple property
        // access on a plain object, so we use an accessCache object (with null
        // prototype) to memoize what access type a key corresponds to.
        let normalizedProps;
        if (key[0] !== '$') {
            const n = accessCache[key];
            if (n !== undefined) {
                switch (n) {
                    case 1 /* AccessTypes.SETUP */:
                        return setupState[key];
                    case 2 /* AccessTypes.DATA */:
                        return data[key];
                    case 4 /* AccessTypes.CONTEXT */:
                        return ctx[key];
                    case 3 /* AccessTypes.PROPS */:
                        return props[key];
                    // default: just fallthrough
                }
            }
            else if (hasSetupBinding(setupState, key)) {
                accessCache[key] = 1 /* AccessTypes.SETUP */;
                return setupState[key];
            }
            else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
                accessCache[key] = 2 /* AccessTypes.DATA */;
                return data[key];
            }
            else if (
            // only cache other properties when instance has declared (thus stable)
            // props
            (normalizedProps = instance.propsOptions[0]) &&
                hasOwn(normalizedProps, key)) {
                accessCache[key] = 3 /* AccessTypes.PROPS */;
                return props[key];
            }
            else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
                accessCache[key] = 4 /* AccessTypes.CONTEXT */;
                return ctx[key];
            }
            else if (shouldCacheAccess) {
                accessCache[key] = 0 /* AccessTypes.OTHER */;
            }
        }
        const publicGetter = publicPropertiesMap[key];
        let cssModule, globalProperties;
        // public $xxx properties
        if (publicGetter) {
            if (key === '$attrs') {
                track(instance, "get" /* TrackOpTypes.GET */, key);
                markAttrsAccessed();
            }
            return publicGetter(instance);
        }
        else if (
        // css module (injected by vue-loader)
        (cssModule = type.__cssModules) &&
            (cssModule = cssModule[key])) {
            return cssModule;
        }
        else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
            // user may set custom properties to `this` that start with `$`
            accessCache[key] = 4 /* AccessTypes.CONTEXT */;
            return ctx[key];
        }
        else if (
        // global properties
        ((globalProperties = appContext.config.globalProperties),
            hasOwn(globalProperties, key))) {
            {
                return globalProperties[key];
            }
        }
        else if (currentRenderingInstance &&
            (!isString(key) ||
                // #1091 avoid internal isRef/isVNode checks on component instance leading
                // to infinite warning loop
                key.indexOf('__v') !== 0)) {
            if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
                warn(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved ` +
                    `character ("$" or "_") and is not proxied on the render context.`);
            }
            else if (instance === currentRenderingInstance) {
                warn(`Property ${JSON.stringify(key)} was accessed during render ` +
                    `but is not defined on instance.`);
            }
        }
    },
    set({ _: instance }, key, value) {
        const { data, setupState, ctx } = instance;
        if (hasSetupBinding(setupState, key)) {
            setupState[key] = value;
            return true;
        }
        else if (setupState.__isScriptSetup &&
            hasOwn(setupState, key)) {
            warn(`Cannot mutate <script setup> binding "${key}" from Options API.`);
            return false;
        }
        else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
            data[key] = value;
            return true;
        }
        else if (hasOwn(instance.props, key)) {
            warn(`Attempting to mutate prop "${key}". Props are readonly.`);
            return false;
        }
        if (key[0] === '$' && key.slice(1) in instance) {
            warn(`Attempting to mutate public property "${key}". ` +
                    `Properties starting with $ are reserved and readonly.`);
            return false;
        }
        else {
            if (key in instance.appContext.config.globalProperties) {
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    value
                });
            }
            else {
                ctx[key] = value;
            }
        }
        return true;
    },
    has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
        let normalizedProps;
        return (!!accessCache[key] ||
            (data !== EMPTY_OBJ && hasOwn(data, key)) ||
            hasSetupBinding(setupState, key) ||
            ((normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key)) ||
            hasOwn(ctx, key) ||
            hasOwn(publicPropertiesMap, key) ||
            hasOwn(appContext.config.globalProperties, key));
    },
    defineProperty(target, key, descriptor) {
        if (descriptor.get != null) {
            // invalidate key cache of a getter based property #5417
            target._.accessCache[key] = 0;
        }
        else if (hasOwn(descriptor, 'value')) {
            this.set(target, key, descriptor.value, null);
        }
        return Reflect.defineProperty(target, key, descriptor);
    }
};
{
    PublicInstanceProxyHandlers.ownKeys = (target) => {
        warn(`Avoid app logic that relies on enumerating keys on a component instance. ` +
            `The keys will be empty in production mode to avoid performance overhead.`);
        return Reflect.ownKeys(target);
    };
}
// dev only
// In dev mode, the proxy target exposes the same properties as seen on `this`
// for easier console inspection. In prod mode it will be an empty object so
// these properties definitions can be skipped.
function createDevRenderContext(instance) {
    const target = {};
    // expose internal instance for proxy handlers
    Object.defineProperty(target, `_`, {
        configurable: true,
        enumerable: false,
        get: () => instance
    });
    // expose public properties
    Object.keys(publicPropertiesMap).forEach(key => {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: false,
            get: () => publicPropertiesMap[key](instance),
            // intercepted by the proxy so no need for implementation,
            // but needed to prevent set errors
            set: NOOP
        });
    });
    return target;
}
// dev only
function exposePropsOnRenderContext(instance) {
    const { ctx, propsOptions: [propsOptions] } = instance;
    if (propsOptions) {
        Object.keys(propsOptions).forEach(key => {
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => instance.props[key],
                set: NOOP
            });
        });
    }
}
// dev only
function exposeSetupStateOnRenderContext(instance) {
    const { ctx, setupState } = instance;
    Object.keys(toRaw(setupState)).forEach(key => {
        if (!setupState.__isScriptSetup) {
            if (isReservedPrefix(key[0])) {
                warn(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" ` +
                    `which are reserved prefixes for Vue internals.`);
                return;
            }
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => setupState[key],
                set: NOOP
            });
        }
    });
}

function createDuplicateChecker() {
    const cache = Object.create(null);
    return (type, key) => {
        if (cache[key]) {
            warn(`${type} property "${key}" is already defined in ${cache[key]}.`);
        }
        else {
            cache[key] = type;
        }
    };
}
let shouldCacheAccess = true;
function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx = instance.ctx;
    // do not cache property access on public proxy during state initialization
    shouldCacheAccess = false;
    // call beforeCreate first before accessing other options since
    // the hook may mutate resolved options (#2791)
    if (options.beforeCreate) {
        callHook(options.beforeCreate, instance, "bc" /* LifecycleHooks.BEFORE_CREATE */);
    }
    const { 
    // state
    data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, 
    // lifecycle
    created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, 
    // public API
    expose, inheritAttrs, 
    // assets
    components, directives, filters } = options;
    const checkDuplicateProperties = createDuplicateChecker() ;
    {
        const [propsOptions] = instance.propsOptions;
        if (propsOptions) {
            for (const key in propsOptions) {
                checkDuplicateProperties("Props" /* OptionTypes.PROPS */, key);
            }
        }
    }
    // options initialization order (to be consistent with Vue 2):
    // - props (already done outside of this function)
    // - inject
    // - methods
    // - data (deferred since it relies on `this` access)
    // - computed
    // - watch (deferred since it relies on `this` access)
    if (injectOptions) {
        resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
    }
    if (methods) {
        for (const key in methods) {
            const methodHandler = methods[key];
            if (isFunction(methodHandler)) {
                // In dev mode, we use the `createRenderContext` function to define
                // methods to the proxy target, and those are read-only but
                // reconfigurable, so it needs to be redefined here
                {
                    Object.defineProperty(ctx, key, {
                        value: methodHandler.bind(publicThis),
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
                }
                {
                    checkDuplicateProperties("Methods" /* OptionTypes.METHODS */, key);
                }
            }
            else {
                warn(`Method "${key}" has type "${typeof methodHandler}" in the component definition. ` +
                    `Did you reference the function correctly?`);
            }
        }
    }
    if (dataOptions) {
        if (!isFunction(dataOptions)) {
            warn(`The data option must be a function. ` +
                `Plain object usage is no longer supported.`);
        }
        const data = dataOptions.call(publicThis, publicThis);
        if (isPromise(data)) {
            warn(`data() returned a Promise - note data() cannot be async; If you ` +
                `intend to perform data fetching before component renders, use ` +
                `async setup() + <Suspense>.`);
        }
        if (!isObject(data)) {
            warn(`data() should return an object.`);
        }
        else {
            instance.data = reactive(data);
            {
                for (const key in data) {
                    checkDuplicateProperties("Data" /* OptionTypes.DATA */, key);
                    // expose data on ctx during dev
                    if (!isReservedPrefix(key[0])) {
                        Object.defineProperty(ctx, key, {
                            configurable: true,
                            enumerable: true,
                            get: () => data[key],
                            set: NOOP
                        });
                    }
                }
            }
        }
    }
    // state initialization complete at this point - start caching access
    shouldCacheAccess = true;
    if (computedOptions) {
        for (const key in computedOptions) {
            const opt = computedOptions[key];
            const get = isFunction(opt)
                ? opt.bind(publicThis, publicThis)
                : isFunction(opt.get)
                    ? opt.get.bind(publicThis, publicThis)
                    : NOOP;
            if (get === NOOP) {
                warn(`Computed property "${key}" has no getter.`);
            }
            const set = !isFunction(opt) && isFunction(opt.set)
                ? opt.set.bind(publicThis)
                : () => {
                        warn(`Write operation failed: computed property "${key}" is readonly.`);
                    }
                    ;
            const c = computed({
                get,
                set
            });
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => c.value,
                set: v => (c.value = v)
            });
            {
                checkDuplicateProperties("Computed" /* OptionTypes.COMPUTED */, key);
            }
        }
    }
    if (watchOptions) {
        for (const key in watchOptions) {
            createWatcher(watchOptions[key], ctx, publicThis, key);
        }
    }
    if (provideOptions) {
        const provides = isFunction(provideOptions)
            ? provideOptions.call(publicThis)
            : provideOptions;
        Reflect.ownKeys(provides).forEach(key => {
            provide(key, provides[key]);
        });
    }
    if (created) {
        callHook(created, instance, "c" /* LifecycleHooks.CREATED */);
    }
    function registerLifecycleHook(register, hook) {
        if (isArray(hook)) {
            hook.forEach(_hook => register(_hook.bind(publicThis)));
        }
        else if (hook) {
            register(hook.bind(publicThis));
        }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if (isArray(expose)) {
        if (expose.length) {
            const exposed = instance.exposed || (instance.exposed = {});
            expose.forEach(key => {
                Object.defineProperty(exposed, key, {
                    get: () => publicThis[key],
                    set: val => (publicThis[key] = val)
                });
            });
        }
        else if (!instance.exposed) {
            instance.exposed = {};
        }
    }
    // options that are handled when creating the instance but also need to be
    // applied from mixins
    if (render && instance.render === NOOP) {
        instance.render = render;
    }
    if (inheritAttrs != null) {
        instance.inheritAttrs = inheritAttrs;
    }
    // asset options.
    if (components)
        instance.components = components;
    if (directives)
        instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
    if (isArray(injectOptions)) {
        injectOptions = normalizeInject(injectOptions);
    }
    for (const key in injectOptions) {
        const opt = injectOptions[key];
        let injected;
        if (isObject(opt)) {
            if ('default' in opt) {
                injected = inject(opt.from || key, opt.default, true /* treat default function as factory */);
            }
            else {
                injected = inject(opt.from || key);
            }
        }
        else {
            injected = inject(opt);
        }
        if (isRef(injected)) {
            // TODO remove the check in 3.3
            if (unwrapRef) {
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    get: () => injected.value,
                    set: v => (injected.value = v)
                });
            }
            else {
                {
                    warn(`injected property "${key}" is a ref and will be auto-unwrapped ` +
                        `and no longer needs \`.value\` in the next minor release. ` +
                        `To opt-in to the new behavior now, ` +
                        `set \`app.config.unwrapInjectedRef = true\` (this config is ` +
                        `temporary and will not be needed in the future.)`);
                }
                ctx[key] = injected;
            }
        }
        else {
            ctx[key] = injected;
        }
        {
            checkDuplicateProperties("Inject" /* OptionTypes.INJECT */, key);
        }
    }
}
function callHook(hook, instance, type) {
    callWithAsyncErrorHandling(isArray(hook)
        ? hook.map(h => h.bind(instance.proxy))
        : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
    const getter = key.includes('.')
        ? createPathGetter(publicThis, key)
        : () => publicThis[key];
    if (isString(raw)) {
        const handler = ctx[raw];
        if (isFunction(handler)) {
            watch(getter, handler);
        }
        else {
            warn(`Invalid watch handler specified by key "${raw}"`, handler);
        }
    }
    else if (isFunction(raw)) {
        watch(getter, raw.bind(publicThis));
    }
    else if (isObject(raw)) {
        if (isArray(raw)) {
            raw.forEach(r => createWatcher(r, ctx, publicThis, key));
        }
        else {
            const handler = isFunction(raw.handler)
                ? raw.handler.bind(publicThis)
                : ctx[raw.handler];
            if (isFunction(handler)) {
                watch(getter, handler, raw);
            }
            else {
                warn(`Invalid watch handler specified by key "${raw.handler}"`, handler);
            }
        }
    }
    else {
        warn(`Invalid watch option: "${key}"`, raw);
    }
}
/**
 * Resolve merged options and cache it on the component.
 * This is done only once per-component since the merging does not involve
 * instances.
 */
function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) {
        resolved = cached;
    }
    else if (!globalMixins.length && !mixins && !extendsOptions) {
        {
            resolved = base;
        }
    }
    else {
        resolved = {};
        if (globalMixins.length) {
            globalMixins.forEach(m => mergeOptions(resolved, m, optionMergeStrategies, true));
        }
        mergeOptions(resolved, base, optionMergeStrategies);
    }
    if (isObject(base)) {
        cache.set(base, resolved);
    }
    return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) {
        mergeOptions(to, extendsOptions, strats, true);
    }
    if (mixins) {
        mixins.forEach((m) => mergeOptions(to, m, strats, true));
    }
    for (const key in from) {
        if (asMixin && key === 'expose') {
            warn(`"expose" option is ignored when declared in mixins or extends. ` +
                    `It should only be declared in the base component itself.`);
        }
        else {
            const strat = internalOptionMergeStrats[key] || (strats && strats[key]);
            to[key] = strat ? strat(to[key], from[key]) : from[key];
        }
    }
    return to;
}
const internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeObjectOptions,
    emits: mergeObjectOptions,
    // objects
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    // lifecycle
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    // assets
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    // watch
    watch: mergeWatchOptions,
    // provide / inject
    provide: mergeDataFn,
    inject: mergeInject
};
function mergeDataFn(to, from) {
    if (!from) {
        return to;
    }
    if (!to) {
        return from;
    }
    return function mergedDataFn() {
        return (extend)(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
    };
}
function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
    if (isArray(raw)) {
        const res = {};
        for (let i = 0; i < raw.length; i++) {
            res[raw[i]] = raw[i];
        }
        return res;
    }
    return raw;
}
function mergeAsArray(to, from) {
    return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
    return to ? extend(extend(Object.create(null), to), from) : from;
}
function mergeWatchOptions(to, from) {
    if (!to)
        return from;
    if (!from)
        return to;
    const merged = extend(Object.create(null), to);
    for (const key in from) {
        merged[key] = mergeAsArray(to[key], from[key]);
    }
    return merged;
}

function initProps(instance, rawProps, isStateful, // result of bitwise flag comparison
isSSR = false) {
    const props = {};
    const attrs = {};
    def(attrs, InternalObjectKey, 1);
    instance.propsDefaults = Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    // ensure all declared prop keys are present
    for (const key in instance.propsOptions[0]) {
        if (!(key in props)) {
            props[key] = undefined;
        }
    }
    // validation
    {
        validateProps(rawProps || {}, props, instance);
    }
    if (isStateful) {
        // stateful
        instance.props = isSSR ? props : shallowReactive(props);
    }
    else {
        if (!instance.type.props) {
            // functional w/ optional props, props === attrs
            instance.props = attrs;
        }
        else {
            // functional w/ declared props
            instance.props = props;
        }
    }
    instance.attrs = attrs;
}
function isInHmrContext(instance) {
    while (instance) {
        if (instance.type.__hmrId)
            return true;
        instance = instance.parent;
    }
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const { props, attrs, vnode: { patchFlag } } = instance;
    const rawCurrentProps = toRaw(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(isInHmrContext(instance)) &&
        (optimized || patchFlag > 0) &&
        !(patchFlag & 16 /* PatchFlags.FULL_PROPS */)) {
        if (patchFlag & 8 /* PatchFlags.PROPS */) {
            // Compiler-generated props & no keys change, just set the updated
            // the props.
            const propsToUpdate = instance.vnode.dynamicProps;
            for (let i = 0; i < propsToUpdate.length; i++) {
                let key = propsToUpdate[i];
                // skip if the prop key is a declared emit event listener
                if (isEmitListener(instance.emitsOptions, key)) {
                    continue;
                }
                // PROPS flag guarantees rawProps to be non-null
                const value = rawProps[key];
                if (options) {
                    // attr / props separation was done on init and will be consistent
                    // in this code path, so just check if attrs have it.
                    if (hasOwn(attrs, key)) {
                        if (value !== attrs[key]) {
                            attrs[key] = value;
                            hasAttrsChanged = true;
                        }
                    }
                    else {
                        const camelizedKey = camelize(key);
                        props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false /* isAbsent */);
                    }
                }
                else {
                    if (value !== attrs[key]) {
                        attrs[key] = value;
                        hasAttrsChanged = true;
                    }
                }
            }
        }
    }
    else {
        // full props update.
        if (setFullProps(instance, rawProps, props, attrs)) {
            hasAttrsChanged = true;
        }
        // in case of dynamic props, check if we need to delete keys from
        // the props object
        let kebabKey;
        for (const key in rawCurrentProps) {
            if (!rawProps ||
                // for camelCase
                (!hasOwn(rawProps, key) &&
                    // it's possible the original props was passed in as kebab-case
                    // and converted to camelCase (#955)
                    ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey)))) {
                if (options) {
                    if (rawPrevProps &&
                        // for camelCase
                        (rawPrevProps[key] !== undefined ||
                            // for kebab-case
                            rawPrevProps[kebabKey] !== undefined)) {
                        props[key] = resolvePropValue(options, rawCurrentProps, key, undefined, instance, true /* isAbsent */);
                    }
                }
                else {
                    delete props[key];
                }
            }
        }
        // in the case of functional component w/o props declaration, props and
        // attrs point to the same object so it should already have been updated.
        if (attrs !== rawCurrentProps) {
            for (const key in attrs) {
                if (!rawProps ||
                    (!hasOwn(rawProps, key) &&
                        (!false ))) {
                    delete attrs[key];
                    hasAttrsChanged = true;
                }
            }
        }
    }
    // trigger updates for $attrs in case it's used in component slots
    if (hasAttrsChanged) {
        trigger(instance, "set" /* TriggerOpTypes.SET */, '$attrs');
    }
    {
        validateProps(rawProps || {}, props, instance);
    }
}
function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) {
        for (let key in rawProps) {
            // key, ref are reserved and never passed down
            if (isReservedProp(key)) {
                continue;
            }
            const value = rawProps[key];
            // prop option names are camelized during normalization, so to support
            // kebab -> camel conversion here we need to camelize the key.
            let camelKey;
            if (options && hasOwn(options, (camelKey = camelize(key)))) {
                if (!needCastKeys || !needCastKeys.includes(camelKey)) {
                    props[camelKey] = value;
                }
                else {
                    (rawCastValues || (rawCastValues = {}))[camelKey] = value;
                }
            }
            else if (!isEmitListener(instance.emitsOptions, key)) {
                if (!(key in attrs) || value !== attrs[key]) {
                    attrs[key] = value;
                    hasAttrsChanged = true;
                }
            }
        }
    }
    if (needCastKeys) {
        const rawCurrentProps = toRaw(props);
        const castValues = rawCastValues || EMPTY_OBJ;
        for (let i = 0; i < needCastKeys.length; i++) {
            const key = needCastKeys[i];
            props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
        }
    }
    return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
        const hasDefault = hasOwn(opt, 'default');
        // default values
        if (hasDefault && value === undefined) {
            const defaultValue = opt.default;
            if (opt.type !== Function && isFunction(defaultValue)) {
                const { propsDefaults } = instance;
                if (key in propsDefaults) {
                    value = propsDefaults[key];
                }
                else {
                    setCurrentInstance(instance);
                    value = propsDefaults[key] = defaultValue.call(null, props);
                    unsetCurrentInstance();
                }
            }
            else {
                value = defaultValue;
            }
        }
        // boolean casting
        if (opt[0 /* BooleanFlags.shouldCast */]) {
            if (isAbsent && !hasDefault) {
                value = false;
            }
            else if (opt[1 /* BooleanFlags.shouldCastTrue */] &&
                (value === '' || value === hyphenate(key))) {
                value = true;
            }
        }
    }
    return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) {
        return cached;
    }
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    // apply mixin/extends props
    let hasExtends = false;
    if (!isFunction(comp)) {
        const extendProps = (raw) => {
            hasExtends = true;
            const [props, keys] = normalizePropsOptions(raw, appContext, true);
            extend(normalized, props);
            if (keys)
                needCastKeys.push(...keys);
        };
        if (!asMixin && appContext.mixins.length) {
            appContext.mixins.forEach(extendProps);
        }
        if (comp.extends) {
            extendProps(comp.extends);
        }
        if (comp.mixins) {
            comp.mixins.forEach(extendProps);
        }
    }
    if (!raw && !hasExtends) {
        if (isObject(comp)) {
            cache.set(comp, EMPTY_ARR);
        }
        return EMPTY_ARR;
    }
    if (isArray(raw)) {
        for (let i = 0; i < raw.length; i++) {
            if (!isString(raw[i])) {
                warn(`props must be strings when using array syntax.`, raw[i]);
            }
            const normalizedKey = camelize(raw[i]);
            if (validatePropName(normalizedKey)) {
                normalized[normalizedKey] = EMPTY_OBJ;
            }
        }
    }
    else if (raw) {
        if (!isObject(raw)) {
            warn(`invalid props options`, raw);
        }
        for (const key in raw) {
            const normalizedKey = camelize(key);
            if (validatePropName(normalizedKey)) {
                const opt = raw[key];
                const prop = (normalized[normalizedKey] =
                    isArray(opt) || isFunction(opt) ? { type: opt } : Object.assign({}, opt));
                if (prop) {
                    const booleanIndex = getTypeIndex(Boolean, prop.type);
                    const stringIndex = getTypeIndex(String, prop.type);
                    prop[0 /* BooleanFlags.shouldCast */] = booleanIndex > -1;
                    prop[1 /* BooleanFlags.shouldCastTrue */] =
                        stringIndex < 0 || booleanIndex < stringIndex;
                    // if the prop needs boolean casting or default value
                    if (booleanIndex > -1 || hasOwn(prop, 'default')) {
                        needCastKeys.push(normalizedKey);
                    }
                }
            }
        }
    }
    const res = [normalized, needCastKeys];
    if (isObject(comp)) {
        cache.set(comp, res);
    }
    return res;
}
function validatePropName(key) {
    if (key[0] !== '$') {
        return true;
    }
    else {
        warn(`Invalid prop name: "${key}" is a reserved property.`);
    }
    return false;
}
// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor) {
    const match = ctor && ctor.toString().match(/^\s*(function|class) (\w+)/);
    return match ? match[2] : ctor === null ? 'null' : '';
}
function isSameType(a, b) {
    return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
    if (isArray(expectedTypes)) {
        return expectedTypes.findIndex(t => isSameType(t, type));
    }
    else if (isFunction(expectedTypes)) {
        return isSameType(expectedTypes, type) ? 0 : -1;
    }
    return -1;
}
/**
 * dev only
 */
function validateProps(rawProps, props, instance) {
    const resolvedValues = toRaw(props);
    const options = instance.propsOptions[0];
    for (const key in options) {
        let opt = options[key];
        if (opt == null)
            continue;
        validateProp(key, resolvedValues[key], opt, !hasOwn(rawProps, key) && !hasOwn(rawProps, hyphenate(key)));
    }
}
/**
 * dev only
 */
function validateProp(name, value, prop, isAbsent) {
    const { type, required, validator } = prop;
    // required!
    if (required && isAbsent) {
        warn('Missing required prop: "' + name + '"');
        return;
    }
    // missing but optional
    if (value == null && !prop.required) {
        return;
    }
    // type check
    if (type != null && type !== true) {
        let isValid = false;
        const types = isArray(type) ? type : [type];
        const expectedTypes = [];
        // value is valid as long as one of the specified types match
        for (let i = 0; i < types.length && !isValid; i++) {
            const { valid, expectedType } = assertType(value, types[i]);
            expectedTypes.push(expectedType || '');
            isValid = valid;
        }
        if (!isValid) {
            warn(getInvalidTypeMessage(name, value, expectedTypes));
            return;
        }
    }
    // custom validator
    if (validator && !validator(value)) {
        warn('Invalid prop: custom validator check failed for prop "' + name + '".');
    }
}
const isSimpleType = /*#__PURE__*/ makeMap('String,Number,Boolean,Function,Symbol,BigInt');
/**
 * dev only
 */
function assertType(value, type) {
    let valid;
    const expectedType = getType(type);
    if (isSimpleType(expectedType)) {
        const t = typeof value;
        valid = t === expectedType.toLowerCase();
        // for primitive wrapper objects
        if (!valid && t === 'object') {
            valid = value instanceof type;
        }
    }
    else if (expectedType === 'Object') {
        valid = isObject(value);
    }
    else if (expectedType === 'Array') {
        valid = isArray(value);
    }
    else if (expectedType === 'null') {
        valid = value === null;
    }
    else {
        valid = value instanceof type;
    }
    return {
        valid,
        expectedType
    };
}
/**
 * dev only
 */
function getInvalidTypeMessage(name, value, expectedTypes) {
    let message = `Invalid prop: type check failed for prop "${name}".` +
        ` Expected ${expectedTypes.map(capitalize).join(' | ')}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    // check if we need to specify expected value
    if (expectedTypes.length === 1 &&
        isExplicable(expectedType) &&
        !isBoolean(expectedType, receivedType)) {
        message += ` with value ${expectedValue}`;
    }
    message += `, got ${receivedType} `;
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
        message += `with value ${receivedValue}.`;
    }
    return message;
}
/**
 * dev only
 */
function styleValue(value, type) {
    if (type === 'String') {
        return `"${value}"`;
    }
    else if (type === 'Number') {
        return `${Number(value)}`;
    }
    else {
        return `${value}`;
    }
}
/**
 * dev only
 */
function isExplicable(type) {
    const explicitTypes = ['string', 'number', 'boolean'];
    return explicitTypes.some(elem => type.toLowerCase() === elem);
}
/**
 * dev only
 */
function isBoolean(...args) {
    return args.some(elem => elem.toLowerCase() === 'boolean');
}

const isInternalKey = (key) => key[0] === '_' || key === '$stable';
const normalizeSlotValue = (value) => isArray(value)
    ? value.map(normalizeVNode)
    : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
    if (rawSlot._n) {
        // already normalized - #5353
        return rawSlot;
    }
    const normalized = withCtx((...args) => {
        if (("development" !== 'production') && currentInstance) {
            warn(`Slot "${key}" invoked outside of the render function: ` +
                `this will not track dependencies used in the slot. ` +
                `Invoke the slot function inside the render function instead.`);
        }
        return normalizeSlotValue(rawSlot(...args));
    }, ctx);
    normalized._c = false;
    return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
    const ctx = rawSlots._ctx;
    for (const key in rawSlots) {
        if (isInternalKey(key))
            continue;
        const value = rawSlots[key];
        if (isFunction(value)) {
            slots[key] = normalizeSlot(key, value, ctx);
        }
        else if (value != null) {
            {
                warn(`Non-function value encountered for slot "${key}". ` +
                    `Prefer function slots for better performance.`);
            }
            const normalized = normalizeSlotValue(value);
            slots[key] = () => normalized;
        }
    }
};
const normalizeVNodeSlots = (instance, children) => {
    if (!isKeepAlive(instance.vnode) &&
        !(false )) {
        warn(`Non-function value encountered for default slot. ` +
            `Prefer function slots for better performance.`);
    }
    const normalized = normalizeSlotValue(children);
    instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
    if (instance.vnode.shapeFlag & 32 /* ShapeFlags.SLOTS_CHILDREN */) {
        const type = children._;
        if (type) {
            // users can get the shallow readonly version of the slots object through `this.$slots`,
            // we should avoid the proxy object polluting the slots of the internal instance
            instance.slots = toRaw(children);
            // make compiler marker non-enumerable
            def(children, '_', type);
        }
        else {
            normalizeObjectSlots(children, (instance.slots = {}));
        }
    }
    else {
        instance.slots = {};
        if (children) {
            normalizeVNodeSlots(instance, children);
        }
    }
    def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = EMPTY_OBJ;
    if (vnode.shapeFlag & 32 /* ShapeFlags.SLOTS_CHILDREN */) {
        const type = children._;
        if (type) {
            // compiled slots.
            if (isHmrUpdating) {
                // Parent was HMR updated so slot content may have changed.
                // force update slots and mark instance for hmr as well
                extend(slots, children);
            }
            else if (optimized && type === 1 /* SlotFlags.STABLE */) {
                // compiled AND stable.
                // no need to update, and skip stale slots removal.
                needDeletionCheck = false;
            }
            else {
                // compiled but dynamic (v-if/v-for on slots) - update slots, but skip
                // normalization.
                extend(slots, children);
                // #2893
                // when rendering the optimized slots by manually written render function,
                // we need to delete the `slots._` flag if necessary to make subsequent updates reliable,
                // i.e. let the `renderSlot` create the bailed Fragment
                if (!optimized && type === 1 /* SlotFlags.STABLE */) {
                    delete slots._;
                }
            }
        }
        else {
            needDeletionCheck = !children.$stable;
            normalizeObjectSlots(children, slots);
        }
        deletionComparisonTarget = children;
    }
    else if (children) {
        // non slot object children (direct value) passed to a component
        normalizeVNodeSlots(instance, children);
        deletionComparisonTarget = { default: 1 };
    }
    // delete stale slots
    if (needDeletionCheck) {
        for (const key in slots) {
            if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
                delete slots[key];
            }
        }
    }
};

function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: undefined,
            warnHandler: undefined,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap(),
        propsCache: new WeakMap(),
        emitsCache: new WeakMap()
    };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        if (!isFunction(rootComponent)) {
            rootComponent = Object.assign({}, rootComponent);
        }
        if (rootProps != null && !isObject(rootProps)) {
            warn(`root props passed to app.mount() must be an object.`);
            rootProps = null;
        }
        const context = createAppContext();
        const installedPlugins = new Set();
        let isMounted = false;
        const app = (context.app = {
            _uid: uid$1++,
            _component: rootComponent,
            _props: rootProps,
            _container: null,
            _context: context,
            _instance: null,
            version,
            get config() {
                return context.config;
            },
            set config(v) {
                {
                    warn(`app.config cannot be replaced. Modify individual options instead.`);
                }
            },
            use(plugin, ...options) {
                if (installedPlugins.has(plugin)) {
                    warn(`Plugin has already been applied to target app.`);
                }
                else if (plugin && isFunction(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                }
                else if (isFunction(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                else {
                    warn(`A plugin must either be a function or an object with an "install" ` +
                        `function.`);
                }
                return app;
            },
            mixin(mixin) {
                {
                    if (!context.mixins.includes(mixin)) {
                        context.mixins.push(mixin);
                    }
                    else {
                        warn('Mixin has already been applied to target app' +
                            (mixin.name ? `: ${mixin.name}` : ''));
                    }
                }
                return app;
            },
            component(name, component) {
                {
                    validateComponentName(name, context.config);
                }
                if (!component) {
                    return context.components[name];
                }
                if (context.components[name]) {
                    warn(`Component "${name}" has already been registered in target app.`);
                }
                context.components[name] = component;
                return app;
            },
            directive(name, directive) {
                {
                    validateDirectiveName(name);
                }
                if (!directive) {
                    return context.directives[name];
                }
                if (context.directives[name]) {
                    warn(`Directive "${name}" has already been registered in target app.`);
                }
                context.directives[name] = directive;
                return app;
            },
            mount(rootContainer, isHydrate, isSVG) {
                if (!isMounted) {
                    // #5571
                    if (rootContainer.__vue_app__) {
                        warn(`There is already an app instance mounted on the host container.\n` +
                            ` If you want to mount another app on the same host container,` +
                            ` you need to unmount the previous app by calling \`app.unmount()\` first.`);
                    }
                    const vnode = createVNode(rootComponent, rootProps);
                    // store app context on the root VNode.
                    // this will be set on the root instance on initial mount.
                    vnode.appContext = context;
                    // HMR root reload
                    {
                        context.reload = () => {
                            render(cloneVNode(vnode), rootContainer, isSVG);
                        };
                    }
                    if (isHydrate && hydrate) {
                        hydrate(vnode, rootContainer);
                    }
                    else {
                        render(vnode, rootContainer, isSVG);
                    }
                    isMounted = true;
                    app._container = rootContainer;
                    rootContainer.__vue_app__ = app;
                    {
                        app._instance = vnode.component;
                        devtoolsInitApp(app, version);
                    }
                    return getExposeProxy(vnode.component) || vnode.component.proxy;
                }
                else {
                    warn(`App has already been mounted.\n` +
                        `If you want to remount the same app, move your app creation logic ` +
                        `into a factory function and create fresh app instances for each ` +
                        `mount - e.g. \`const createMyApp = () => createApp(App)\``);
                }
            },
            unmount() {
                if (isMounted) {
                    render(null, app._container);
                    {
                        app._instance = null;
                        devtoolsUnmountApp(app);
                    }
                    delete app._container.__vue_app__;
                }
                else {
                    warn(`Cannot unmount an app that is not mounted.`);
                }
            },
            provide(key, value) {
                if (key in context.provides) {
                    warn(`App already provides property with key "${String(key)}". ` +
                        `It will be overwritten with the new value.`);
                }
                context.provides[key] = value;
                return app;
            }
        });
        return app;
    };
}

/**
 * Function for handling a template ref
 */
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if (isArray(rawRef)) {
        rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
        return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) {
        // when mounting async components, nothing needs to be done,
        // because the template ref is forwarded to inner component
        return;
    }
    const refValue = vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */
        ? getExposeProxy(vnode.component) || vnode.component.proxy
        : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref } = rawRef;
    if (!owner) {
        warn(`Missing ref owner context. ref cannot be used on hoisted vnodes. ` +
            `A vnode with ref must be created inside the render function.`);
        return;
    }
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs;
    const setupState = owner.setupState;
    // dynamic ref changed. unset old ref
    if (oldRef != null && oldRef !== ref) {
        if (isString(oldRef)) {
            refs[oldRef] = null;
            if (hasOwn(setupState, oldRef)) {
                setupState[oldRef] = null;
            }
        }
        else if (isRef(oldRef)) {
            oldRef.value = null;
        }
    }
    if (isFunction(ref)) {
        callWithErrorHandling(ref, owner, 12 /* ErrorCodes.FUNCTION_REF */, [value, refs]);
    }
    else {
        const _isString = isString(ref);
        const _isRef = isRef(ref);
        if (_isString || _isRef) {
            const doSet = () => {
                if (rawRef.f) {
                    const existing = _isString
                        ? hasOwn(setupState, ref)
                            ? setupState[ref]
                            : refs[ref]
                        : ref.value;
                    if (isUnmount) {
                        isArray(existing) && remove(existing, refValue);
                    }
                    else {
                        if (!isArray(existing)) {
                            if (_isString) {
                                refs[ref] = [refValue];
                                if (hasOwn(setupState, ref)) {
                                    setupState[ref] = refs[ref];
                                }
                            }
                            else {
                                ref.value = [refValue];
                                if (rawRef.k)
                                    refs[rawRef.k] = ref.value;
                            }
                        }
                        else if (!existing.includes(refValue)) {
                            existing.push(refValue);
                        }
                    }
                }
                else if (_isString) {
                    refs[ref] = value;
                    if (hasOwn(setupState, ref)) {
                        setupState[ref] = value;
                    }
                }
                else if (_isRef) {
                    ref.value = value;
                    if (rawRef.k)
                        refs[rawRef.k] = value;
                }
                else {
                    warn('Invalid template ref type:', ref, `(${typeof ref})`);
                }
            };
            if (value) {
                doSet.id = -1;
                queuePostRenderEffect(doSet, parentSuspense);
            }
            else {
                doSet();
            }
        }
        else {
            warn('Invalid template ref type:', ref, `(${typeof ref})`);
        }
    }
}

/* eslint-disable no-restricted-globals */
let supported;
let perf;
function startMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        perf.mark(`vue-${type}-${instance.uid}`);
    }
    {
        devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
    }
}
function endMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        const startTag = `vue-${type}-${instance.uid}`;
        const endTag = startTag + `:end`;
        perf.mark(endTag);
        perf.measure(`<${formatComponentName(instance, instance.type)}> ${type}`, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
    }
    {
        devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
    }
}
function isSupported() {
    if (supported !== undefined) {
        return supported;
    }
    if (typeof window !== 'undefined' && window.performance) {
        supported = true;
        perf = window.performance;
    }
    else {
        supported = false;
    }
    return supported;
}

/**
 * This is only called in esm-bundler builds.
 * It is called when a renderer is created, in `baseCreateRenderer` so that
 * importing runtime-core is side-effects free.
 *
 * istanbul-ignore-next
 */
function initFeatureFlags() {
    const needWarn = [];
    if (needWarn.length) {
        const multi = needWarn.length > 1;
        console.warn(`Feature flag${multi ? `s` : ``} ${needWarn.join(', ')} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, ` +
            `which expects these compile-time feature flags to be globally injected ` +
            `via the bundler config in order to get better tree-shaking in the ` +
            `production bundle.\n\n` +
            `For more details, see https://link.vuejs.org/feature-flags.`);
    }
}

const queuePostRenderEffect = queueEffectWithSuspense
    ;
/**
 * The createRenderer function accepts two generic arguments:
 * HostNode and HostElement, corresponding to Node and Element types in the
 * host environment. For example, for runtime-dom, HostNode would be the DOM
 * `Node` interface and HostElement would be the DOM `Element` interface.
 *
 * Custom renderers can pass in the platform specific types like this:
 *
 * ``` js
 * const { render, createApp } = createRenderer<Node, Element>({
 *   patchProp,
 *   ...nodeOps
 * })
 * ```
 */
function createRenderer(options) {
    return baseCreateRenderer(options);
}
// implementation
function baseCreateRenderer(options, createHydrationFns) {
    // compile-time feature flags check
    {
        initFeatureFlags();
    }
    const target = getGlobalThis();
    target.__VUE__ = true;
    {
        setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
    }
    const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
    // Note: functions inside this closure should use `const xxx = () => {}`
    // style in order to prevent being inlined by minifiers.
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = isHmrUpdating ? false : !!n2.dynamicChildren) => {
        if (n1 === n2) {
            return;
        }
        // patching & not same type, unmount old tree
        if (n1 && !isSameVNodeType(n1, n2)) {
            anchor = getNextHostNode(n1);
            unmount(n1, parentComponent, parentSuspense, true);
            n1 = null;
        }
        if (n2.patchFlag === -2 /* PatchFlags.BAIL */) {
            optimized = false;
            n2.dynamicChildren = null;
        }
        const { type, ref, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor);
                break;
            case Comment:
                processCommentNode(n1, n2, container, anchor);
                break;
            case Static:
                if (n1 == null) {
                    mountStaticNode(n2, container, anchor, isSVG);
                }
                else {
                    patchStaticNode(n1, n2, container, isSVG);
                }
                break;
            case Fragment:
                processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                    processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
                    type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                }
                else if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
                    type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                }
                else {
                    warn('Invalid VNode type:', type, `(${typeof type})`);
                }
        }
        // set ref
        if (ref != null && parentComponent) {
            setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
        }
    };
    const processText = (n1, n2, container, anchor) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
        }
        else {
            const el = (n2.el = n1.el);
            if (n2.children !== n1.children) {
                hostSetText(el, n2.children);
            }
        }
    };
    const processCommentNode = (n1, n2, container, anchor) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateComment(n2.children || '')), container, anchor);
        }
        else {
            // there's no support for dynamic comments
            n2.el = n1.el;
        }
    };
    const mountStaticNode = (n2, container, anchor, isSVG) => {
        [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
    };
    /**
     * Dev / HMR only
     */
    const patchStaticNode = (n1, n2, container, isSVG) => {
        // static nodes are only patched during dev for HMR
        if (n2.children !== n1.children) {
            const anchor = hostNextSibling(n1.anchor);
            // remove existing
            removeStaticNode(n1);
            [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG);
        }
        else {
            n2.el = n1.el;
            n2.anchor = n1.anchor;
        }
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
        let next;
        while (el && el !== anchor) {
            next = hostNextSibling(el);
            hostInsert(el, container, nextSibling);
            el = next;
        }
        hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor }) => {
        let next;
        while (el && el !== anchor) {
            next = hostNextSibling(el);
            hostRemove(el);
            el = next;
        }
        hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        isSVG = isSVG || n2.type === 'svg';
        if (n1 == null) {
            mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        else {
            patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let el;
        let vnodeHook;
        const { type, props, shapeFlag, transition, dirs } = vnode;
        el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
        // mount children first, since some props may rely on child content
        // being already rendered, e.g. `<select value>`
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            hostSetElementText(el, vnode.children);
        }
        else if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== 'foreignObject', slotScopeIds, optimized);
        }
        if (dirs) {
            invokeDirectiveHook(vnode, null, parentComponent, 'created');
        }
        // scopeId
        setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
        // props
        if (props) {
            for (const key in props) {
                if (key !== 'value' && !isReservedProp(key)) {
                    hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                }
            }
            /**
             * Special case for setting value on DOM elements:
             * - it can be order-sensitive (e.g. should be set *after* min/max, #2325, #4024)
             * - it needs to be forced (#1471)
             * #2353 proposes adding another renderer option to configure this, but
             * the properties affects are so finite it is worth special casing it
             * here to reduce the complexity. (Special casing it also should not
             * affect non-DOM renderers)
             */
            if ('value' in props) {
                hostPatchProp(el, 'value', null, props.value);
            }
            if ((vnodeHook = props.onVnodeBeforeMount)) {
                invokeVNodeHook(vnodeHook, parentComponent, vnode);
            }
        }
        {
            Object.defineProperty(el, '__vnode', {
                value: vnode,
                enumerable: false
            });
            Object.defineProperty(el, '__vueParentComponent', {
                value: parentComponent,
                enumerable: false
            });
        }
        if (dirs) {
            invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount');
        }
        // #1583 For inside suspense + suspense not resolved case, enter hook should call when suspense resolved
        // #1689 For inside suspense + suspense resolved case, just call it
        const needCallTransitionHooks = (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
            transition &&
            !transition.persisted;
        if (needCallTransitionHooks) {
            transition.beforeEnter(el);
        }
        hostInsert(el, container, anchor);
        if ((vnodeHook = props && props.onVnodeMounted) ||
            needCallTransitionHooks ||
            dirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                needCallTransitionHooks && transition.enter(el);
                dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted');
            }, parentSuspense);
        }
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
        if (scopeId) {
            hostSetScopeId(el, scopeId);
        }
        if (slotScopeIds) {
            for (let i = 0; i < slotScopeIds.length; i++) {
                hostSetScopeId(el, slotScopeIds[i]);
            }
        }
        if (parentComponent) {
            let subTree = parentComponent.subTree;
            if (subTree.patchFlag > 0 &&
                subTree.patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */) {
                subTree =
                    filterSingleRoot(subTree.children) || subTree;
            }
            if (vnode === subTree) {
                const parentVNode = parentComponent.vnode;
                setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
            }
        }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
        for (let i = start; i < children.length; i++) {
            const child = (children[i] = optimized
                ? cloneIfMounted(children[i])
                : normalizeVNode(children[i]));
            patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        const el = (n2.el = n1.el);
        let { patchFlag, dynamicChildren, dirs } = n2;
        // #1426 take the old vnode's patch flag into account since user may clone a
        // compiler-generated vnode, which de-opts to FULL_PROPS
        patchFlag |= n1.patchFlag & 16 /* PatchFlags.FULL_PROPS */;
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        let vnodeHook;
        // disable recurse in beforeUpdate hooks
        parentComponent && toggleRecurse(parentComponent, false);
        if ((vnodeHook = newProps.onVnodeBeforeUpdate)) {
            invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        }
        if (dirs) {
            invokeDirectiveHook(n2, n1, parentComponent, 'beforeUpdate');
        }
        parentComponent && toggleRecurse(parentComponent, true);
        if (isHmrUpdating) {
            // HMR updated, force full diff
            patchFlag = 0;
            optimized = false;
            dynamicChildren = null;
        }
        const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
        if (dynamicChildren) {
            patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
            if (parentComponent && parentComponent.type.__hmrId) {
                traverseStaticChildren(n1, n2);
            }
        }
        else if (!optimized) {
            // full diff
            patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
        }
        if (patchFlag > 0) {
            // the presence of a patchFlag means this element's render code was
            // generated by the compiler and can take the fast path.
            // in this path old node and new node are guaranteed to have the same shape
            // (i.e. at the exact same position in the source template)
            if (patchFlag & 16 /* PatchFlags.FULL_PROPS */) {
                // element props contain dynamic keys, full diff needed
                patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
            }
            else {
                // class
                // this flag is matched when the element has dynamic class bindings.
                if (patchFlag & 2 /* PatchFlags.CLASS */) {
                    if (oldProps.class !== newProps.class) {
                        hostPatchProp(el, 'class', null, newProps.class, isSVG);
                    }
                }
                // style
                // this flag is matched when the element has dynamic style bindings
                if (patchFlag & 4 /* PatchFlags.STYLE */) {
                    hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
                }
                // props
                // This flag is matched when the element has dynamic prop/attr bindings
                // other than class and style. The keys of dynamic prop/attrs are saved for
                // faster iteration.
                // Note dynamic keys like :[foo]="bar" will cause this optimization to
                // bail out and go through a full diff because we need to unset the old key
                if (patchFlag & 8 /* PatchFlags.PROPS */) {
                    // if the flag is present then dynamicProps must be non-null
                    const propsToUpdate = n2.dynamicProps;
                    for (let i = 0; i < propsToUpdate.length; i++) {
                        const key = propsToUpdate[i];
                        const prev = oldProps[key];
                        const next = newProps[key];
                        // #1471 force patch value
                        if (next !== prev || key === 'value') {
                            hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
                        }
                    }
                }
            }
            // text
            // This flag is matched when the element has only dynamic text children.
            if (patchFlag & 1 /* PatchFlags.TEXT */) {
                if (n1.children !== n2.children) {
                    hostSetElementText(el, n2.children);
                }
            }
        }
        else if (!optimized && dynamicChildren == null) {
            // unoptimized, full diff
            patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
        }
        if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
                dirs && invokeDirectiveHook(n2, n1, parentComponent, 'updated');
            }, parentSuspense);
        }
    };
    // The fast path for blocks.
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
        for (let i = 0; i < newChildren.length; i++) {
            const oldVNode = oldChildren[i];
            const newVNode = newChildren[i];
            // Determine the container (parent element) for the patch.
            const container = 
            // oldVNode may be an errored async setup() component inside Suspense
            // which will not have a mounted element
            oldVNode.el &&
                // - In the case of a Fragment, we need to provide the actual parent
                // of the Fragment itself so it can move its children.
                (oldVNode.type === Fragment ||
                    // - In the case of different nodes, there is going to be a replacement
                    // which also requires the correct parent container
                    !isSameVNodeType(oldVNode, newVNode) ||
                    // - In the case of a component, it could contain anything.
                    oldVNode.shapeFlag & (6 /* ShapeFlags.COMPONENT */ | 64 /* ShapeFlags.TELEPORT */))
                ? hostParentNode(oldVNode.el)
                : // In other cases, the parent container is not actually used so we
                    // just pass the block element here to avoid a DOM parentNode call.
                    fallbackContainer;
            patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
        }
    };
    const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
        if (oldProps !== newProps) {
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!isReservedProp(key) && !(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
            }
            for (const key in newProps) {
                // empty string is not valid prop
                if (isReservedProp(key))
                    continue;
                const next = newProps[key];
                const prev = oldProps[key];
                // defer patching value
                if (next !== prev && key !== 'value') {
                    hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                }
            }
            if ('value' in newProps) {
                hostPatchProp(el, 'value', oldProps.value, newProps.value);
            }
        }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''));
        const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''));
        let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
        if (// #5523 dev root fragment may inherit directives
            (isHmrUpdating || patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */)) {
            // HMR updated / Dev root fragment (w/ comments), force full diff
            patchFlag = 0;
            optimized = false;
            dynamicChildren = null;
        }
        // check if this is a slot fragment with :slotted scope ids
        if (fragmentSlotScopeIds) {
            slotScopeIds = slotScopeIds
                ? slotScopeIds.concat(fragmentSlotScopeIds)
                : fragmentSlotScopeIds;
        }
        if (n1 == null) {
            hostInsert(fragmentStartAnchor, container, anchor);
            hostInsert(fragmentEndAnchor, container, anchor);
            // a fragment can only have array children
            // since they are either generated by the compiler, or implicitly created
            // from arrays.
            mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        else {
            if (patchFlag > 0 &&
                patchFlag & 64 /* PatchFlags.STABLE_FRAGMENT */ &&
                dynamicChildren &&
                // #2715 the previous fragment could've been a BAILed one as a result
                // of renderSlot() with no valid children
                n1.dynamicChildren) {
                // a stable fragment (template root or <template v-for>) doesn't need to
                // patch children order, but it may contain dynamicChildren.
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
                if (parentComponent && parentComponent.type.__hmrId) {
                    traverseStaticChildren(n1, n2);
                }
                else if (
                // #2080 if the stable fragment has a key, it's a <template v-for> that may
                //  get moved around. Make sure all root level vnodes inherit el.
                // #2134 or if it's a component root, it may also get moved around
                // as the component is being moved.
                n2.key != null ||
                    (parentComponent && n2 === parentComponent.subTree)) {
                    traverseStaticChildren(n1, n2, true /* shallow */);
                }
            }
            else {
                // keyed / unkeyed, or manual fragments.
                // for keyed & unkeyed, since they are compiler generated from v-for,
                // each child is guaranteed to be a block so the fragment will never
                // have dynamicChildren.
                patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
        }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        n2.slotScopeIds = slotScopeIds;
        if (n1 == null) {
            if (n2.shapeFlag & 512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */) {
                parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
            }
            else {
                mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
            }
        }
        else {
            updateComponent(n1, n2, optimized);
        }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense));
        if (instance.type.__hmrId) {
            registerHMR(instance);
        }
        {
            pushWarningContext(initialVNode);
            startMeasure(instance, `mount`);
        }
        // inject renderer internals for keepAlive
        if (isKeepAlive(initialVNode)) {
            instance.ctx.renderer = internals;
        }
        // resolve props and slots for setup context
        {
            {
                startMeasure(instance, `init`);
            }
            setupComponent(instance);
            {
                endMeasure(instance, `init`);
            }
        }
        // setup() is async. This component relies on async logic to be resolved
        // before proceeding
        if (instance.asyncDep) {
            parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
            // Give it a placeholder if this is not hydration
            // TODO handle self-defined fallback
            if (!initialVNode.el) {
                const placeholder = (instance.subTree = createVNode(Comment));
                processCommentNode(null, placeholder, container, anchor);
            }
            return;
        }
        setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
        {
            popWarningContext();
            endMeasure(instance, `mount`);
        }
    };
    const updateComponent = (n1, n2, optimized) => {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2, optimized)) {
            if (instance.asyncDep &&
                !instance.asyncResolved) {
                // async & still pending - just update props and slots
                // since the component's reactive effect for render isn't set-up yet
                {
                    pushWarningContext(n2);
                }
                updateComponentPreRender(instance, n2, optimized);
                {
                    popWarningContext();
                }
                return;
            }
            else {
                // normal update
                instance.next = n2;
                // in case the child component is also queued, remove it to avoid
                // double updating the same child component in the same flush.
                invalidateJob(instance.update);
                // instance.update is the reactive effect.
                instance.update();
            }
        }
        else {
            // no update needed. just copy over properties
            n2.el = n1.el;
            instance.vnode = n2;
        }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
        const componentUpdateFn = () => {
            if (!instance.isMounted) {
                let vnodeHook;
                const { el, props } = initialVNode;
                const { bm, m, parent } = instance;
                const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
                toggleRecurse(instance, false);
                // beforeMount hook
                if (bm) {
                    invokeArrayFns(bm);
                }
                // onVnodeBeforeMount
                if (!isAsyncWrapperVNode &&
                    (vnodeHook = props && props.onVnodeBeforeMount)) {
                    invokeVNodeHook(vnodeHook, parent, initialVNode);
                }
                toggleRecurse(instance, true);
                if (el && hydrateNode) {
                    // vnode has adopted host node - perform hydration instead of mount.
                    const hydrateSubTree = () => {
                        {
                            startMeasure(instance, `render`);
                        }
                        instance.subTree = renderComponentRoot(instance);
                        {
                            endMeasure(instance, `render`);
                        }
                        {
                            startMeasure(instance, `hydrate`);
                        }
                        hydrateNode(el, instance.subTree, instance, parentSuspense, null);
                        {
                            endMeasure(instance, `hydrate`);
                        }
                    };
                    if (isAsyncWrapperVNode) {
                        initialVNode.type.__asyncLoader().then(
                        // note: we are moving the render call into an async callback,
                        // which means it won't track dependencies - but it's ok because
                        // a server-rendered async wrapper is already in resolved state
                        // and it will never need to change.
                        () => !instance.isUnmounted && hydrateSubTree());
                    }
                    else {
                        hydrateSubTree();
                    }
                }
                else {
                    {
                        startMeasure(instance, `render`);
                    }
                    const subTree = (instance.subTree = renderComponentRoot(instance));
                    {
                        endMeasure(instance, `render`);
                    }
                    {
                        startMeasure(instance, `patch`);
                    }
                    patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
                    {
                        endMeasure(instance, `patch`);
                    }
                    initialVNode.el = subTree.el;
                }
                // mounted hook
                if (m) {
                    queuePostRenderEffect(m, parentSuspense);
                }
                // onVnodeMounted
                if (!isAsyncWrapperVNode &&
                    (vnodeHook = props && props.onVnodeMounted)) {
                    const scopedInitialVNode = initialVNode;
                    queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
                }
                // activated hook for keep-alive roots.
                // #1742 activated hook must be accessed after first render
                // since the hook may be injected by a child keep-alive
                if (initialVNode.shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */ ||
                    (parent &&
                        isAsyncWrapper(parent.vnode) &&
                        parent.vnode.shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */)) {
                    instance.a && queuePostRenderEffect(instance.a, parentSuspense);
                }
                instance.isMounted = true;
                {
                    devtoolsComponentAdded(instance);
                }
                // #2458: deference mount-only object parameters to prevent memleaks
                initialVNode = container = anchor = null;
            }
            else {
                // updateComponent
                // This is triggered by mutation of component's own state (next: null)
                // OR parent calling processComponent (next: VNode)
                let { next, bu, u, parent, vnode } = instance;
                let originNext = next;
                let vnodeHook;
                {
                    pushWarningContext(next || instance.vnode);
                }
                // Disallow component effect recursion during pre-lifecycle hooks.
                toggleRecurse(instance, false);
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next, optimized);
                }
                else {
                    next = vnode;
                }
                // beforeUpdate hook
                if (bu) {
                    invokeArrayFns(bu);
                }
                // onVnodeBeforeUpdate
                if ((vnodeHook = next.props && next.props.onVnodeBeforeUpdate)) {
                    invokeVNodeHook(vnodeHook, parent, next, vnode);
                }
                toggleRecurse(instance, true);
                // render
                {
                    startMeasure(instance, `render`);
                }
                const nextTree = renderComponentRoot(instance);
                {
                    endMeasure(instance, `render`);
                }
                const prevTree = instance.subTree;
                instance.subTree = nextTree;
                {
                    startMeasure(instance, `patch`);
                }
                patch(prevTree, nextTree, 
                // parent may have changed if it's in a teleport
                hostParentNode(prevTree.el), 
                // anchor may have changed if it's in a fragment
                getNextHostNode(prevTree), instance, parentSuspense, isSVG);
                {
                    endMeasure(instance, `patch`);
                }
                next.el = nextTree.el;
                if (originNext === null) {
                    // self-triggered update. In case of HOC, update parent component
                    // vnode el. HOC is indicated by parent instance's subTree pointing
                    // to child component's vnode
                    updateHOCHostEl(instance, nextTree.el);
                }
                // updated hook
                if (u) {
                    queuePostRenderEffect(u, parentSuspense);
                }
                // onVnodeUpdated
                if ((vnodeHook = next.props && next.props.onVnodeUpdated)) {
                    queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
                }
                {
                    devtoolsComponentUpdated(instance);
                }
                {
                    popWarningContext();
                }
            }
        };
        // create reactive effect for rendering
        const effect = (instance.effect = new ReactiveEffect(componentUpdateFn, () => queueJob(update), instance.scope // track it in component's effect scope
        ));
        const update = (instance.update = () => effect.run());
        update.id = instance.uid;
        // allowRecurse
        // #1801, #2043 component render effects should allow recursive updates
        toggleRecurse(instance, true);
        {
            effect.onTrack = instance.rtc
                ? e => invokeArrayFns(instance.rtc, e)
                : void 0;
            effect.onTrigger = instance.rtg
                ? e => invokeArrayFns(instance.rtg, e)
                : void 0;
            update.ownerInstance = instance;
        }
        update();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized) => {
        nextVNode.component = instance;
        const prevProps = instance.vnode.props;
        instance.vnode = nextVNode;
        instance.next = null;
        updateProps(instance, nextVNode.props, prevProps, optimized);
        updateSlots(instance, nextVNode.children, optimized);
        pauseTracking();
        // props update may have triggered pre-flush watchers.
        // flush them before the render update.
        flushPreFlushCbs();
        resetTracking();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
        const c1 = n1 && n1.children;
        const prevShapeFlag = n1 ? n1.shapeFlag : 0;
        const c2 = n2.children;
        const { patchFlag, shapeFlag } = n2;
        // fast path
        if (patchFlag > 0) {
            if (patchFlag & 128 /* PatchFlags.KEYED_FRAGMENT */) {
                // this could be either fully-keyed or mixed (some keyed some not)
                // presence of patchFlag means children are guaranteed to be arrays
                patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                return;
            }
            else if (patchFlag & 256 /* PatchFlags.UNKEYED_FRAGMENT */) {
                // unkeyed
                patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                return;
            }
        }
        // children has 3 possibilities: text, array or no children.
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            // text children fast path
            if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                unmountChildren(c1, parentComponent, parentSuspense);
            }
            if (c2 !== c1) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                // prev children was array
                if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    // two arrays, cannot assume anything, do full diff
                    patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else {
                    // no new children, just unmount old
                    unmountChildren(c1, parentComponent, parentSuspense, true);
                }
            }
            else {
                // prev children was text OR null
                // new children is array OR null
                if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                    hostSetElementText(container, '');
                }
                // mount new if array
                if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
            }
        }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        c1 = c1 || EMPTY_ARR;
        c2 = c2 || EMPTY_ARR;
        const oldLength = c1.length;
        const newLength = c2.length;
        const commonLength = Math.min(oldLength, newLength);
        let i;
        for (i = 0; i < commonLength; i++) {
            const nextChild = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        if (oldLength > newLength) {
            // remove old
            unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
        }
        else {
            // mount new
            mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
        }
    };
    // can be all-keyed or mixed
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1; // prev ending index
        let e2 = l2 - 1; // next ending index
        // 1. sync from start
        // (a b) c
        // (a b) d e
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                break;
            }
            i++;
        }
        // 2. sync from end
        // a (b c)
        // d e (b c)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = (c2[e2] = optimized
                ? cloneIfMounted(c2[e2])
                : normalizeVNode(c2[e2]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. common sequence + mount
        // (a b)
        // (a b) c
        // i = 2, e1 = 1, e2 = 2
        // (a b)
        // c (a b)
        // i = 0, e1 = -1, e2 = 0
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    patch(null, (c2[i] = optimized
                        ? cloneIfMounted(c2[i])
                        : normalizeVNode(c2[i])), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    i++;
                }
            }
        }
        // 4. common sequence + unmount
        // (a b) c
        // (a b)
        // i = 2, e1 = 2, e2 = 1
        // a (b c)
        // (b c)
        // i = 0, e1 = 0, e2 = -1
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i], parentComponent, parentSuspense, true);
                i++;
            }
        }
        // 5. unknown sequence
        // [i ... e1 + 1]: a b [c d e] f g
        // [i ... e2 + 1]: a b [e d c h] f g
        // i = 2, e1 = 4, e2 = 5
        else {
            const s1 = i; // prev starting index
            const s2 = i; // next starting index
            // 5.1 build key:index map for newChildren
            const keyToNewIndexMap = new Map();
            for (i = s2; i <= e2; i++) {
                const nextChild = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                if (nextChild.key != null) {
                    if (keyToNewIndexMap.has(nextChild.key)) {
                        warn(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
                    }
                    keyToNewIndexMap.set(nextChild.key, i);
                }
            }
            // 5.2 loop through old children left to be patched and try to patch
            // matching nodes & remove nodes that are no longer present
            let j;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            let moved = false;
            // used to track whether any node has moved
            let maxNewIndexSoFar = 0;
            // works as Map<newIndex, oldIndex>
            // Note that oldIndex is offset by +1
            // and oldIndex = 0 is a special value indicating the new node has
            // no corresponding old node.
            // used for determining longest stable subsequence
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    // all new children have been patched so this can only be a removal
                    unmount(prevChild, parentComponent, parentSuspense, true);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    // key-less node, try to locate a key-less node of the same type
                    for (j = s2; j <= e2; j++) {
                        if (newIndexToOldIndexMap[j - s2] === 0 &&
                            isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    unmount(prevChild, parentComponent, parentSuspense, true);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    patched++;
                }
            }
            // 5.3 move and mount
            // generate longest stable subsequence only when nodes have moved
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : EMPTY_ARR;
            j = increasingNewIndexSequence.length - 1;
            // looping backwards so that we can use last patched node as anchor
            for (i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexToOldIndexMap[i] === 0) {
                    // mount new
                    patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (moved) {
                    // move if:
                    // There is no stable subsequence (e.g. a reverse)
                    // OR current node is not among the stable sequence
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        move(nextChild, container, anchor, 2 /* MoveType.REORDER */);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
        const { el, type, transition, children, shapeFlag } = vnode;
        if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
            move(vnode.component.subTree, container, anchor, moveType);
            return;
        }
        if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
            vnode.suspense.move(container, anchor, moveType);
            return;
        }
        if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
            type.move(vnode, container, anchor, internals);
            return;
        }
        if (type === Fragment) {
            hostInsert(el, container, anchor);
            for (let i = 0; i < children.length; i++) {
                move(children[i], container, anchor, moveType);
            }
            hostInsert(vnode.anchor, container, anchor);
            return;
        }
        if (type === Static) {
            moveStaticNode(vnode, container, anchor);
            return;
        }
        // single nodes
        const needTransition = moveType !== 2 /* MoveType.REORDER */ &&
            shapeFlag & 1 /* ShapeFlags.ELEMENT */ &&
            transition;
        if (needTransition) {
            if (moveType === 0 /* MoveType.ENTER */) {
                transition.beforeEnter(el);
                hostInsert(el, container, anchor);
                queuePostRenderEffect(() => transition.enter(el), parentSuspense);
            }
            else {
                const { leave, delayLeave, afterLeave } = transition;
                const remove = () => hostInsert(el, container, anchor);
                const performLeave = () => {
                    leave(el, () => {
                        remove();
                        afterLeave && afterLeave();
                    });
                };
                if (delayLeave) {
                    delayLeave(el, remove, performLeave);
                }
                else {
                    performLeave();
                }
            }
        }
        else {
            hostInsert(el, container, anchor);
        }
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
        const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
        // unset ref
        if (ref != null) {
            setRef(ref, null, parentSuspense, vnode, true);
        }
        if (shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */) {
            parentComponent.ctx.deactivate(vnode);
            return;
        }
        const shouldInvokeDirs = shapeFlag & 1 /* ShapeFlags.ELEMENT */ && dirs;
        const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
        let vnodeHook;
        if (shouldInvokeVnodeHook &&
            (vnodeHook = props && props.onVnodeBeforeUnmount)) {
            invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
        if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
            unmountComponent(vnode.component, parentSuspense, doRemove);
        }
        else {
            if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
                vnode.suspense.unmount(parentSuspense, doRemove);
                return;
            }
            if (shouldInvokeDirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'beforeUnmount');
            }
            if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
                vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
            }
            else if (dynamicChildren &&
                // #1153: fast path should not be taken for non-stable (v-for) fragments
                (type !== Fragment ||
                    (patchFlag > 0 && patchFlag & 64 /* PatchFlags.STABLE_FRAGMENT */))) {
                // fast path for block nodes: only need to unmount dynamic children.
                unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
            }
            else if ((type === Fragment &&
                patchFlag &
                    (128 /* PatchFlags.KEYED_FRAGMENT */ | 256 /* PatchFlags.UNKEYED_FRAGMENT */)) ||
                (!optimized && shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */)) {
                unmountChildren(children, parentComponent, parentSuspense);
            }
            if (doRemove) {
                remove(vnode);
            }
        }
        if ((shouldInvokeVnodeHook &&
            (vnodeHook = props && props.onVnodeUnmounted)) ||
            shouldInvokeDirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                shouldInvokeDirs &&
                    invokeDirectiveHook(vnode, null, parentComponent, 'unmounted');
            }, parentSuspense);
        }
    };
    const remove = vnode => {
        const { type, el, anchor, transition } = vnode;
        if (type === Fragment) {
            if (vnode.patchFlag > 0 &&
                vnode.patchFlag & 2048 /* PatchFlags.DEV_ROOT_FRAGMENT */ &&
                transition &&
                !transition.persisted) {
                vnode.children.forEach(child => {
                    if (child.type === Comment) {
                        hostRemove(child.el);
                    }
                    else {
                        remove(child);
                    }
                });
            }
            else {
                removeFragment(el, anchor);
            }
            return;
        }
        if (type === Static) {
            removeStaticNode(vnode);
            return;
        }
        const performRemove = () => {
            hostRemove(el);
            if (transition && !transition.persisted && transition.afterLeave) {
                transition.afterLeave();
            }
        };
        if (vnode.shapeFlag & 1 /* ShapeFlags.ELEMENT */ &&
            transition &&
            !transition.persisted) {
            const { leave, delayLeave } = transition;
            const performLeave = () => leave(el, performRemove);
            if (delayLeave) {
                delayLeave(vnode.el, performRemove, performLeave);
            }
            else {
                performLeave();
            }
        }
        else {
            performRemove();
        }
    };
    const removeFragment = (cur, end) => {
        // For fragments, directly remove all contained DOM nodes.
        // (fragment child nodes cannot have transition)
        let next;
        while (cur !== end) {
            next = hostNextSibling(cur);
            hostRemove(cur);
            cur = next;
        }
        hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove) => {
        if (instance.type.__hmrId) {
            unregisterHMR(instance);
        }
        const { bum, scope, update, subTree, um } = instance;
        // beforeUnmount hook
        if (bum) {
            invokeArrayFns(bum);
        }
        // stop effects in component scope
        scope.stop();
        // update may be null if a component is unmounted before its async
        // setup has resolved.
        if (update) {
            // so that scheduler will no longer invoke it
            update.active = false;
            unmount(subTree, instance, parentSuspense, doRemove);
        }
        // unmounted hook
        if (um) {
            queuePostRenderEffect(um, parentSuspense);
        }
        queuePostRenderEffect(() => {
            instance.isUnmounted = true;
        }, parentSuspense);
        // A component with async dep inside a pending suspense is unmounted before
        // its async dep resolves. This should remove the dep from the suspense, and
        // cause the suspense to resolve immediately if that was the last dep.
        if (parentSuspense &&
            parentSuspense.pendingBranch &&
            !parentSuspense.isUnmounted &&
            instance.asyncDep &&
            !instance.asyncResolved &&
            instance.suspenseId === parentSuspense.pendingId) {
            parentSuspense.deps--;
            if (parentSuspense.deps === 0) {
                parentSuspense.resolve();
            }
        }
        {
            devtoolsComponentRemoved(instance);
        }
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
        for (let i = start; i < children.length; i++) {
            unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
        }
    };
    const getNextHostNode = vnode => {
        if (vnode.shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
            return getNextHostNode(vnode.component.subTree);
        }
        if (vnode.shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
            return vnode.suspense.next();
        }
        return hostNextSibling((vnode.anchor || vnode.el));
    };
    const render = (vnode, container, isSVG) => {
        if (vnode == null) {
            if (container._vnode) {
                unmount(container._vnode, null, null, true);
            }
        }
        else {
            patch(container._vnode || null, vnode, container, null, null, null, isSVG);
        }
        flushPreFlushCbs();
        flushPostFlushCbs();
        container._vnode = vnode;
    };
    const internals = {
        p: patch,
        um: unmount,
        m: move,
        r: remove,
        mt: mountComponent,
        mc: mountChildren,
        pc: patchChildren,
        pbc: patchBlockChildren,
        n: getNextHostNode,
        o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) {
        [hydrate, hydrateNode] = createHydrationFns(internals);
    }
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    };
}
function toggleRecurse({ effect, update }, allowed) {
    effect.allowRecurse = update.allowRecurse = allowed;
}
/**
 * #1156
 * When a component is HMR-enabled, we need to make sure that all static nodes
 * inside a block also inherit the DOM element from the previous tree so that
 * HMR updates (which are full updates) can retrieve the element for patching.
 *
 * #2080
 * Inside keyed `template` fragment static children, if a fragment is moved,
 * the children will always be moved. Therefore, in order to ensure correct move
 * position, el should be inherited from previous nodes.
 */
function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if (isArray(ch1) && isArray(ch2)) {
        for (let i = 0; i < ch1.length; i++) {
            // this is only called in the optimized path so array children are
            // guaranteed to be vnodes
            const c1 = ch1[i];
            let c2 = ch2[i];
            if (c2.shapeFlag & 1 /* ShapeFlags.ELEMENT */ && !c2.dynamicChildren) {
                if (c2.patchFlag <= 0 || c2.patchFlag === 32 /* PatchFlags.HYDRATE_EVENTS */) {
                    c2 = ch2[i] = cloneIfMounted(ch2[i]);
                    c2.el = c1.el;
                }
                if (!shallow)
                    traverseStaticChildren(c1, c2);
            }
            // #6852 also inherit for text nodes
            if (c2.type === Text) {
                c2.el = c1.el;
            }
            // also inherit for comment nodes, but not placeholders (e.g. v-if which
            // would have received .el during block patch)
            if (c2.type === Comment && !c2.el) {
                c2.el = c1.el;
            }
        }
    }
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
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

const isTeleport = (type) => type.__isTeleport;

const Fragment = Symbol('Fragment' );
const Text = Symbol('Text' );
const Comment = Symbol('Comment' );
const Static = Symbol('Static' );
// Since v-if and v-for are the two possible ways node structure can dynamically
// change, once we consider v-if branches and each v-for fragment a block, we
// can divide a template into nested blocks, and within each block the node
// structure would be stable. This allows us to skip most children diffing
// and only worry about the dynamic nodes (indicated by patch flags).
const blockStack = [];
let currentBlock = null;
/**
 * Open a block.
 * This must be called before `createBlock`. It cannot be part of `createBlock`
 * because the children of the block are evaluated before `createBlock` itself
 * is called. The generated code typically looks like this:
 *
 * ```js
 * function render() {
 *   return (openBlock(),createBlock('div', null, [...]))
 * }
 * ```
 * disableTracking is true when creating a v-for fragment block, since a v-for
 * fragment always diffs its children.
 *
 * @private
 */
function openBlock(disableTracking = false) {
    blockStack.push((currentBlock = disableTracking ? null : []));
}
function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
}
// Whether we should be tracking dynamic child nodes inside a block.
// Only tracks when this value is > 0
// We are not using a simple boolean because this value may need to be
// incremented/decremented by nested usage of v-once (see below)
let isBlockTreeEnabled = 1;
/**
 * Block tracking sometimes needs to be disabled, for example during the
 * creation of a tree that needs to be cached by v-once. The compiler generates
 * code like this:
 *
 * ``` js
 * _cache[1] || (
 *   setBlockTracking(-1),
 *   _cache[1] = createVNode(...),
 *   setBlockTracking(1),
 *   _cache[1]
 * )
 * ```
 *
 * @private
 */
function setBlockTracking(value) {
    isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
    // save current block children on the block vnode
    vnode.dynamicChildren =
        isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
    // close block
    closeBlock();
    // a block is always going to be patched, so track it as a child of its
    // parent block
    if (isBlockTreeEnabled > 0 && currentBlock) {
        currentBlock.push(vnode);
    }
    return vnode;
}
/**
 * @private
 */
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true /* isBlock */));
}
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
    if (n2.shapeFlag & 6 /* ShapeFlags.COMPONENT */ &&
        hmrDirtyComponents.has(n2.type)) {
        // #7042, ensure the vnode being unmounted during HMR
        // bitwise operations to remove keep alive flags
        n1.shapeFlag &= ~256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */;
        n2.shapeFlag &= ~512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */;
        // HMR only: if the component has been hot-updated, force a reload.
        return false;
    }
    return n1.type === n2.type && n1.key === n2.key;
}
const createVNodeWithArgsTransform = (...args) => {
    return _createVNode(...(args));
};
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref, ref_key, ref_for }) => {
    return (ref != null
        ? isString(ref) || isRef(ref) || isFunction(ref)
            ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
            : ref
        : null);
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1 /* ShapeFlags.ELEMENT */, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
        __v_isVNode: true,
        __v_skip: true,
        type,
        props,
        key: props && normalizeKey(props),
        ref: props && normalizeRef(props),
        scopeId: currentScopeId,
        slotScopeIds: null,
        children,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag,
        patchFlag,
        dynamicProps,
        dynamicChildren: null,
        appContext: null,
        ctx: currentRenderingInstance
    };
    if (needFullChildrenNormalization) {
        normalizeChildren(vnode, children);
        // normalize suspense children
        if (shapeFlag & 128 /* ShapeFlags.SUSPENSE */) {
            type.normalize(vnode);
        }
    }
    else if (children) {
        // compiled element vnode - if children is passed, only possible types are
        // string or Array.
        vnode.shapeFlag |= isString(children)
            ? 8 /* ShapeFlags.TEXT_CHILDREN */
            : 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // validate key
    if (vnode.key !== vnode.key) {
        warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
    }
    // track vnode for block tree
    if (isBlockTreeEnabled > 0 &&
        // avoid a block node from tracking itself
        !isBlockNode &&
        // has current parent block
        currentBlock &&
        // presence of a patch flag indicates this node needs patching on updates.
        // component nodes also should always be patched, because even if the
        // component doesn't need to update, it needs to persist the instance on to
        // the next vnode so that it can be properly unmounted later.
        (vnode.patchFlag > 0 || shapeFlag & 6 /* ShapeFlags.COMPONENT */) &&
        // the EVENTS flag is only for hydration and if it is the only flag, the
        // vnode should not be considered dynamic due to handler caching.
        vnode.patchFlag !== 32 /* PatchFlags.HYDRATE_EVENTS */) {
        currentBlock.push(vnode);
    }
    return vnode;
}
const createVNode = (createVNodeWithArgsTransform );
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
        if (!type) {
            warn(`Invalid vnode type when creating vnode: ${type}.`);
        }
        type = Comment;
    }
    if (isVNode(type)) {
        // createVNode receiving an existing vnode. This happens in cases like
        // <component :is="vnode"/>
        // #2078 make sure to merge refs during the clone instead of overwriting it
        const cloned = cloneVNode(type, props, true /* mergeRef: true */);
        if (children) {
            normalizeChildren(cloned, children);
        }
        if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
            if (cloned.shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                currentBlock[currentBlock.indexOf(type)] = cloned;
            }
            else {
                currentBlock.push(cloned);
            }
        }
        cloned.patchFlag |= -2 /* PatchFlags.BAIL */;
        return cloned;
    }
    // class component normalization.
    if (isClassComponent(type)) {
        type = type.__vccOpts;
    }
    // class & style normalization.
    if (props) {
        // for reactive or proxy objects, we need to clone it to enable mutation.
        props = guardReactiveProps(props);
        let { class: klass, style } = props;
        if (klass && !isString(klass)) {
            props.class = normalizeClass(klass);
        }
        if (isObject(style)) {
            // reactive state objects need to be cloned since they are likely to be
            // mutated
            if (isProxy(style) && !isArray(style)) {
                style = extend({}, style);
            }
            props.style = normalizeStyle(style);
        }
    }
    // encode the vnode type information into a bitmap
    const shapeFlag = isString(type)
        ? 1 /* ShapeFlags.ELEMENT */
        : isSuspense(type)
            ? 128 /* ShapeFlags.SUSPENSE */
            : isTeleport(type)
                ? 64 /* ShapeFlags.TELEPORT */
                : isObject(type)
                    ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
                    : isFunction(type)
                        ? 2 /* ShapeFlags.FUNCTIONAL_COMPONENT */
                        : 0;
    if (shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */ && isProxy(type)) {
        type = toRaw(type);
        warn(`Vue received a Component which was made a reactive object. This can ` +
            `lead to unnecessary performance overhead, and should be avoided by ` +
            `marking the component with \`markRaw\` or using \`shallowRef\` ` +
            `instead of \`ref\`.`, `\nComponent that was made reactive: `, type);
    }
    return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
    if (!props)
        return null;
    return isProxy(props) || InternalObjectKey in props
        ? extend({}, props)
        : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
    // This is intentionally NOT using spread or extend to avoid the runtime
    // key enumeration cost.
    const { props, ref, patchFlag, children } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
        __v_isVNode: true,
        __v_skip: true,
        type: vnode.type,
        props: mergedProps,
        key: mergedProps && normalizeKey(mergedProps),
        ref: extraProps && extraProps.ref
            ? // #2078 in the case of <component :is="vnode" ref="extra"/>
                // if the vnode itself already has a ref, cloneVNode will need to merge
                // the refs so the single vnode can be set on multiple refs
                mergeRef && ref
                    ? isArray(ref)
                        ? ref.concat(normalizeRef(extraProps))
                        : [ref, normalizeRef(extraProps)]
                    : normalizeRef(extraProps)
            : ref,
        scopeId: vnode.scopeId,
        slotScopeIds: vnode.slotScopeIds,
        children: patchFlag === -1 /* PatchFlags.HOISTED */ && isArray(children)
            ? children.map(deepCloneVNode)
            : children,
        target: vnode.target,
        targetAnchor: vnode.targetAnchor,
        staticCount: vnode.staticCount,
        shapeFlag: vnode.shapeFlag,
        // if the vnode is cloned with extra props, we can no longer assume its
        // existing patch flag to be reliable and need to add the FULL_PROPS flag.
        // note: preserve flag for fragments since they use the flag for children
        // fast paths only.
        patchFlag: extraProps && vnode.type !== Fragment
            ? patchFlag === -1 // hoisted node
                ? 16 /* PatchFlags.FULL_PROPS */
                : patchFlag | 16 /* PatchFlags.FULL_PROPS */
            : patchFlag,
        dynamicProps: vnode.dynamicProps,
        dynamicChildren: vnode.dynamicChildren,
        appContext: vnode.appContext,
        dirs: vnode.dirs,
        transition: vnode.transition,
        // These should technically only be non-null on mounted VNodes. However,
        // they *should* be copied for kept-alive vnodes. So we just always copy
        // them since them being non-null during a mount doesn't affect the logic as
        // they will simply be overwritten.
        component: vnode.component,
        suspense: vnode.suspense,
        ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
        ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
        el: vnode.el,
        anchor: vnode.anchor,
        ctx: vnode.ctx,
        ce: vnode.ce
    };
    return cloned;
}
/**
 * Dev only, for HMR of hoisted vnodes reused in v-for
 * https://github.com/vitejs/vite/issues/2022
 */
function deepCloneVNode(vnode) {
    const cloned = cloneVNode(vnode);
    if (isArray(vnode.children)) {
        cloned.children = vnode.children.map(deepCloneVNode);
    }
    return cloned;
}
/**
 * @private
 */
function createTextVNode(text = ' ', flag = 0) {
    return createVNode(Text, null, text, flag);
}
function normalizeVNode(child) {
    if (child == null || typeof child === 'boolean') {
        // empty placeholder
        return createVNode(Comment);
    }
    else if (isArray(child)) {
        // fragment
        return createVNode(Fragment, null, 
        // #3666, avoid reference pollution when reusing vnode
        child.slice());
    }
    else if (typeof child === 'object') {
        // already vnode, this should be the most common since compiled templates
        // always produce all-vnode children arrays
        return cloneIfMounted(child);
    }
    else {
        // strings and numbers
        return createVNode(Text, null, String(child));
    }
}
// optimized normalization for template-compiled render fns
function cloneIfMounted(child) {
    return (child.el === null && child.patchFlag !== -1 /* PatchFlags.HOISTED */) ||
        child.memo
        ? child
        : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) {
        children = null;
    }
    else if (isArray(children)) {
        type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    else if (typeof children === 'object') {
        if (shapeFlag & (1 /* ShapeFlags.ELEMENT */ | 64 /* ShapeFlags.TELEPORT */)) {
            // Normalize slot to plain children for plain element and Teleport
            const slot = children.default;
            if (slot) {
                // _c marker is added by withCtx() indicating this is a compiled slot
                slot._c && (slot._d = false);
                normalizeChildren(vnode, slot());
                slot._c && (slot._d = true);
            }
            return;
        }
        else {
            type = 32 /* ShapeFlags.SLOTS_CHILDREN */;
            const slotFlag = children._;
            if (!slotFlag && !(InternalObjectKey in children)) {
                children._ctx = currentRenderingInstance;
            }
            else if (slotFlag === 3 /* SlotFlags.FORWARDED */ && currentRenderingInstance) {
                // a child component receives forwarded slots from the parent.
                // its slot type is determined by its parent's slot type.
                if (currentRenderingInstance.slots._ === 1 /* SlotFlags.STABLE */) {
                    children._ = 1 /* SlotFlags.STABLE */;
                }
                else {
                    children._ = 2 /* SlotFlags.DYNAMIC */;
                    vnode.patchFlag |= 1024 /* PatchFlags.DYNAMIC_SLOTS */;
                }
            }
        }
    }
    else if (isFunction(children)) {
        children = { default: children, _ctx: currentRenderingInstance };
        type = 32 /* ShapeFlags.SLOTS_CHILDREN */;
    }
    else {
        children = String(children);
        // force teleport children to array so it can be moved around
        if (shapeFlag & 64 /* ShapeFlags.TELEPORT */) {
            type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
            children = [createTextVNode(children)];
        }
        else {
            type = 8 /* ShapeFlags.TEXT_CHILDREN */;
        }
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
}
function mergeProps(...args) {
    const ret = {};
    for (let i = 0; i < args.length; i++) {
        const toMerge = args[i];
        for (const key in toMerge) {
            if (key === 'class') {
                if (ret.class !== toMerge.class) {
                    ret.class = normalizeClass([ret.class, toMerge.class]);
                }
            }
            else if (key === 'style') {
                ret.style = normalizeStyle([ret.style, toMerge.style]);
            }
            else if (isOn(key)) {
                const existing = ret[key];
                const incoming = toMerge[key];
                if (incoming &&
                    existing !== incoming &&
                    !(isArray(existing) && existing.includes(incoming))) {
                    ret[key] = existing
                        ? [].concat(existing, incoming)
                        : incoming;
                }
            }
            else if (key !== '') {
                ret[key] = toMerge[key];
            }
        }
    }
    return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7 /* ErrorCodes.VNODE_HOOK */, [
        vnode,
        prevVNode
    ]);
}

const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    // inherit parent app context - or - if root, adopt from root vnode
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
        uid: uid++,
        vnode,
        type,
        parent,
        appContext,
        root: null,
        next: null,
        subTree: null,
        effect: null,
        update: null,
        scope: new EffectScope(true /* detached */),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: parent ? parent.provides : Object.create(appContext.provides),
        accessCache: null,
        renderCache: [],
        // local resolved assets
        components: null,
        directives: null,
        // resolved props and emits options
        propsOptions: normalizePropsOptions(type, appContext),
        emitsOptions: normalizeEmitsOptions(type, appContext),
        // emit
        emit: null,
        emitted: null,
        // props default value
        propsDefaults: EMPTY_OBJ,
        // inheritAttrs
        inheritAttrs: type.inheritAttrs,
        // state
        ctx: EMPTY_OBJ,
        data: EMPTY_OBJ,
        props: EMPTY_OBJ,
        attrs: EMPTY_OBJ,
        slots: EMPTY_OBJ,
        refs: EMPTY_OBJ,
        setupState: EMPTY_OBJ,
        setupContext: null,
        // suspense related
        suspense,
        suspenseId: suspense ? suspense.pendingId : 0,
        asyncDep: null,
        asyncResolved: false,
        // lifecycle hooks
        // not using enums here because it results in computed properties
        isMounted: false,
        isUnmounted: false,
        isDeactivated: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
    };
    {
        instance.ctx = createDevRenderContext(instance);
    }
    instance.root = parent ? parent.root : instance;
    instance.emit = emit.bind(null, instance);
    // apply custom element special handling
    if (vnode.ce) {
        vnode.ce(instance);
    }
    return instance;
}
let currentInstance = null;
const setCurrentInstance = (instance) => {
    currentInstance = instance;
    instance.scope.on();
};
const unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off();
    currentInstance = null;
};
const isBuiltInTag = /*#__PURE__*/ makeMap('slot,component');
function validateComponentName(name, config) {
    const appIsNativeTag = config.isNativeTag || NO;
    if (isBuiltInTag(name) || appIsNativeTag(name)) {
        warn('Do not use built-in or reserved HTML elements as component id: ' + name);
    }
}
function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
    isInSSRComponentSetup = isSSR;
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children);
    const setupResult = isStateful
        ? setupStatefulComponent(instance, isSSR)
        : undefined;
    isInSSRComponentSetup = false;
    return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
    var _a;
    const Component = instance.type;
    {
        if (Component.name) {
            validateComponentName(Component.name, instance.appContext.config);
        }
        if (Component.components) {
            const names = Object.keys(Component.components);
            for (let i = 0; i < names.length; i++) {
                validateComponentName(names[i], instance.appContext.config);
            }
        }
        if (Component.directives) {
            const names = Object.keys(Component.directives);
            for (let i = 0; i < names.length; i++) {
                validateDirectiveName(names[i]);
            }
        }
        if (Component.compilerOptions && isRuntimeOnly()) {
            warn(`"compilerOptions" is only supported when using a build of Vue that ` +
                `includes the runtime compiler. Since you are using a runtime-only ` +
                `build, the options should be passed via your build tool config instead.`);
        }
    }
    // 0. create render proxy property access cache
    instance.accessCache = Object.create(null);
    // 1. create public instance / render proxy
    // also mark it raw so it's never observed
    instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
    {
        exposePropsOnRenderContext(instance);
    }
    // 2. call setup()
    const { setup } = Component;
    if (setup) {
        const setupContext = (instance.setupContext =
            setup.length > 1 ? createSetupContext(instance) : null);
        setCurrentInstance(instance);
        pauseTracking();
        const setupResult = callWithErrorHandling(setup, instance, 0 /* ErrorCodes.SETUP_FUNCTION */, [shallowReadonly(instance.props) , setupContext]);
        resetTracking();
        unsetCurrentInstance();
        if (isPromise(setupResult)) {
            setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
            if (isSSR) {
                // return the promise so server-renderer can wait on it
                return setupResult
                    .then((resolvedResult) => {
                    handleSetupResult(instance, resolvedResult, isSSR);
                })
                    .catch(e => {
                    handleError(e, instance, 0 /* ErrorCodes.SETUP_FUNCTION */);
                });
            }
            else {
                // async setup returned Promise.
                // bail here and wait for re-entry.
                instance.asyncDep = setupResult;
                if (!instance.suspense) {
                    const name = (_a = Component.name) !== null && _a !== void 0 ? _a : 'Anonymous';
                    warn(`Component <${name}>: setup function returned a promise, but no ` +
                        `<Suspense> boundary was found in the parent component tree. ` +
                        `A component with async setup() must be nested in a <Suspense> ` +
                        `in order to be rendered.`);
                }
            }
        }
        else {
            handleSetupResult(instance, setupResult, isSSR);
        }
    }
    else {
        finishComponentSetup(instance, isSSR);
    }
}
function handleSetupResult(instance, setupResult, isSSR) {
    if (isFunction(setupResult)) {
        // setup returned an inline render function
        if (instance.type.__ssrInlineRender) {
            // when the function's name is `ssrRender` (compiled by SFC inline mode),
            // set it as ssrRender instead.
            instance.ssrRender = setupResult;
        }
        else {
            instance.render = setupResult;
        }
    }
    else if (isObject(setupResult)) {
        if (isVNode(setupResult)) {
            warn(`setup() should not return VNodes directly - ` +
                `return a render function instead.`);
        }
        // setup returned bindings.
        // assuming a render function compiled from template is present.
        {
            instance.devtoolsRawSetupState = setupResult;
        }
        instance.setupState = proxyRefs(setupResult);
        {
            exposeSetupStateOnRenderContext(instance);
        }
    }
    else if (setupResult !== undefined) {
        warn(`setup() should return an object. Received: ${setupResult === null ? 'null' : typeof setupResult}`);
    }
    finishComponentSetup(instance, isSSR);
}
let compile;
// dev only
const isRuntimeOnly = () => !compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    // template / render function normalization
    // could be already set when returned from setup()
    if (!instance.render) {
        // only do on-the-fly compile if not in SSR - SSR on-the-fly compilation
        // is done by server-renderer
        if (!isSSR && compile && !Component.render) {
            const template = Component.template ||
                resolveMergedOptions(instance).template;
            if (template) {
                {
                    startMeasure(instance, `compile`);
                }
                const { isCustomElement, compilerOptions } = instance.appContext.config;
                const { delimiters, compilerOptions: componentCompilerOptions } = Component;
                const finalCompilerOptions = extend(extend({
                    isCustomElement,
                    delimiters
                }, compilerOptions), componentCompilerOptions);
                Component.render = compile(template, finalCompilerOptions);
                {
                    endMeasure(instance, `compile`);
                }
            }
        }
        instance.render = (Component.render || NOOP);
    }
    // support for 2.x options
    {
        setCurrentInstance(instance);
        pauseTracking();
        applyOptions(instance);
        resetTracking();
        unsetCurrentInstance();
    }
    // warn missing template/render
    // the runtime compilation of template in SSR is done by server-render
    if (!Component.render && instance.render === NOOP && !isSSR) {
        /* istanbul ignore if */
        if (Component.template) {
            warn(`Component provided template option but ` +
                `runtime compilation is not supported in this build of Vue.` +
                (` Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
                    ) /* should not happen */);
        }
        else {
            warn(`Component is missing template or render function.`);
        }
    }
}
function createAttrsProxy(instance) {
    return new Proxy(instance.attrs, {
            get(target, key) {
                markAttrsAccessed();
                track(instance, "get" /* TrackOpTypes.GET */, '$attrs');
                return target[key];
            },
            set() {
                warn(`setupContext.attrs is readonly.`);
                return false;
            },
            deleteProperty() {
                warn(`setupContext.attrs is readonly.`);
                return false;
            }
        }
        );
}
function createSetupContext(instance) {
    const expose = exposed => {
        {
            if (instance.exposed) {
                warn(`expose() should be called only once per setup().`);
            }
            if (exposed != null) {
                let exposedType = typeof exposed;
                if (exposedType === 'object') {
                    if (isArray(exposed)) {
                        exposedType = 'array';
                    }
                    else if (isRef(exposed)) {
                        exposedType = 'ref';
                    }
                }
                if (exposedType !== 'object') {
                    warn(`expose() should be passed a plain object, received ${exposedType}.`);
                }
            }
        }
        instance.exposed = exposed || {};
    };
    let attrs;
    {
        // We use getters in dev in case libs like test-utils overwrite instance
        // properties (overwrites should not be done in prod)
        return Object.freeze({
            get attrs() {
                return attrs || (attrs = createAttrsProxy(instance));
            },
            get slots() {
                return shallowReadonly(instance.slots);
            },
            get emit() {
                return (event, ...args) => instance.emit(event, ...args);
            },
            expose
        });
    }
}
function getExposeProxy(instance) {
    if (instance.exposed) {
        return (instance.exposeProxy ||
            (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
                get(target, key) {
                    if (key in target) {
                        return target[key];
                    }
                    else if (key in publicPropertiesMap) {
                        return publicPropertiesMap[key](instance);
                    }
                },
                has(target, key) {
                    return key in target || key in publicPropertiesMap;
                }
            })));
    }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');
function getComponentName(Component, includeInferred = true) {
    return isFunction(Component)
        ? Component.displayName || Component.name
        : Component.name || (includeInferred && Component.__name);
}
/* istanbul ignore next */
function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
        const match = Component.__file.match(/([^/\\]+)\.\w+$/);
        if (match) {
            name = match[1];
        }
    }
    if (!name && instance && instance.parent) {
        // try to infer the name based on reverse resolution
        const inferFromRegistry = (registry) => {
            for (const key in registry) {
                if (registry[key] === Component) {
                    return key;
                }
            }
        };
        name =
            inferFromRegistry(instance.components ||
                instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
    return isFunction(value) && '__vccOpts' in value;
}

const computed = ((getterOrOptions, debugOptions) => {
    // @ts-ignore
    return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
});

const ssrContextKey = Symbol(`ssrContext` );
const useSSRContext = () => {
    {
        const ctx = inject(ssrContextKey);
        if (!ctx) {
            warn(`Server rendering context not provided. Make sure to only call ` +
                    `useSSRContext() conditionally in the server build.`);
        }
        return ctx;
    }
};

function isShallow(value) {
    return !!(value && value["__v_isShallow" /* ReactiveFlags.IS_SHALLOW */]);
}

function initCustomFormatter() {
    /* eslint-disable no-restricted-globals */
    if (typeof window === 'undefined') {
        return;
    }
    const vueStyle = { style: 'color:#3ba776' };
    const numberStyle = { style: 'color:#0b1bc9' };
    const stringStyle = { style: 'color:#b62e24' };
    const keywordStyle = { style: 'color:#9d288c' };
    // custom formatter for Chrome
    // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html
    const formatter = {
        header(obj) {
            // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
            if (!isObject(obj)) {
                return null;
            }
            if (obj.__isVue) {
                return ['div', vueStyle, `VueInstance`];
            }
            else if (isRef(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, genRefFlag(obj)],
                    '<',
                    formatValue(obj.value),
                    `>`
                ];
            }
            else if (isReactive(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, isShallow(obj) ? 'ShallowReactive' : 'Reactive'],
                    '<',
                    formatValue(obj),
                    `>${isReadonly(obj) ? ` (readonly)` : ``}`
                ];
            }
            else if (isReadonly(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, isShallow(obj) ? 'ShallowReadonly' : 'Readonly'],
                    '<',
                    formatValue(obj),
                    '>'
                ];
            }
            return null;
        },
        hasBody(obj) {
            return obj && obj.__isVue;
        },
        body(obj) {
            if (obj && obj.__isVue) {
                return [
                    'div',
                    {},
                    ...formatInstance(obj.$)
                ];
            }
        }
    };
    function formatInstance(instance) {
        const blocks = [];
        if (instance.type.props && instance.props) {
            blocks.push(createInstanceBlock('props', toRaw(instance.props)));
        }
        if (instance.setupState !== EMPTY_OBJ) {
            blocks.push(createInstanceBlock('setup', instance.setupState));
        }
        if (instance.data !== EMPTY_OBJ) {
            blocks.push(createInstanceBlock('data', toRaw(instance.data)));
        }
        const computed = extractKeys(instance, 'computed');
        if (computed) {
            blocks.push(createInstanceBlock('computed', computed));
        }
        const injected = extractKeys(instance, 'inject');
        if (injected) {
            blocks.push(createInstanceBlock('injected', injected));
        }
        blocks.push([
            'div',
            {},
            [
                'span',
                {
                    style: keywordStyle.style + ';opacity:0.66'
                },
                '$ (internal): '
            ],
            ['object', { object: instance }]
        ]);
        return blocks;
    }
    function createInstanceBlock(type, target) {
        target = extend({}, target);
        if (!Object.keys(target).length) {
            return ['span', {}];
        }
        return [
            'div',
            { style: 'line-height:1.25em;margin-bottom:0.6em' },
            [
                'div',
                {
                    style: 'color:#476582'
                },
                type
            ],
            [
                'div',
                {
                    style: 'padding-left:1.25em'
                },
                ...Object.keys(target).map(key => {
                    return [
                        'div',
                        {},
                        ['span', keywordStyle, key + ': '],
                        formatValue(target[key], false)
                    ];
                })
            ]
        ];
    }
    function formatValue(v, asRaw = true) {
        if (typeof v === 'number') {
            return ['span', numberStyle, v];
        }
        else if (typeof v === 'string') {
            return ['span', stringStyle, JSON.stringify(v)];
        }
        else if (typeof v === 'boolean') {
            return ['span', keywordStyle, v];
        }
        else if (isObject(v)) {
            return ['object', { object: asRaw ? toRaw(v) : v }];
        }
        else {
            return ['span', stringStyle, String(v)];
        }
    }
    function extractKeys(instance, type) {
        const Comp = instance.type;
        if (isFunction(Comp)) {
            return;
        }
        const extracted = {};
        for (const key in instance.ctx) {
            if (isKeyOfType(Comp, key, type)) {
                extracted[key] = instance.ctx[key];
            }
        }
        return extracted;
    }
    function isKeyOfType(Comp, key, type) {
        const opts = Comp[type];
        if ((isArray(opts) && opts.includes(key)) ||
            (isObject(opts) && key in opts)) {
            return true;
        }
        if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
            return true;
        }
        if (Comp.mixins && Comp.mixins.some(m => isKeyOfType(m, key, type))) {
            return true;
        }
    }
    function genRefFlag(v) {
        if (isShallow(v)) {
            return `ShallowRef`;
        }
        if (v.effect) {
            return `ComputedRef`;
        }
        return `Ref`;
    }
    if (window.devtoolsFormatters) {
        window.devtoolsFormatters.push(formatter);
    }
    else {
        window.devtoolsFormatters = [formatter];
    }
}

// Core API ------------------------------------------------------------------
const version = "3.2.47";

const svgNS = 'http://www.w3.org/2000/svg';
const doc = (typeof document !== 'undefined' ? document : null);
const templateContainer = doc && /*#__PURE__*/ doc.createElement('template');
const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null);
    },
    remove: child => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createElement: (tag, isSVG, is, props) => {
        const el = isSVG
            ? doc.createElementNS(svgNS, tag)
            : doc.createElement(tag, is ? { is } : undefined);
        if (tag === 'select' && props && props.multiple != null) {
            el.setAttribute('multiple', props.multiple);
        }
        return el;
    },
    createText: text => doc.createTextNode(text),
    createComment: text => doc.createComment(text),
    setText: (node, text) => {
        node.nodeValue = text;
    },
    setElementText: (el, text) => {
        el.textContent = text;
    },
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => doc.querySelector(selector),
    setScopeId(el, id) {
        el.setAttribute(id, '');
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(content, parent, anchor, isSVG, start, end) {
        // <parent> before | first ... last | anchor </parent>
        const before = anchor ? anchor.previousSibling : parent.lastChild;
        // #5308 can only take cached path if:
        // - has a single root node
        // - nextSibling info is still available
        if (start && (start === end || start.nextSibling)) {
            // cached
            while (true) {
                parent.insertBefore(start.cloneNode(true), anchor);
                if (start === end || !(start = start.nextSibling))
                    break;
            }
        }
        else {
            // fresh insert
            templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
            const template = templateContainer.content;
            if (isSVG) {
                // remove outer svg wrapper
                const wrapper = template.firstChild;
                while (wrapper.firstChild) {
                    template.appendChild(wrapper.firstChild);
                }
                template.removeChild(wrapper);
            }
            parent.insertBefore(template, anchor);
        }
        return [
            // first
            before ? before.nextSibling : parent.firstChild,
            // last
            anchor ? anchor.previousSibling : parent.lastChild
        ];
    }
};

// compiler should normalize class + :class bindings on the same element
// into a single binding ['staticClass', dynamic]
function patchClass(el, value, isSVG) {
    // directly setting className should be faster than setAttribute in theory
    // if this is an element during a transition, take the temporary transition
    // classes into account.
    const transitionClasses = el._vtc;
    if (transitionClasses) {
        value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(' ');
    }
    if (value == null) {
        el.removeAttribute('class');
    }
    else if (isSVG) {
        el.setAttribute('class', value);
    }
    else {
        el.className = value;
    }
}

function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = isString(next);
    if (next && !isCssString) {
        if (prev && !isString(prev)) {
            for (const key in prev) {
                if (next[key] == null) {
                    setStyle(style, key, '');
                }
            }
        }
        for (const key in next) {
            setStyle(style, key, next[key]);
        }
    }
    else {
        const currentDisplay = style.display;
        if (isCssString) {
            if (prev !== next) {
                style.cssText = next;
            }
        }
        else if (prev) {
            el.removeAttribute('style');
        }
        // indicates that the `display` of the element is controlled by `v-show`,
        // so we always keep the current `display` value regardless of the `style`
        // value, thus handing over control to `v-show`.
        if ('_vod' in el) {
            style.display = currentDisplay;
        }
    }
}
const semicolonRE = /[^\\];\s*$/;
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
    if (isArray(val)) {
        val.forEach(v => setStyle(style, name, v));
    }
    else {
        if (val == null)
            val = '';
        {
            if (semicolonRE.test(val)) {
                warn(`Unexpected semicolon at the end of '${name}' style value: '${val}'`);
            }
        }
        if (name.startsWith('--')) {
            // custom property definition
            style.setProperty(name, val);
        }
        else {
            const prefixed = autoPrefix(style, name);
            if (importantRE.test(val)) {
                // !important
                style.setProperty(hyphenate(prefixed), val.replace(importantRE, ''), 'important');
            }
            else {
                style[prefixed] = val;
            }
        }
    }
}
const prefixes = ['Webkit', 'Moz', 'ms'];
const prefixCache = {};
function autoPrefix(style, rawName) {
    const cached = prefixCache[rawName];
    if (cached) {
        return cached;
    }
    let name = camelize(rawName);
    if (name !== 'filter' && name in style) {
        return (prefixCache[rawName] = name);
    }
    name = capitalize(name);
    for (let i = 0; i < prefixes.length; i++) {
        const prefixed = prefixes[i] + name;
        if (prefixed in style) {
            return (prefixCache[rawName] = prefixed);
        }
    }
    return rawName;
}

const xlinkNS = 'http://www.w3.org/1999/xlink';
function patchAttr(el, key, value, isSVG, instance) {
    if (isSVG && key.startsWith('xlink:')) {
        if (value == null) {
            el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
        }
        else {
            el.setAttributeNS(xlinkNS, key, value);
        }
    }
    else {
        // note we are only checking boolean attributes that don't have a
        // corresponding dom prop of the same name here.
        const isBoolean = isSpecialBooleanAttr(key);
        if (value == null || (isBoolean && !includeBooleanAttr(value))) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, isBoolean ? '' : value);
        }
    }
}

// __UNSAFE__
// functions. The user is responsible for using them with only trusted content.
function patchDOMProp(el, key, value, 
// the following args are passed only due to potential innerHTML/textContent
// overriding existing VNodes, in which case the old tree must be properly
// unmounted.
prevChildren, parentComponent, parentSuspense, unmountChildren) {
    if (key === 'innerHTML' || key === 'textContent') {
        if (prevChildren) {
            unmountChildren(prevChildren, parentComponent, parentSuspense);
        }
        el[key] = value == null ? '' : value;
        return;
    }
    if (key === 'value' &&
        el.tagName !== 'PROGRESS' &&
        // custom elements may use _value internally
        !el.tagName.includes('-')) {
        // store value as _value as well since
        // non-string values will be stringified.
        el._value = value;
        const newValue = value == null ? '' : value;
        if (el.value !== newValue ||
            // #4956: always set for OPTION elements because its value falls back to
            // textContent if no value attribute is present. And setting .value for
            // OPTION has no side effect
            el.tagName === 'OPTION') {
            el.value = newValue;
        }
        if (value == null) {
            el.removeAttribute(key);
        }
        return;
    }
    let needRemove = false;
    if (value === '' || value == null) {
        const type = typeof el[key];
        if (type === 'boolean') {
            // e.g. <select multiple> compiles to { multiple: '' }
            value = includeBooleanAttr(value);
        }
        else if (value == null && type === 'string') {
            // e.g. <div :id="null">
            value = '';
            needRemove = true;
        }
        else if (type === 'number') {
            // e.g. <img :width="null">
            value = 0;
            needRemove = true;
        }
    }
    // some properties perform value validation and throw,
    // some properties has getter, no setter, will error in 'use strict'
    // eg. <select :type="null"></select> <select :willValidate="null"></select>
    try {
        el[key] = value;
    }
    catch (e) {
        // do not warn if value is auto-coerced from nullish values
        if (!needRemove) {
            warn(`Failed setting prop "${key}" on <${el.tagName.toLowerCase()}>: ` +
                `value ${value} is invalid.`, e);
        }
    }
    needRemove && el.removeAttribute(key);
}

function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
    // vei = vue event invokers
    const invokers = el._vei || (el._vei = {});
    const existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
        // patch
        existingInvoker.value = nextValue;
    }
    else {
        const [name, options] = parseName(rawName);
        if (nextValue) {
            // add
            const invoker = (invokers[rawName] = createInvoker(nextValue, instance));
            addEventListener(el, name, invoker, options);
        }
        else if (existingInvoker) {
            // remove
            removeEventListener(el, name, existingInvoker, options);
            invokers[rawName] = undefined;
        }
    }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
        options = {};
        let m;
        while ((m = name.match(optionsModifierRE))) {
            name = name.slice(0, name.length - m[0].length);
            options[m[0].toLowerCase()] = true;
        }
    }
    const event = name[2] === ':' ? name.slice(3) : hyphenate(name.slice(2));
    return [event, options];
}
// To avoid the overhead of repeatedly calling Date.now(), we cache
// and use the same timestamp for all event listeners attached in the same tick.
let cachedNow = 0;
const p = /*#__PURE__*/ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => (cachedNow = 0)), (cachedNow = Date.now()));
function createInvoker(initialValue, instance) {
    const invoker = (e) => {
        // async edge case vuejs/vue#6566
        // inner click event triggers patch, event handler
        // attached to outer element during patch, and triggered again. This
        // happens because browsers fire microtask ticks between event propagation.
        // this no longer happens for templates in Vue 3, but could still be
        // theoretically possible for hand-written render functions.
        // the solution: we save the timestamp when a handler is attached,
        // and also attach the timestamp to any event that was handled by vue
        // for the first time (to avoid inconsistent event timestamp implementations
        // or events fired from iframes, e.g. #2513)
        // The handler would only fire if the event passed to it was fired
        // AFTER it was attached.
        if (!e._vts) {
            e._vts = Date.now();
        }
        else if (e._vts <= invoker.attached) {
            return;
        }
        callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5 /* ErrorCodes.NATIVE_EVENT_HANDLER */, [e]);
    };
    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
}
function patchStopImmediatePropagation(e, value) {
    if (isArray(value)) {
        const originalStop = e.stopImmediatePropagation;
        e.stopImmediatePropagation = () => {
            originalStop.call(e);
            e._stopped = true;
        };
        return value.map(fn => (e) => !e._stopped && fn && fn(e));
    }
    else {
        return value;
    }
}

const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
    if (key === 'class') {
        patchClass(el, nextValue, isSVG);
    }
    else if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    }
    else if (isOn(key)) {
        // ignore v-model listeners
        if (!isModelListener(key)) {
            patchEvent(el, key, prevValue, nextValue, parentComponent);
        }
    }
    else if (key[0] === '.'
        ? ((key = key.slice(1)), true)
        : key[0] === '^'
            ? ((key = key.slice(1)), false)
            : shouldSetAsProp(el, key, nextValue, isSVG)) {
        patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
    }
    else {
        // special case for <input v-model type="checkbox"> with
        // :true-value & :false-value
        // store value as dom properties since non-string values will be
        // stringified.
        if (key === 'true-value') {
            el._trueValue = nextValue;
        }
        else if (key === 'false-value') {
            el._falseValue = nextValue;
        }
        patchAttr(el, key, nextValue, isSVG);
    }
};
function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
        // most keys must be set as attribute on svg elements to work
        // ...except innerHTML & textContent
        if (key === 'innerHTML' || key === 'textContent') {
            return true;
        }
        // or native onclick with function values
        if (key in el && nativeOnRE.test(key) && isFunction(value)) {
            return true;
        }
        return false;
    }
    // these are enumerated attrs, however their corresponding DOM properties
    // are actually booleans - this leads to setting it with a string "false"
    // value leading it to be coerced to `true`, so we need to always treat
    // them as attributes.
    // Note that `contentEditable` doesn't have this problem: its DOM
    // property is also enumerated string values.
    if (key === 'spellcheck' || key === 'draggable' || key === 'translate') {
        return false;
    }
    // #1787, #2840 form property on form elements is readonly and must be set as
    // attribute.
    if (key === 'form') {
        return false;
    }
    // #1526 <input list> must be set as attribute
    if (key === 'list' && el.tagName === 'INPUT') {
        return false;
    }
    // #2766 <textarea type> must be set as attribute
    if (key === 'type' && el.tagName === 'TEXTAREA') {
        return false;
    }
    // native onclick with string value, must be set as attribute
    if (nativeOnRE.test(key) && isString(value)) {
        return false;
    }
    return key in el;
}

function defineCustomElement(options, hydrate) {
    const Comp = defineComponent(options);
    class VueCustomElement extends VueElement {
        constructor(initialProps) {
            super(Comp, initialProps, hydrate);
        }
    }
    VueCustomElement.def = Comp;
    return VueCustomElement;
}
const BaseClass = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {
});
class VueElement extends BaseClass {
    constructor(_def, _props = {}, hydrate) {
        super();
        this._def = _def;
        this._props = _props;
        /**
         * @internal
         */
        this._instance = null;
        this._connected = false;
        this._resolved = false;
        this._numberProps = null;
        if (this.shadowRoot && hydrate) {
            hydrate(this._createVNode(), this.shadowRoot);
        }
        else {
            if (this.shadowRoot) {
                warn(`Custom element has pre-rendered declarative shadow root but is not ` +
                    `defined as hydratable. Use \`defineSSRCustomElement\`.`);
            }
            this.attachShadow({ mode: 'open' });
            if (!this._def.__asyncLoader) {
                // for sync component defs we can immediately resolve props
                this._resolveProps(this._def);
            }
        }
    }
    connectedCallback() {
        this._connected = true;
        if (!this._instance) {
            if (this._resolved) {
                this._update();
            }
            else {
                this._resolveDef();
            }
        }
    }
    disconnectedCallback() {
        this._connected = false;
        nextTick(() => {
            if (!this._connected) {
                render(null, this.shadowRoot);
                this._instance = null;
            }
        });
    }
    /**
     * resolve inner component definition (handle possible async component)
     */
    _resolveDef() {
        this._resolved = true;
        // set initial attrs
        for (let i = 0; i < this.attributes.length; i++) {
            this._setAttr(this.attributes[i].name);
        }
        // watch future attr changes
        new MutationObserver(mutations => {
            for (const m of mutations) {
                this._setAttr(m.attributeName);
            }
        }).observe(this, { attributes: true });
        const resolve = (def, isAsync = false) => {
            const { props, styles } = def;
            // cast Number-type props set before resolve
            let numberProps;
            if (props && !isArray(props)) {
                for (const key in props) {
                    const opt = props[key];
                    if (opt === Number || (opt && opt.type === Number)) {
                        if (key in this._props) {
                            this._props[key] = toNumber(this._props[key]);
                        }
                        (numberProps || (numberProps = Object.create(null)))[camelize(key)] = true;
                    }
                }
            }
            this._numberProps = numberProps;
            if (isAsync) {
                // defining getter/setters on prototype
                // for sync defs, this already happened in the constructor
                this._resolveProps(def);
            }
            // apply CSS
            this._applyStyles(styles);
            // initial render
            this._update();
        };
        const asyncDef = this._def.__asyncLoader;
        if (asyncDef) {
            asyncDef().then(def => resolve(def, true));
        }
        else {
            resolve(this._def);
        }
    }
    _resolveProps(def) {
        const { props } = def;
        const declaredPropKeys = isArray(props) ? props : Object.keys(props || {});
        // check if there are props set pre-upgrade or connect
        for (const key of Object.keys(this)) {
            if (key[0] !== '_' && declaredPropKeys.includes(key)) {
                this._setProp(key, this[key], true, false);
            }
        }
        // defining getter/setters on prototype
        for (const key of declaredPropKeys.map(camelize)) {
            Object.defineProperty(this, key, {
                get() {
                    return this._getProp(key);
                },
                set(val) {
                    this._setProp(key, val);
                }
            });
        }
    }
    _setAttr(key) {
        let value = this.getAttribute(key);
        const camelKey = camelize(key);
        if (this._numberProps && this._numberProps[camelKey]) {
            value = toNumber(value);
        }
        this._setProp(camelKey, value, false);
    }
    /**
     * @internal
     */
    _getProp(key) {
        return this._props[key];
    }
    /**
     * @internal
     */
    _setProp(key, val, shouldReflect = true, shouldUpdate = true) {
        if (val !== this._props[key]) {
            this._props[key] = val;
            if (shouldUpdate && this._instance) {
                this._update();
            }
            // reflect
            if (shouldReflect) {
                if (val === true) {
                    this.setAttribute(hyphenate(key), '');
                }
                else if (typeof val === 'string' || typeof val === 'number') {
                    this.setAttribute(hyphenate(key), val + '');
                }
                else if (!val) {
                    this.removeAttribute(hyphenate(key));
                }
            }
        }
    }
    _update() {
        render(this._createVNode(), this.shadowRoot);
    }
    _createVNode() {
        const vnode = createVNode(this._def, extend({}, this._props));
        if (!this._instance) {
            vnode.ce = instance => {
                this._instance = instance;
                instance.isCE = true;
                // HMR
                {
                    instance.ceReload = newStyles => {
                        // always reset styles
                        if (this._styles) {
                            this._styles.forEach(s => this.shadowRoot.removeChild(s));
                            this._styles.length = 0;
                        }
                        this._applyStyles(newStyles);
                        this._instance = null;
                        this._update();
                    };
                }
                const dispatch = (event, args) => {
                    this.dispatchEvent(new CustomEvent(event, {
                        detail: args
                    }));
                };
                // intercept emit
                instance.emit = (event, ...args) => {
                    // dispatch both the raw and hyphenated versions of an event
                    // to match Vue behavior
                    dispatch(event, args);
                    if (hyphenate(event) !== event) {
                        dispatch(hyphenate(event), args);
                    }
                };
                // locate nearest Vue custom element parent for provide/inject
                let parent = this;
                while ((parent =
                    parent && (parent.parentNode || parent.host))) {
                    if (parent instanceof VueElement) {
                        instance.parent = parent._instance;
                        instance.provides = parent._instance.provides;
                        break;
                    }
                }
            };
        }
        return vnode;
    }
    _applyStyles(styles) {
        if (styles) {
            styles.forEach(css => {
                const s = document.createElement('style');
                s.textContent = css;
                this.shadowRoot.appendChild(s);
                // record for HMR
                {
                    (this._styles || (this._styles = [])).push(s);
                }
            });
        }
    }
}

const getModelAssigner = (vnode) => {
    const fn = vnode.props['onUpdate:modelValue'] ||
        (false );
    return isArray(fn) ? value => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
    e.target.composing = true;
}
function onCompositionEnd(e) {
    const target = e.target;
    if (target.composing) {
        target.composing = false;
        target.dispatchEvent(new Event('input'));
    }
}
// We are exporting the v-model runtime directly as vnode hooks so that it can
// be tree-shaken in case v-model is never used.
const vModelText = {
    created(el, { modifiers: { lazy, trim, number } }, vnode) {
        el._assign = getModelAssigner(vnode);
        const castToNumber = number || (vnode.props && vnode.props.type === 'number');
        addEventListener(el, lazy ? 'change' : 'input', e => {
            if (e.target.composing)
                return;
            let domValue = el.value;
            if (trim) {
                domValue = domValue.trim();
            }
            if (castToNumber) {
                domValue = looseToNumber(domValue);
            }
            el._assign(domValue);
        });
        if (trim) {
            addEventListener(el, 'change', () => {
                el.value = el.value.trim();
            });
        }
        if (!lazy) {
            addEventListener(el, 'compositionstart', onCompositionStart);
            addEventListener(el, 'compositionend', onCompositionEnd);
            // Safari < 10.2 & UIWebView doesn't fire compositionend when
            // switching focus before confirming composition choice
            // this also fixes the issue where some browsers e.g. iOS Chrome
            // fires "change" instead of "input" on autocomplete.
            addEventListener(el, 'change', onCompositionEnd);
        }
    },
    // set value on mounted so it's after min/max for type="range"
    mounted(el, { value }) {
        el.value = value == null ? '' : value;
    },
    beforeUpdate(el, { value, modifiers: { lazy, trim, number } }, vnode) {
        el._assign = getModelAssigner(vnode);
        // avoid clearing unresolved text. #2302
        if (el.composing)
            return;
        if (document.activeElement === el && el.type !== 'range') {
            if (lazy) {
                return;
            }
            if (trim && el.value.trim() === value) {
                return;
            }
            if ((number || el.type === 'number') &&
                looseToNumber(el.value) === value) {
                return;
            }
        }
        const newValue = value == null ? '' : value;
        if (el.value !== newValue) {
            el.value = newValue;
        }
    }
};

const rendererOptions = /*#__PURE__*/ extend({ patchProp }, nodeOps);
// lazy create the renderer - this makes core renderer logic tree-shakable
// in case the user only imports reactivity utilities from Vue.
let renderer;
function ensureRenderer() {
    return (renderer ||
        (renderer = createRenderer(rendererOptions)));
}
// use explicit type casts here to avoid import() calls in rolled-up d.ts
const render = ((...args) => {
    ensureRenderer().render(...args);
});

function initDev() {
    {
        initCustomFormatter();
    }
}

// This entry exports the runtime only, and is built as
{
    initDev();
}

const _sfc_main = defineComponent({
  data() {
    return {
      firstname: "",
      name: "",
      activity: "",
      tel: ""
    };
  },
  methods: {
    copySignatureInClipBoard() {
      const htmlContentToCopy = this.$refs.htmlContent;
      if (!(htmlContentToCopy instanceof HTMLElement))
        return;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(htmlContentToCopy);
      if (!selection)
        return;
      selection.removeAllRanges();
      selection.addRange(range);
    },
    getCleanedEmptyString(value, placeholder) {
      if (value.length > 0)
        return value;
      return placeholder + " doit être rempli";
    }
  }
});

const _style_0 = ".v-mail-signature-generator[data-v-1c4e690b] {\n  --wcm-line-height: 20px;\n  --wcm-font-size: 18px;\n  max-width: 30em;\n  font-family: sans-serif;\n  min-height: calc(100vh - 200px);\n  padding-bottom: var(--wcm-line-height);\n  font-size: var(--wcm-font-size);\n  line-height: var(--wcm-line-height);\n  margin: auto;\n}\n.v-mail-signature-generator .v-mail-signature-generator__container[data-v-1c4e690b] {\n  padding: var(--wcm-line-height);\n  margin-bottom: var(--wcm-line-height);\n  background: white;\n}\n.v-mail-signature-generator .v-mail-signature-generator__container > *[data-v-1c4e690b]::-moz-selection { /* Code for Firefox */\n  color: lightseagreen;\n  background: #b0fdf6;\n}\n.v-mail-signature-generator .v-mail-signature-generator__container > *[data-v-1c4e690b] ::selection {\n  color: lightseagreen;\n  background: #b0fdf6;\n}\n.v-mail-signature-generator .v-mail-signature-generator__container > table[data-v-1c4e690b] {\n  pointer-events: none;\n}\nh1[data-v-1c4e690b] {\n  font-size: calc(var(--wcm-font-size) * 2);\n  line-height: calc(var(--wcm-line-height) * 2);\n}\n.v-mail-signature-generator__child-no-margin > *[data-v-1c4e690b]:first-child {\n  margin-top: 0;\n}\n.v-mail-signature-generator__child-no-margin > *[data-v-1c4e690b]:last-child {\n  margin-bottom: 0;\n}\n.fp-grid-container[data-v-1c4e690b] {\n  display: flex;\n  flex-wrap: wrap;\n}\n.fp-ui-form[data-v-1c4e690b] {\n  display: flex;\n  flex-wrap: wrap;\n}\n.fp-ui-form > input[data-v-1c4e690b] {\n  all: unset;\n  display: block;\n  position: relative;\n  width: 100%;\n  cursor: pointer;\n  box-sizing: border-box;\n  box-shadow: inset 0 0 0 2px currentColor;\n  padding: calc(var(--wcm-line-height) / 2);\n  margin-bottom: var(--wcm-line-height);\n}\n.fp-grid-coll-24-24[data-v-1c4e690b] {\n  width: 100%;\n}\n.fp-ui-button[data-v-1c4e690b] {\n  all: unset;\n  line-height: var(--wcm-line-height);\n  font-size: var(--wcm-font-size);\n  font-weight: 400;\n  margin: 0 auto;\n  cursor: pointer;\n  display: block;\n  box-sizing: border-box;\n  box-shadow: inset 0 0 0 2px currentColor;\n  padding: calc(var(--wcm-line-height) / 2) calc(var(--wcm-line-height));\n}";

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _withScopeId = (n) => (pushScopeId("data-v-1c4e690b"), n = n(), popScopeId(), n);
const _hoisted_1 = { class: "v-mail-signature-generator" };
const _hoisted_2 = { class: "fp-grid-container" };
const _hoisted_3 = { class: "fp-grid-coll-24-24 v-mail-signature-generator__child-no-margin" };
const _hoisted_4 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("h1", null, [
  /* @__PURE__ */ createTextVNode("G\xE9n\xE9rateur"),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("de signature mail\xA0pour"),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("la Fondation\xA0Plaza")
], -1));
const _hoisted_5 = { class: "v-mail-signature-generator__content fp-ui-form" };
const _hoisted_6 = {
  dir: "ltr",
  ref: "htmlContent",
  style: { "width": "100%" }
};
const _hoisted_7 = { style: { "width": "100%", "font-family": "Helvetica, Arial, sans-serif", "font-size": "12px", "line-height": "15px", "color": "black" } };
const _hoisted_8 = {
  height: "auto",
  style: { "font-family": "Helvetica, Arial, sans-serif", "font-size": "12px", "line-height": "15px", "color": "black" }
};
const _hoisted_9 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("br", null, null, -1));
const _hoisted_10 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("tr", null, [
  /* @__PURE__ */ createBaseVNode("td", {
    height: "auto",
    style: { "font-family": "Helvetica, Arial, sans-serif", "font-size": "12px", "line-height": "15px", "font-weight": "normal", "padding-top": "15px", "color": "black" }
  }, [
    /* @__PURE__ */ createBaseVNode("strong", null, "Fondation Plaza")
  ])
], -1));
const _hoisted_11 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("tr", { style: { "padding-top": "15px" } }, [
  /* @__PURE__ */ createBaseVNode("td", {
    height: "auto",
    style: { "font-family": "Helvetica, Arial, sans-serif", "padding-top": "15px", "line-height": "15px", "font-size": "12px", "color": "black" }
  }, [
    /* @__PURE__ */ createTextVNode(" Rue Chantepoulet 1 "),
    /* @__PURE__ */ createBaseVNode("br"),
    /* @__PURE__ */ createTextVNode("1201 Gen\xE8ve ")
  ])
], -1));
const _hoisted_12 = {
  height: "auto",
  style: { "font-family": "Helvetica, Arial, sans-serif", "padding-top": "15px", "line-height": "15px", "font-size": "12px", "color": "black" }
};
const _hoisted_13 = ["href"];
const _hoisted_14 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("tr", null, [
  /* @__PURE__ */ createBaseVNode("td", {
    border: "0",
    cellpadding: "0",
    cellspacing: "0",
    height: "auto"
  }, [
    /* @__PURE__ */ createBaseVNode("img", {
      alt: "logo plaza",
      style: { "height": "47px", "margin-top": "15px" },
      src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgEASABIAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABAASAAAAAEAAQBIAAAAAQAB/+ICOElDQ19QUk9GSUxFAAEBAAACKEFEQkUCEAAAbW50clJHQiBYWVogB88ABgADAAAAAAAAYWNzcEFQUEwAAAAAbm9uZQAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1BREJFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKY3BydAAAAPwAAAAyZGVzYwAAATAAAABkd3RwdAAAAZQAAAAUYmtwdAAAAagAAAAUclRSQwAAAbwAAAAOZ1RSQwAAAcwAAAAOYlRSQwAAAdwAAAAOclhZWgAAAewAAAAUZ1hZWgAAAgAAAAAUYlhZWgAAAhQAAAAUdGV4dAAAAABDb3B5cmlnaHQgMTk5OSBBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZAAAAGRlc2MAAAAAAAAACkFwcGxlIFJHQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAA81EAAQAAAAEWzFhZWiAAAAAAAAAAAAAAAAAAAAAAY3VydgAAAAAAAAABAc0AAGN1cnYAAAAAAAAAAQHNAABjdXJ2AAAAAAAAAAEBzQAAWFlaIAAAAAAAAHm9AABBUgAABLlYWVogAAAAAAAAVvgAAKwvAAAdA1hZWiAAAAAAAAAmIgAAEn8AALFw/+4AE0Fkb2JlAGQAAAAAAQUAAklE/9sAhAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAgICAgICAgICAgIDAwMDAwMDAwMDAQEBAQEBAQEBAQECAgECAgMCAgICAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMEBAQEBAQEBAQEBAQEBAQEBAQEBAT/wAARCABeASwDAREAAhEBAxEB/8QBogAAAAYCAwEAAAAAAAAAAAAABwgGBQQJAwoCAQALAQAABgMBAQEAAAAAAAAAAAAGBQQDBwIIAQkACgsQAAIBAwQBAwMCAwMDAgYJdQECAwQRBRIGIQcTIgAIMRRBMiMVCVFCFmEkMxdScYEYYpElQ6Gx8CY0cgoZwdE1J+FTNoLxkqJEVHNFRjdHYyhVVlcassLS4vJkg3SThGWjs8PT4yk4ZvN1Kjk6SElKWFlaZ2hpanZ3eHl6hYaHiImKlJWWl5iZmqSlpqeoqaq0tba3uLm6xMXGx8jJytTV1tfY2drk5ebn6Onq9PX29/j5+hEAAgEDAgQEAwUEBAQGBgVtAQIDEQQhEgUxBgAiE0FRBzJhFHEIQoEjkRVSoWIWMwmxJMHRQ3LwF+GCNCWSUxhjRPGisiY1GVQ2RWQnCnODk0Z0wtLi8lVldVY3hIWjs8PT4/MpGpSktMTU5PSVpbXF1eX1KEdXZjh2hpamtsbW5vZnd4eXp7fH1+f3SFhoeIiYqLjI2Oj4OUlZaXmJmam5ydnp+So6SlpqeoqaqrrK2ur6/9oADAMBAAIRAxEAPwDcq/2eTrj/AJ878zv/AEh/5Wf/AGpvYW/rbYf9Gzdf+yC8/wCtPU8/8DzzX/03PIX/AI9nLv8A3suvf7PJ1x/z535nf+kP/Kz/AO1N79/W2w/6Nm6/9kF5/wBaevf8DzzX/wBNzyF/49nLv/ey69/s8nXH/Pnfmd/6Q/8AKz/7U3v39bbD/o2br/2QXn/Wnr3/AAPPNf8A03PIX/j2cu/97LorL/zy/wCW9E7xS9xbojkjdkkjfqLtJHR0JV0dG2oGV1YWIPIPsOn3c5FBIO6SV/5ozf8AQHUxL/d4ferdVdORLQoRUEbntxBB4EH6nIPXD/h87+W3/wA/l3L/AOik7R/+xT37/Xd5E/6Osn/OGb/oDq3/ACbu+9b/ANMFaf8Acy2//tp6NJD86usqmGKop+o/mTUU9RFHNBPD8IvlVLDNDKgeKWKVOp2SSKRGBVgSCDcexCOb9vYBl23dCDkEWF5/1p6h6T7uvN0TvFLztyIsikqytzZy6CCMEEHcqgg8R1xqvnd1dQ0tTXV3U3zHo6Kjp5qqsrKr4S/KinpaWlp42mqKmpqJuqEigp4IkLO7EKqgkkAe9NzhtyKzvt26BAKkmwuwABxJPg9bh+7nzhcTRW9vzpyK87sERE5r5dZmZjQKoG5EkkmgAyT0WKf+eP8Ay4aaaWnqe391U9RBI0U0E/UHakU0MqEq8csUm01eORGFiCAQfZAfdvkVSVbdJAwwQYZv+gOpdj/u8/vUzRpLDyNZtEwqrLue3EEHgQRc0IPS568/m8fCztzMybd6ozncfZ24IaWWtlwXXnxz7y3pmYqKHT5quTGbb2Hkq1KWLUNUhQItxc+1dl7l8qbnKYNtmuriYCpSC2uJGp60WMmnQd5n+5D7+8kWKbpzptuxbRtjOI1uN03zaLWIseCiSe8jQsfIVqehr/2eTrj/AJ878zv/AEh/5Wf/AGpvZt/W2w/6Nm6/9kF5/wBaegB/wPPNf/Tc8hf+PZy7/wB7LpN7v/mLdE9fbbyu8d+7H+VWyNoYKGOpze6t3/Dv5M7a23h6eaohpIp8rnMz1hRYzHwy1VRHErTSorSOqg3YAsXPO+z2UEl1eWm4xWyCryS2V0qqOFSzQgDJ8+jXZPuue43M262exct8wcm7hvdyxS3s7HmfYJ55WCliscUW4PI5CqSQoJoCeA6Q/Wn82P4gdz1WVounqrvLtitwUFNVZyk60+M/fe+6rDUtbJLDR1OVp9r9f5WXHQVcsDrE8wRZGRgpJB9pLD3H5Y3VpF2t7u5ZAC4t7W4kKg8CdEZpWnn0IebPuXe+XIUNlcc9QcvbLBcsyW77tv2zWaysgBZYzcXsYcqCCQtSARXj0Ln+zydcf8+d+Z3/AKQ/8rP/ALU3sy/rbYf9Gzdf+yC8/wCtPQJ/4Hnmv/pueQv/AB7OXf8AvZdAhu/+b98Juvt3/wCj3fu4e39kb+142P8AuPu/47d4ba3f5MykMmHT+7WZ2JRZrXlY6iNqYeC86upTUGFym59zOU7K6+ivJ7mG8x+jLbXCv3fD2NGGz5Yz1IWyfce+8BzNsZ5n5b2vY9w5apIf3jY73tE9tSIkSnx4rx4qRlTr7u2hrSnQ3/7PJ1x/z535nf8ApD/ys/8AtTezb+tth/0bN1/7ILz/AK09R7/wPPNf/Tc8hf8Aj2cu/wDey6rO+Kn84X4F9RdH7c6/392huXC7swm5O0KjKYv/AEW9kVbUiZ/tXe248ask1JtmaATSYrLwO6atcTsUcK6sAAuXvc7k7bdpgsrzcZEuUeUsvgymmqZ2HBPQj7Oss/eP7jP3kedvcHdOZuW+TrS42W4tNvWGb94WChjDt1rA5Aa4BoJI2ANKMBUVBB6MfTfzxP5clbPHS0fbm7KupmJWKnpunu1Z55WALFY4YtpPI5CqTYA8D2eL7t8jOQqbnIWPACCY/wDPnUWTf3en3qLeN5rjkeySFcs77ntygfaTcgDoyeL+fPUmcx1FmMJ1f8v8xiMlTRVmOymL+FfykyGOr6SdQ8NVRV1J1VNTVVNMhurxsysOQfZ9HzltkyJLFt+5tGwqrLY3ZBHqCIaEdRRefdt522+6uLG/5u5HgvYnKSwzc1cvI6MMFXRtxDKwPEEAjqf/ALPJ1x/z535nf+kP/Kz/AO1N7v8A1tsP+jZuv/ZBef8AWnpN/wADzzX/ANNzyF/49nLv/ey69/s8nXH/AD535nf+kP8Ays/+1N79/W2w/wCjZuv/AGQXn/Wnr3/A881/9NzyF/49nLv/AHsugWzP83b4Xbd7Bh6l3Bmu5cF2pUZPDYWDrPM/HLvPGdgz5jcUdFLt/Ew7MrdhwbjkyediyVO1HAtMZapaiMxqwdblUvuXyrBejbZprpNxLKgt2tbgSamppGgx6qtUUFKmopx6H1j9yP383TlmTnXbNv2G55NWKWdt3g3zaJLIRQFhNIbpLwwCOEowkbXRCraiKGg0/wCzydcf8+d+Z3/pD/ys/wDtTezX+tth/wBGzdf+yC8/609AH/geea/+m55C/wDHs5d/72XQYdl/zUfij0vBiaruKLv/AKnpc/NV0+Cqey/i78gtiQZqfHpBJXwYmbdPXeKjyU1FHVRNMsJdo1kUsAGFy+/9w+XNqETbp9bbK5IQ3Fpcx6qUrp1xCtK5p0L+U/uce9HP0l7DyK3LW9TWyq1ym08wbLeGIOSEMgt76QoHKkKWpWhpwPQS/wDD538tv/n8u5f/AEUnaP8A9inst/13eRP+jrJ/zhm/6A6Gv/Ju771v/TBWn/cy2/8A7ael/wBcfzdvhd3FnKrbPUea7k7T3JQ4qfO1u3+uPjl3nvjOUeDpauhx9TmarE7Z2Hk6+nxVPX5OmgeoeMQpNURIWDSICtsfcvlXdJmt9smuricLrKQWtxIwUEAsQkZIAJArwqR69Brmr7kXv5yLt8O7877dsWzbVJMLaO63XfNotImlZXdYlkuLyNGkZI3YKDqKqxAoppz7I/m5fDHpzMUW3u3cv3P1Xn8jjUzOPwfZHxw712PmK/Dy1VVQxZWixm59hYutqsbJW0M8KzojRGWF0DakYD197lcq7XKkG5y3VvMy61Se1uI2K1IqA8YJFQRX5dV5V+5L79c92NxufJFhsO87bFKYJbjat82i7iSUKrmN5Le8kRZAjq2kkGjA0oR0MUPzq6yqYYqin6j+ZNRT1EUc0E8Pwi+VUsM0MqB4pYpU6nZJIpEYFWBIINx7NBzft7AMu27oQcgiwvP+tPQFk+7rzdE7xS87ciLIpKsrc2cuggjBBB3KoIPEdZf9nk64/wCfO/M7/wBIf+Vn/wBqb3v+tth/0bN1/wCyC8/609U/4Hnmv/pueQv/AB7OXf8AvZdFqzX87P8Al6bbytfgtxdnb5wObxVVNRZTDZrpTtzF5XG1tO7RVFJX46u2fBV0dVBIpV45EV1YEEA+yGX3X5JgkeGfcJkmU0ZHgmBBHEEFKg9Sxt/93/8Aee3ayttx2vlDb7nb5kEkM9vuu2SRurCoZHS6KspGQQSD05bQ/nNfAzsHP0G1Nhb47L3vujKzLT4vbe0Ohu5dy5/JVDkKkFBh8NsqtyNZM7GwWONmJ/Hty290uTr2ZLazvJ5rhjRY4redmP2KsZJ6Sb59w77yHLG23O88ycu7Tt+zwrqmu77eNrghQDiXllu0RR8yR0YP/Z5OuP8AnzvzO/8ASH/lZ/8Aam9nX9bbD/o2br/2QXn/AFp6jL/geea/+m55C/8AHs5d/wC9l0UD51/Njq2q+OeRmyPX/wAntpYrCdv/ABe3bmtx79+J3yJ2JtTEYLZXyh6c3dnKrJ7o3Z1xiMDQSfwnCTLTRy1CSVlW0VNCHnmjjYM83817c2xuz2e4RxpdWkryTWdzGgWO7gdiXeJVHappU5NAKkgdTj93X7v/ADjD7pW0drzLyje3lxsXMFlb2u28x7JeXEk11y/ultCsdvbX0szjxJVLkKRGmqRyqKzAYOtf5s/w87mrcnjOn63u/tfI4Wlhrszj+tfjT3zvqtxNFUTGnp6zJ0m19gZSegpZ5wUSSVURnFgSePZnYe5HLG6vJHtj3dy6CrrBa3EhUHAJCRmg+3oDc2fcr99OQre0u+ebbl7ZbW4cxwS7tv2z2iSOoqyxtcXsYdgMkKSQMnoX/wDZ5OuP+fO/M7/0h/5Wf/am9mf9bbD/AKNm6/8AZBef9aegP/wPPNf/AE3PIX/j2cu/97LoEN6/zfvhN1tuobE7F3D2/sHe5SgkGzd6/HbvDa26jHlQpxbjb2c2JQ5cpkg4NOfDaYEaL39lN17mcp2Fz9HfT3MN3j9KW2uEfPDtaMNnyxnqQtg+4994DmvZjzHyvtex7ly8C4N/Yb3tFxb1j/tB48N48VY/xd3b506G/wD2eTrj/nzvzO/9If8AlZ/9qb2bf1tsP+jZuv8A2QXn/WnqPf8Ageea/wDpueQv/Hs5d/72XXv9nk64/wCfO/M7/wBIf+Vn/wBqb37+tth/0bN1/wCyC8/609e/4Hnmv/pueQv/AB7OXf8AvZde/wBnk64/5878zv8A0h/5Wf8A2pvfv622H/Rs3X/sgvP+tPXv+B55r/6bnkL/AMezl3/vZdHO9inqBuve/de697917r59P8ur4Q7c+fHyc7M6e3PvvN9e0G2+u959lQ5rA4mgzNZVVmH7B2RtePFyUuQqKaGOmmh3jJKZAxYNAoAsxthdyRylBzlzBuG2XF48CRwyTh0AYkrJGlKGmO+v5dfTT96L7we7fds9oOUOedn5ct9zubvc7XaWt7mR4lVZbK7uDIGQMSwNqFpwoxPl1d1/0DXdQ/8AeT3ZH/oCbY/+u3uWP9Yja/8Ao/3H/ONP8/XPr/k69zz/AOEi2n/sruP+tfWyLQwUm3MDSU1RWRxUGBxFPBPX1kkVNDHSYujSOSsqpXZYaeNIYC7sSFQXJNh7nVAsEKqzdiLQk4wBxPp1yonkn3TcZpY4Cbm4mLLHGCxLSNUKoGSSTQDietLb5m/Mz5HfzXfk3T/Fb4uvmE6Vkz1bgtn7VxNdU4bH7/osNOZcp2t2jWsKZjt+KGkNZS0lUv2+No0jtE9a8jSYrc080777jb+OXeXi37p1lI41JUSBTmaU47cVAOFFMaq174+w3sN7V/cx9o5feX3hSA8/i2S5vbydFlezeVaR7dt6d365LeG7odUshbuEKgLZJ09/wnG+P+L2pS/6d+5u094b6qIKaXIHrOfbWyto4qoemjNZQY+LcO2N35rNR09WXWOtlkovPGFY0kLEqB1tfsbssduv743S4luyBq8DTGgNMgakdmofM0r/AAjrFLnr+9Q9zbzeZv8AW55E2ew5dVmEX72E93cyKGOl3MNxbRRFloTGok0moErCh6Jb82/5G3YPxf29kfkH8Quy9575xPXss26shtXILHi+29m4zEmKtXc21tz7XGMpd0S4SNJJ6kQ0eMrKeKISQrUHWIwrzZ7R3vL8L71yxfyzRwHxDG2JkAzrR0oH08TQKQBUV6nz7v394dyz7v7na+2PvjylYbfd7oos47yKsm23UklV8C4t7jxGtxKSFXVJLGzNpcpjVZZ/Jf8A5mef+Wm2st0D3llIa/vXrXb8OZwm7ZiIqztLYVLPTY2qyGWRUWnk3lteqq6aOtlQq+Rp6iOoKGWOrlYee1fP03MkEuzbvIG3i3TWkp4yxggEny1oSK/xAg0qGPWJ339vulbb7KbtZe5Xt5ZtH7c7tcmC4slyu33jBpFSM11C1uFVzGDURMrR6tLRKDhfzdv+3cXym/8ADN2//wC/A2h7FHuV/wAqNzF/zRX/AKuJ1Bn3I/8AxKj2c/6WE3/aHc9aS/wi+VG+/hZ39sXvzbNNk63btJkpdtb7wME09Hjt87KrGoZN1bUlqSrUT5CKkkgraMyrKtJXxUs5QhADifylzFecqbzZ7zArGAN4cyDAkjNNaV4VpQj0ND19An3hPZzlz399teYvbbdpYY92eIXe23LAM9pdLrFvcBfjCFg0b0I1xmRARXH0U+uOxNm9t7C2j2b17naPcuyd84DHbl21m6FiYK/FZSnSop2aNws1LVw6jHUU8qpPTTo8UqrIjKM3rG9tdys7a/sphJaTIJI3HmCKj7D6g5Bwc9fLjzTyvvvJXMe98pcz7c9pzBt1y9pd28nFJI2KsKjDKaVVgSrKQykqQTpcfzdf+3va/wDa2+N//um2h7xY9y/+nmL/AKa1/wACdd7vuR/+IPS/80N9/wCrlz1u+e8suvny6+dn8LvirhPmf80B0FuHd2V2Ri9yVfZ2Wm3DhsdSZWvpX2zQZrOQwxUddPT07pVS0YjYlgVViRz7wj5V5ch5q5qOzT3LQxuZWLoASNAZuBxmnX1Ee/XvLuHsJ7BL7lbXskO4Xlqm3wLa3DtGjC4aKIksgLAqGqMZPV5+5/8AhNXsx8PWnZnyo3PTbgSlqHxy7n61xVbh6mtWItSU9a+K3PQVtFSzTALJNGtQ8StqWKQroaXLj2HtDE/0vMUgmodPiRKVJ8gaMCB88/Yeud+0f3sHMC31v+//AGcs32wuol+jvpElVa9zJ4kDozAZCnSCcFlrUVmbE7V+bH8kz5NUPXe/J6nL9dVtVBmdxdewZutyvVfbGxK2v/h1XuzYdVWU8X8A3P4safta9aWmyFJUQpBX08lOZaWUBWe481+1G/pY3jFrEkM8IYmGaMmheMkdr4waBgRRgRVTlrzHyb93/wDvAvaS55p5bjSDmqNDBa7m0SR7jt14ia1trxUY+Nb1k74y7xOrF4XWQLIu771z2BtXtfYOzOzdj5OPMbP39tjC7u21k4wF+7w2fx8GSoHli1M1PUrBUBZom9cMoZGAZSPeWdje2+42drf2kmq1mjWWNvVWFR9hocjy6+fDmnlreeTOZN+5S5htDBvm23ctldwn8MsLmNwD+JarVWGGFCMEdZ9+722/1rsbefYu7Kp6La+wtq7h3nuOrjj80tNgtsYmrzWWnih1KZpYqCikKoCC7AD8+93l3DYWl1fXLUt4Y2lc+ioCx/kOm+W9g3PmvmHYeV9lhEm8bleQ2FqhNA01xIsUYJ8gXcVPkM9fNu7R3x253V2L2v8AMGpxuVgGQ7noc3m9147zrjdo7031V7o3XsfAUtTJUS1NL9tjtnVi0ChnEEOOVSynxhsFNwu9z3W+3Hmdo2FboO8i1ojyF3jUGtRQIaegX7Ovqy5P5d5I5A5V5M9i4ruFjHsD29vZS08S5tbRbe3u5mUKFbU90hkwNTSk0PdT6F/xD77x/wAnvjR0z3tQGJZewdk43IZ2ngiMEFBu/HGXB72xdPEZqhkpsZu7F1sEV3YtFGrfn3mvyzvKcwbDte8JxniDOB5OO2QeeA4IHXzDe93tvde0Xuzz57c3VSu2bhJFbuxqXtnpLayE0HdJbSRscYJI8ui6/wAwz+XbtT+YNgusMFursncPXMXWWW3NlqOo2/hMbmpMrJuWjw9HNDUpkaqlWnSlXEKylLli5va3sk525ItudYdvhub94BbszAooauoAZqRSlOpR+7D96LevuyblzduWzcqWu6vu8EEEi3UskQjEDSMCvhq1S3iZrwp1pxfJb4Tbc6J/mCYn4Y4vfWbz+38jvrpLaD74r8VQ0mZjg7Xotm1dbWpiqeokojLiDul1iQyWk8ILEajbF/fuU4Nn51i5VjvHeBpoIvFYAN+sEJNBjt14+zrux7TfeC3b3G+7Lf8Av1ecu29tukO3btfDb4pHaInbmulRDIwD0l+nGo0xqNOHW158Av5RuxPgP3HuXuHbHce7ewq/cnWeZ61mwue21h8NR0tHmN07N3RJlI6rH11TNJUwzbOjiEZUKVnYk3UXyM5M9tbPk3dJ9zt90lneS3aAo6qoAZ0etQTnsp+fXGL7yv32+ZPvJ8i7TyNvHItjtltabtFuy3FtPLKzNFb3VuIyrqoCkXRavGqgefVIv/Cj3/srvpj/AMVww/8A783sz3E/vp/ysu1f88I/6uy9dBP7qv8A6cnz9/4tUn/aBY9bh2zP+PP2n/4bWC/91dL7ydtf9xrf/mmv+AdcMd9/5Le8/wDPXL/1cbrUx/mv/wAxruT5G98VnwT+I2Szn90qTc46y3TUbHnqaXcncvY9RVSYXM7RgykEtPKmw8LXO9A8EbR0+SqI5555JqT7fTjf7j88bpvm8NyfyzI/0wk+nkMNQ08tdLJXH6anFODGpJK067Ufcw+6zyJ7We28H3jPe+0t/wB8vafvezXcQrQbXYhRLFctGQwN5KgEgYgtEpREVJddTAfHP/hOV19HtWgy3ym7f3pX7yyOPjnq9ndPy4LBYPa9bLJr+yqN17jwe56ndMsFNZZHgosfCk5ZUaaNVkkOdj9jbIW6S8w7nK10y1MVtpVUPoXZXL49Aor6jPUae6f96dzO+83Nl7O8j2EWxRSlUvt8E001wgFNYt4JbdbcFuAaSVitCQjEqod/Lj/hPH/dXamT3z8OeyN2bpzeAo/4g3VPZsmFmz2e+zhnnqf7ob4wGO23QJmneOMUtBWY+NJWLf5ajBI2Rcy+yX09vJd8r38skyDV9PcadTUydEihBq9AV/23Qo9kv7z87xvNpy7768qWVnt1y/hfvnaBKIYdRAX6m0medzFQnXJHKSBT9EipC/8A5Kv8zrsHeO84vhT8ms7kc7uhYMrF09vndU1Qd2Gu27T1FVmerd31lav3OTqqWgoaioxdTVt93GaeWikeUNSRwrParn+9urocqb/Mz3ND9LNJXXVQS0Tk5JABKk5wVNe0ANff7+6NyxsOwt7/APtHt0VvsxaM77t1mB9MEnZVi3C2Ve2NWd1WZEGg61mULSVmsm/nY/8Absf5Mf8AlGf/AIIHqn2O/df/AJUDf/8Amx/2kw9Ypf3f/wD4lz7S/wDU0/7su49aX/wq+Uu/fhf37sXvzaUOQq8Rj6+fb29cBHUT0OM33smuNE26toVVSI5KV6kUz09ZSmRJRSZCCkqTGxjUHFjlTmG85V3qz3m2DGJW0SpkCSM01oTwrShHGjBTTHXev3/9neW/fv215i9td6kiS/liF1t9yVDyWd0mr6e5VahguoNG9CuuJpY9Q1Hr6LHWPZOze4uvNm9pdeZqm3Dsrfm3sbubbmWpXR1qcdk6dJ0jnRHc0uQo3LQVVO5EtLUxyQyBZEZRm/t9/a7pZWu4WUoe0mQSRsPMEV/IjgRxBqDnr5bubuVN+5G5n33k/mewe13/AG26ktLqBwQVeNiCQSBqRhRkYdroVZSVIPWl7/Ok/wC3qcH/AGqehv8A3HoPeLPup/08VP8AS2/+TrvX9wf/AMQ2n/5r7x/hfrd895ZdfPl1737r3Xvfuvde9+691737r3XvfuvdfPY/l+/OOi+AXyV7J7jrutqrtGHcuwd49Zrt+k3VFtCSjkzO/tmbpGYbJTbf3Is6U67NMBg8CFjUB/INGlsKuTObk5M3/cN0exNwJIXt9AfRTVIj6q6W4aKUp58evpz+8v8Ad5uPvLe0vKXIttzWmzyWm5Wu7G5ktzchhFZ3Vv4XhiaAgsbrVq1GmmmnNRc6f+FLu3vx8PM1f8X7yoR/vP8AopNvcp/6/Vv/ANMw/wDznH/WrrAv/k0zu3/hcrf/ALlL/wDew6t8/madk5naP8uP5J7624zY/I5jqSlw0ZKCqkpcf2XlMDszLIpCAeaPD7pnVZQB43tJxp9yZz9fS23I2/XcGJGttPrQSlUP/GXPWD/3SuVLDe/vT+1HLu6jxbSDe2nOdIZ7GOa6jrngZbdajzHb59VE/wDCbPqrbybV+SHeE9LR1G66jcG2eqsVWmQnIYnb1Jjk3dn6VIll0x0e4clW413Zku74xQrelx7jT2J26AW2+7uVBuS62ynzVQNbD7GJX/ees3f71znLdG3r2q9vY5pF2VLWfeZo6dkk7yG2hYmmWhjSUAA4ExqMjraE95A9cg+ve/de60futMAPit/PcxuyOuI6TD4CD5R1e0sXicaHrcfjti9wwS07bcjRfunWLD7c3r9uuslqaSnDOymMsMS7CH+rvvAlpYgLCNwMaquQI5h8Pn8KvT5Uzw6+hDm3cj7x/wB3Jdcwc1M8+5tygt7LPLRXe72xgROT2iss9rqNPjDEAEMAdmH+bt/27i+U3/hm7f8A/fgbQ9z37lf8qNzF/wA0V/6uJ1yY+5H/AOJUezn/AEsJv+0O561zv5ZPwrwHzi+B/wAw+tWhxlH2Vt/sfZO7Ont010elsFveh2hmRHjaisjZJoNv7upNWOyCnyRIssdUYpJqWACDuQOVYebeTuZ7AhRfJOklrIfwyBDgn+Fx2t+RoSB11L+9x7+7n93n7x/sZzYsksnKlztN1Zb7Zxn+2tHuo6uqmoM1s1JYjgkq0epVlepj/wCRd80c71D2Puf+Xv33LXbclqNz7hXqqm3Q8uOq9n9lYypqo969U1kGQRDQf3gqqOWpoadmh0ZiKeBUlnyCBT32h5qm2y+uOSt5JjJkb6YSYKSgnxITXhqIJAx3VGS3UV/3ifsJtvO/K2z/AHnfbZI7pFtITvL2YDrc2MiqbTcVKE6/BVlSRgGrAUclUgJJRf5uv/b3tf8AtbfG/wD9020PYa9y/wDp5i/6a1/wJ1Nv3I//ABB6X/mhvv8A1cuet3z3ll18+XWjD/Jb/wC3p+2f+oPvb/3lNze8Rvar/p4cP+luP+Ot19EP39//ABDjc/8AmptH/aRB1vPe8uevne6oe/4UJdW4HdvwqwfZVRR0X95+o+1dtz4jKzNItbFgd8xz7Z3HhaMLIsTx5XIfwqqmDKxtjlIIsbw/717dDc8qRX7KPqLa4Uqx46ZOxlH2nST/AKXro3/djc47lsnv/f8AKkU8n7o3vZp1nhWmgzWlLiCVsVBjTxkWhH9qQa16Eb+QvvbObt/l67TxeZlSan6+7J7H2TgHA/eGDOSo94xxVL2BkenyW76qNCSdMCxqOFAC72duprnkm2jlNVhnliT/AEtQ+fsLn8qdBb+8g5f27ZPvPb3d2CFZNz2qx3C5Hl43htbEqPIMlshPqxY+fQf/AM/75Hjqj4iYvpfD1hg3T8jN0xYSpREBki692PPjdybunjmWojkp5azMyYahIMciTUtXUKdJAPtD7z77+7eWY9qialxfSaD/AM04yGfzxVtI+YJ6E392l7V/1098Lvn2+g1bPytZm4Uk4N7diSC2BGkhgsYnk4gq6RnPRUvi3/L7i3h/I+7Ux9RgKabtPvGjznyN2tLJg6yXPRVXXjrP1hhKEi1bUNuTbu2aoUckKaPDuibSkqyMZA7y9yWLr2l3FGhB3G7DX0Z0nVWP+yUeZ1KhpTykPGuZl94vvNPsf94Tyddxbk68ncuyQ8q3iiVBCVvRp3CV/wAC+BPcJ4gY11Wa1KlRpkf8Jxvkgcjtruj4pZuqL1W3KqLujYMbI7P/AATLSYza2/6EztNoipcbmRh6iCJY7tLkqly3AA37G774lvuvLkrd0Z+qh/0rUSQfYG0kD1Y9U/vUfar6Td+Qvebb4aQ3aHYNyIOPGiElxZvSlS0kXjozVwIoxTraA95A9chetKf+Yd/2/X2x/wCJq+HP/un6j94qc7f9Pftv+euy/wAEPXfj7r//AMjo3r/pQcz/APVzcut1j3lX1wH60zP+FHv/AGV30x/4rhh//fm9me8W/fT/AJWXav8AnhH/AFdl67x/3Vf/AE5Pn7/xapP+0Cx62vt+bty2wPjNvPfeB+3/AI7srorcW7cL93GJqX+Lbb2BWZjHfcwkES0/3lGmtf7S3HvI28uZLPYbq7hp40Vo0iV4VWMsK/Ko64wcubLZcy+7Gw8u7lq/d1/zFBZXGg0bw57xYn0nybSxofXrVE/4Tu9a4ffPyw7b7Z3JDFls31l1lLPt+orTJLVUe5uws6uLrtwQt+lqv+AUWRpHZyTor2sCeVxy9kbCK85j3PcpwGmt7eqE8Q0jULfbpDD/AG3XZ3+9D5rvuXfZjkjkraXaHbt23cLcrHQK0FlD4iQn+j4zxOAPOIfYdzD3lJ1we697917rR/8A5qGAi+Lv82/Gdm9cRUeFrsvubpz5CUdNQI00UG7qjNwHcVTV0zu3kn3FujbFVkKqInTMa5uAr294l+4cI5f9yor+xAV3kgvQB/Hq7if9M6Fj616+hD7nO5P7v/clveUuankuLaC03Tlh3kNCbZYT4CqwAoILe4SJDxXwxmo62Lv52P8A27H+TH/lGf8A4IHqn3OHuv8A8qBv/wDzY/7SYeuW/wDd/wD/AIlz7S/9TT/uy7j1r6/yuPhft35w/C35r9XVKY2h7Bw+8er919Q7qr45ANvb8x+2t9rR09VUwMtRFgNzUzvjsgLTIkM61IhlmpoQIX9veVYObeVOa9uYKL1ZYpLaQ/hkCSUqf4WHa3HBrQkDrpn98L363T7vXv8AewHOMLSycsz2F/Zb5Zxkfr2b3FoXKq3aZoGAli+EllMetUkfox38jT5obj6W7S3L/L479mr9uxV259wU/V1HuhzRVGyO1MbWVMW7+r6iOuCPQRbqqqaaejpy6quaikijjefI+zz2j5pn2rcbjkreSUBkYW4kwY5QTrizw1kEgfxggZfqLP7w/wBhNq5+5P2n7zvtqkV00dnC28PZjWt3t8iqbbcFKV1m3VlWRqEmAqzMEg6Kj/Ok/wC3qcH/AGqehv8A3HoPYd91P+nip/pbf/J1Mv3B/wDxDaf/AJr7x/hfrd895ZdfPl1737r3Xvfuvde9+691737r3XvfuvdaS38inrXrntP5z90bf7O2BsnsbAUfQXY2ZpMJvzauC3fiKXL0/cHUVFT5Wmxu4KDIUUGSgoshUQpOqCVYp5EDBXYHFD2hsLHcOcN2hv7OKeEWcrBJkV1DCeEVAYEVoSK/M9fQF/eK81808n/d09v9z5S5l3Da9yk5ksYHuNuuJraVom2zcnMbSQujFCyKxUmhKqaVA622j8OPiIeD8VvjgQeCD0d1jz/66/vJP+rHLX/TPWP/ADgi/wCgOuKH+vn72/8AhYuav+5tf/8AbR1y+WXRdP8AIz4xd1dDw/a0c/YHXOc2/tySWVqLH47dFPSCv2VV1T08EzRYzG7ox9FLMqRteCNlA59+5k2hd82DddnFAZ4GRK4AelUJpXAcAn5de9lvcWX2t93OQPcd9bx7ZusN1dBRrd7ctoulUMRWSS3eRVJI7iDXrVT/AJH3ywxXxI+RPafxf76Z+v6DtfLUOCjrdzg4mHZXcGwqrM4pcBuRq+amjwsG4oK6ooZJpVJTIUtJG2hHd0x19peY4+Wt83Hl7eP0UuWCVkxomjLDS1aadVSKn8QUefXZT+8K9l7z3s9r+TveD23A3O42WB7ho7P9Q3W2XixSeNBoDGUwMiyBQcxPKwqVAO5z7ym64MdA339331l8Z+qd2dx9t7gp9v7Q2nj56qTVJAcnnMkIJpcdtrblDNNActuTNywmKkpkYF2uzFI0d1K953iw2HbrndNynCWsa1+bGmFUebN5D/J0O/bX235t92ec9l5F5K2xrrfL2UItAfDiSoDzzuAfDgiB1O5GBgAsQDqB/wArXYm8/nZ/NF3H8qNy4KSl2rsrfG6/kBvOWmNb/CsPuPO1mW/0Y7Nosn4JY3rKXO1MNRBBKyNUY7DVJvdSPeM3t5Z3XN/uDccxXENLeKV72WlaKzE+EgNOIYggHiqHruH98PmLYfu5/c+2n2a2ncQ+87ht9ty1YBtPiSwQrH9fdNHUEK0SsrMoIWW4jHn1sgfzdv8At3F8pv8Awzdv/wDvwNoe509yv+VG5i/5or/1cTrlV9yP/wASo9nP+lhN/wBodz1WH/wmu/5lD8nv/EkbE/8AeYy3uP8A2I/5Je//APPRH/xw9Zd/3r3/ACvPtF/0qbv/ALSI+gw/nvfCPM7F3Vgv5gvR0OQwddT5nblN3JPtr7uir9t7tx1RQ0uwu3aOromDY2Spq6elxtdOhh8eQSimGuapncF/vBynLZ3EPOu0BkcOoujHUFXBAjmBHCpAUnGdJ4knoX/3cn3grDmLZ9x+7L7hvFcWzwTvsK3el0nt3V2vNtZX+MBWeWNTqrGZkwsaA0q9yfJ3LfL75g9S937kxiYrd2ZqOhNv7yhgEK0NZunZ393ds5fN46OCOGOmodwzY0VyU4RRSmoMALiMO0VbpzBJzPzPtm7Tx6bljbpKBwLppVmHoGpWnlWnlXrPrkT2hs/Y72L549vdquzNskCbzdWDNXWtvdCaeKJySSzwh/DLV79OvBbSPoq+83uvly60Yf5Lf/b0/bP/AFB97f8AvKbm94je1X/Tw4f9Lcf8dbr6Ifv7/wDiHG5/81No/wC0iDree95c9fO91q0/8KCvmt17mtn7Z+G/X2ex+5d2Um9qPe/b9Vh69Kuj2im2qTKUGD2NkZKWR6d9xV2VyTVlZTMfJj1oIRIoecaMevenmuyltYOV7KZZLkSiW6KmoTSCFjNPxEmpH4aCvHrsN/dlewHM9hvu7e+3M22y2mytt7bfsaToVa5M7RvNdoGAYQJGnho4xKZG0miGtsP8oHoXJ/H74E9NYHcNBU4vdm/YMr23uegqjaalqd/Vf3+36eWAoklFUwbHgxSVED/uRVKyK1mBUSP7Z7NJsvJ21wzoVuZgbmRT5GQ1UfIiPTUeRr1hf9+H3ItPc37yPPm5bXcpNsu3NHslnInBls10TMDUhla7MxVhhkKkVGTrZ/zMt07u/mFfzS6X4+dXVNNUw7W3Dh/jdseoq4q7+EUORw2QravsndWZ/hVNlaw4nC7mqspJVVcMMrDE4xJNBCe4J5+uLnnb3DTZNvYERutjETWgKkmV2oCaKxapA+FQeurf3Stn2T7sP3O5/c/nCF1kvLaXmrcEQp4jxyoiWFvF4jRr4ksCwhEZh+tMVrnoe4P5AHz1pYIaam+TfTtPTU8UcFPTwb87mhggghQRxQwxR9frHFFFGoVVUAKBYcezpfZnnFQFXmG2CgUAEk+P+qfUayf3lv3bppJJpvaDfHldizM1ptZJJNSSTeVJJ4noj/XOE7J/lF/zLutKDtbLYavXZua2uu+M9tgZav23uTqrtLCxY3dOTwozFJt/IZF8LjcxVGPyxRKuXxf9pUuwRsYb72059sE3GRW8J08V46lWhmWjldQUnSGPH8S/LrIXmrcOVPvufdM5tueTbKeJr6C4O32134aTwbjt8pkt45fCaZE8V4krQkmCbyJxvyI6SokkbrJHIqvHIjB0dHAZXRlJVlZTcEcEe8xwQQCDjr5tGVlYqwIYGhB4g9aVP8w7/t+vtj/xNXw5/wDdP1H7xV52/wCnv23/AD12X+CHrvv91/8A+R0b1/0oOZ/+rm5dbrHvKvrgP1pmf8KPf+yu+mP/ABXDD/8AvzezPeLfvp/ysu1f88I/6uy9d4/7qv8A6cnz9/4tUn/aBY9bdabVw++uoU2TuGGSowG8et12rnIIpPFLPh9w7YGIycMcul/HJJRVbqGsbE3t7yW+niu9t+knFYZYPDcf0WSh/keuIp3i+5d52PMG2OF3Kx3X6y3YioEsM/iRkjFQHUY60r/gB21kP5WP8x3eXVnfkbYLaeRrMx0f2PmqikrBT4rG1uWx+X2H2ZQrP9hJLtqrqaOgrDVNE4OByM08cTvoX3iryZuT+3nPV1t28DRbMWtJ3INACwMcorTtJANf4GJA677feX5KtvvjfdW2DnL22YXO9xRxcw7Xboy6pHWN4rywamsCdVaRNFR/jMSIzAVPW8Xjclj8xj6DL4ivosricrRUuSxmTxtVBXY/I4+ugSpoq+graZ5aasoqymlWSKWNmSRGDKSCD7y1R0lRJYnDRsAyspqCDkEEYII6+ee6tbmxubmyvbaSG8hkaKaGVSjo6EqyOrAMrKwIIIBBFDnpj3tvbaPW+0twb737uLE7S2dtXG1GY3DuPOVkVDi8VjqYAyVFVUSkAamIREW8ksjKiKzsqlq7u7axtpry8nWO1jUs7uaAAeZPRjsHL+981b1tnLnLm1zXu+3kqwWtrbqXkkduCqo/aTwABJIAJ60hsfkMv/Np/m347c23sBlE60ye/dt5arilhenl290H1KuLgmyOaYyV0OIye6MdiwGQu8S5nMJAhIZR7xMSSX3I9yo7iCFvoGmVjX8NvDTLcdJcD7NbU6+gy6tbH7lX3JbvaN03KE82xbbPChUgifeNy8QhIsIZI7d5ONAfAgLngetlD+dj/wBux/kx/wCUZ/8Aggeqfc7+6/8AyoG//wDNj/tJh65R/wB3/wD+Jc+0v/U0/wC7LuPVb/8Awmo/5l98sP8Aw8uqv/dJvX2BvYf/AHB5j/5rRf8AHX6yp/vYv+Vp9mP+lfuH/V616SX8+X4RZbaufwPz/wCkqauw2Sx+SwGP7pl27JWUtfhc/QVNFSbA7ao5qQ6sdN9zFT4uvnjaEJUpQTKrSzVMvtL7w8py200POm0qySKyrdFKgqwIEcwpwzRWOM6TxJPR3/dw/eCsd423cvuz+4Msc9pNFNLsC3QVklhdXa821w3xjSWmiUhqoZ0JCrGvVHnyH+UmY+YXyX6o7o3RQDH70qsF01tTfPhSniocluzZ89LhMpn8bDSxwQU1HuMU8df9usca0klQ8C6kiWR4m3rmGTmfmDbN1uE03RSCOalKF0IUsKcA3GnlWnlXroT7Yeztl7F+0nO3IW0XXi7Alxul7t2osXS2uVaWOGQsSWeCpj1EkuFDmhYqPoxe84Ovlq697917r3v3XuiY/wCzydcf8+d+Z3/pD/ys/wDtTewt/W2w/wCjZuv/AGQXn/Wnqef+B55r/wCm55C/8ezl3/vZde/2eTrj/nzvzO/9If8AlZ/9qb37+tth/wBGzdf+yC8/609e/wCB55r/AOm55C/8ezl3/vZde/2eTrj/AJ878zv/AEh/5Wf/AGpvfv622H/Rs3X/ALILz/rT17/geea/+m55C/8AHs5d/wC9l1rXfyftmd1fEv5bdodsd5/F75c7V2Tujpbeuz8PkaL4r99bkqZtwZvszrPcuPo5cdt3YOTrYEkxO26t2lZBErRhS2plBgj2ytd15b5l3Hct35f3OO0ktZIlYWlwx1NLE4FFjJ+FTnh11e+/Fv3IPvT7I8ncle3fu/yRe8w2e/Wl9PFJzDs8CiGKwv4HYPPeRoaSToKA6iDWlAabKP8As8nXH/Pnfmd/6Q/8rP8A7U3ud/622H/Rs3X/ALILz/rT1yh/4Hnmv/pueQv/AB7OXf8AvZde/wBnk64/5878zv8A0h/5Wf8A2pvfv622H/Rs3X/sgvP+tPXv+B55r/6bnkL/AMezl3/vZdUb/wAy74m9E/MTNV/dPS3XXyz6v79qoIE3DDmvgx8uF2D2Y1MIaeGq3BJi+nqyv21uWChUr/Eaakq1rBGkc8GompSJOfeW9n5olfddqsdyt95IGvXt974ctMVakBKsB+IA1wCPProb90z3q9xvYqwtuQefuaOSt49tUYm1Nvzdy19ZYaqsVhEm5qk8Bf8A0J3QpUsj0HhmvjqTtX+ed8fsKmzOtdn/ADRn2pi6SPE4fHbl+M+/OxcTjcdRw/b0EG3Y+z+qs7kMHj6KIKIKeFaaJFUKY9I0+wVtu5e7uyxC1sLXdTbKNKrJaySgAYGnxYWKgeQFPs6yc525M/u7vcy/bf8AmzfOQk3qZzPPLab9Z2Ujux1OZzt+4xJK7mupm1kkkhq56Q2Z6B/mOfMzsbC1fzGofmFhtuY2reZ9w7y+MPyU3vTbeoa+opRmRsHrjr7rCbb9JlKinjDCnX+DUs5hVZKhAFPtHLs3PPNN9E3NC7mkCmuuW0upAoJGrw4o4tIJHl2g0yehFY+5X3V/YblbcIfYmfka43WVAotrDf8AYrRpnRW8L6y+vdwEzRqxpq/XddRKoc9bMnxD3R8Wvhb1DjOpOpOivmmtOsv8U3XuvKfB75Ty7m3xuaWJIqvP5+ri6jRNWhBHTU0YWno6dVjjX9TPPfLVxy9yrtke27btG66a6pJGsLvVI3mzHwf2DgBgdclfe/aPeL3853u+dudvcTkEylfBs7OHmzl4QWkAJKwwqdzPrV3NWdiWY8AEn/MP+QNN8gPhj3x091d0P8xs5v7fO28Rjtt4qq+GXybw1PWVdJu7buWnjlyeX6vo8dSKlDj5X1SyoCVsOSAU/O29LvPK28bZt+z7o95NGFjU2N2tSHU8WiAGB59HP3YPbKb209+vbjnnnD3G5Ft+W9uu5JbuZOaNglKq1tNGCI4twZ273AooPGvDojX8lPK77+GnXfee3/kB8cPl9tPKb23ptTM7dgx/xI+RG6ErKDF4PIUVbLJNtvrnJxUjRVE6gLKUZgbgEA+wh7UyXnK1ju8G9bHucUksqOgWzuXqApB+GI0z1kR9/wCsuXfffmn283T2z91OR72z2/b7i3uml5k2S3KvJMjqAJ76MtVQcioHn1cVvr5WdG9l7M3T17vnoP5h7i2dvTA5TbO5sHXfB75YfbZPC5ikloq+kd4uqY54WkgmOiWJ0liezoyuqsJQu+Y9ov7W4srvZ9ze1lQxyIbC8oVYUI/sesFuXfZn3E5T37Z+ZuXfcjka132wuY7u0uI+bOXNUcsTB0YV3Eg0IyCCCKgggkdaa2Z+CPyI65+ScM/XHxz+V+/enNrdp4PM7W3vL8Xe+MNksjsmjz9Bl6WXKYHMdeYzLU+dxuMHgrY1p/G9XDIadpIWjdsXJeT97sd+VrHY9ym2uO5V45vpLhSYwwYVVog2oDBxxBpUU67vWP3jPa/mr2mli5q90+S9t57vNmmt7zbxzBs8qJdtC8TCOaK9kiMMkndGS1QjLrCsGA3VP9nk64/5878zv/SH/lZ/9qb3lX/W2w/6Nm6/9kF5/wBaeuBH/A881/8ATc8hf+PZy7/3sutHDrrpf5+bV39Wd1/HXo35aYavnzO8Ytu9h9cdO9sLN9rV5PK4TN0tFmsRtiRAwZJ6OriD6o5UkikAdWUYkWO185216+7bHtG5I5d9E8EE3AkqwDBPtB/MdfQ1zRz592neeWbb2/8AdL3E5Kntlt7U3W17rum3U1LHHLEzRSXAPmroaUIKstQQejDZmr/nZ76xdbtrdVJ/MXOCycElJkqWt2F8koKGuo6mN4aikrkwW05qiqopYnIkidWjcHlT7O5X92LyNoLld88FhRgY7oAg8QdKVI6jCxt/7v3l27t922aX2t/eMLB4njvdiZ0ZSCrIZrkKrAjDAgj1HRtvgn/Lv6m6y3rhu2vmLsX5Sdm5jA1sWYwfUO1Pg78usvsOfKrHBU0lb2DmtwdJYyq3SuPrXkZ8TDSJQTzRRtNUVVO0tNIJOUOSNssLqLcuaLTcLiVDqS2jsL0x1wQZGaAF6H8IFCQKlhUGE/vGfeh525u2C/5J9i+YeT9osLmMwXG93nNvLUd4I6lWSyih3aRbfWgAEzOZFVmCJFIFkXYQ7c+ecGL6u7Cr+p+gPmTubtCm2duFuvMFU/Cr5MUFHkd6ti6mPbMWQrM31njsXT4xMw8L1TSzKBTq+kM2lWmrc+cVj2+9fbdm3STcBE3gIbG6AMlDoqWiAA1UrU8OuZHJP3cJbznDli2509yuRLTlB7+AbpcpzVsLslr4imcosV/JI0hiDBAqnuIrQVI17/5QnTG/Pjp8j97/ACI+Vfxz+WuGzeJ2nkcZ1wkXxO+Ru68hW7t3zVyw7r3UZdr9dZGnpJcftyGpomFUy+cZlmjVjGWSFfbParzY99u985j2PckmWMrB/id05LyHvfsiNKLUZ468cOunH34OfeXPdH2q5e9rvZn3S5Kn26a9SXdSeY9jtkS2tFBtrelxfIzB5ykg0V0+AAxGoA7Kf+zydcf8+d+Z3/pD/wArP/tTe54/rbYf9Gzdf+yC8/609cn/APgeea/+m55C/wDHs5d/72XVCf8AOo2FkfmVL0z2X8e/jz8t9xdl7MizWxt347I/EP5LbalyGxq53z23qyCs3D1pj8Qybbz5rkaNZBUS/wAWDBWSJikOe6tm/NP7rv8AZNk3J7+LVDKrWV0tYz3KQWiC9rV+fd8uukX3BOZLb2IHPvKfud7n8k2vKV+YtwsZYuZdhnCXaUhmUrBfvLWeHwyDTSPBoSCwrZ18GfmPunaXxT6Y2R8jPj58yNudubB2lTbE3DTUvw3+R2epa/H7Sllwm1cxFk9u9cZShqZsjtSjonqSzpL955iyAFSw/wCUeaLi25c2q03zZd0j3OGIQuBZXTAhO1GqsRBqgFfOtesRvvD+xOz717zc+8we1nuZyJdckbletuNq780bHCyPcgS3ERjnvo3UR3DSBMEaNNDxpSN8w+v+8u3f5qmE+UOxfi58t8n0zQ9m/HDclRuSo+LPfGNrVxHXeN68g3XUrt/IbCp86zUE2AqgkYp/JP4wYwwZSYn5nst33P3Fh5gs+XtybaluLWQyG0uAdMQj1nSYw2NJ8s+XXQT2L5l9vOSPua7n7Qcx+8HJMPPsu0b5apaLzDs8i+Levem2XxkvGhGsTJU6qLXuIoabNf8As8nXH/Pnfmd/6Q/8rP8A7U3ufP622H/Rs3X/ALILz/rT1yS/4Hnmv/pueQv/AB7OXf8AvZda1/8AOe2X3V8xPkR1rv8A6D+L/wAuN1bW230vjdn5avyHxW772xJBn6ffG+M1NRpRbi2BjaydEx2Zp38qIYiX0hiysBBHupa7rzPvdhebNy/uclvHaiJma0uE7vEkalGjB4MPl11e+4Tv3IPsX7Yc28te5Xu9yTZbxd7899BFFzDs9wDCbS0iDF4L2RQS8TChNcVpQiuxrtr5r7Axu3MBjqvpr5mx1VBhMVRVMY+EPyqcJUUtDBBMgdOp2RwsiEXBIP49zlBzXZJBCjbXumoIAf8AELziB/zR65Ybr7AczXW6blcw89chmGS4kkQ/1s5dFVZyQaHcqjB6rD/mTdMfG756YKm3Tiur/mF1v8gNr4qag2x2B/siPywqcTuPHxLLPRbT7Ao6TqZaqrw4q2tT18IkrMYJHZI6iO9M8f8APe1bFzjCtxHYbpBvUa0jm/d94VYeSSAQ1K14EZX0Iwcu/uo8++633b9yl2e85u5G3X2zvJhJebZ/W/lxZIHNA1zZs25aVl0/FG1I5qAMyNSRaaunMl/Oe+JYk2X0RtH5iPsfDz1dPisVH8bu3N29dvTzVctRPPt7aXbPUrtgIMhO7TMYsdQVBaQswVy3uLtrk90+W62mz225mzUkKv0szxUrXtSaHtrxwoPWeHPVp9wr3rK7/wC4298jLzFOqtNMd9222vQwUACa523cqTFAAorLItAAKinTR2Zsz+bV8ytwY7CfJvb3y+i2m+Qir5Tur449+Qdd4app4pljyVP1z1H1DWY5spHE7RxSQ4kSEyWaVFLMGr+19yeaZkh3+HcxbatX6lrceEpFciKGEiv2L+fS7lLfvuU+w+2XW4+0e5cjtvYiMa/R75sxvZVYiqNfbluauIyQCwM1MVCk0B2CvgPtr4s/Afr2v27srqT5rbv7A3WaWbsLtLMfBH5T0OX3LLRhvs8ZjMdH1dWx7c2vj3kd4aGOeZmldpJppn0lJp5Ng5d5NsXgtNt3WW9koZ7htvuwz04ADwTpQeQqfUk9cyvvJbt7x/eT5ntt05g515AseWrLUu2bPBzfy88UAb4pJHO4IZ7hwAGkKqKAKiqK1av5rHyU2/3T8DO7urNldRfKuPdu9cj05iNvJuv4lfIrZOFrMse9+samjxkm4919b4nB0uRy8tOKWhhknWSurpoaaBXnmjjZv3F32DdeTt226023cfqZWgVPEs7mNSfqIiBqeJVBalAK5JAFSQOlv3M/ajc+QfvIe33OPMHO3Jp2Tb4t0nujZcybHdyrH+6L9WkEFtfSzMkYbXIwUiONXkcqiMwKT/JOruwPhltDv/E/IH43fL3aVdvzcmwcjtmLH/En5D7oWtpMFjNzU2Sklk2311k46NoJslCAspQvqutwDYNe1D3vK1rvMW9bFucTzSRtHps7l6hQwPwxGnEcepr/ALwC35a9+d99tL72y91eR722220vIrsy8ybJb6GmkgaMAT30ZaoRsrWlM8ern95/LLpDsPaO5th716D+YW4tobxwWU21ubBZD4O/LBqPL4PNUc1BkqCo8XVMUyJU0k7LrjdJEJ1IysARKd1zJtN7bXFnd7Pub20qGORGsLyjKwoQf0fMdYFbD7Le4XLG97TzHsHuRyNa73Y3Ed3aXMXNvLmqOWJg8brXcSKqwBoQQeBBGOtMbe3wK+Q+xPkFXDqn44/LHfvTuB7Dx+T2fvKq+MHe+Hylds6LLUmTo/4vhsz13icnDncZQH7esVacRSVULtAXiZGbFq75O3qy3tv3bse5TbWk4aKU2lwpKVBFVaJTqAwcUqMY67z7B95H2w5k9sIP65+6nJe2893O1yQ31gm/7PLGl0Y2jbw5Yr6SMwyP3JVtQRgHAYEDde/2eTrj/nzvzO/9If8AlZ/9qb3lb/W2w/6Nm6/9kF5/1p64Bf8AA881/wDTc8hf+PZy7/3suvf7PJ1x/wA+d+Z3/pD/AMrP/tTe/f1tsP8Ao2br/wBkF5/1p69/wPPNf/Tc8hf+PZy7/wB7Lr3+zydcf8+d+Z3/AKQ/8rP/ALU3v39bbD/o2br/ANkF5/1p69/wPPNf/Tc8hf8Aj2cu/wDey6Od7FPUDde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3RPPgV/2S3sb/wAOvun/AN/l2T7DPJ//ACr9p/zUn/6vy9Tj947/AKe/zD/zxbX/AN2mx6OH7E3UHde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3RMfn1/2Tmn/AIsJ8Mv/AIMnoT2Fucv+SGP+e6x/7Trfqefu2f8AT0n/APFX5p/8lfeOjnexT1A3Xvfuvde9+691737r3Xvfuvde9+690Tz/AGf74df8/wB9qf8AnHuP/wCsnsM/1y5Z/wCjvH+xv+gepx/4Gz3y/wDCdXv+9Qf9bevf7P8AfDr/AJ/vtT/zj3H/APWT37+uXLP/AEd4/wBjf9A9e/4Gz3y/8J1e/wC9Qf8AW3r3+z/fDr/n++1P/OPcf/1k9+/rlyz/ANHeP9jf9A9e/wCBs98v/CdXv+9Qf9bek3/w5j8C/wDvKHrD/wA+Ff8A/W72n/r7yd/00Fv+0/5ujb/gTfvH/wDhIN4/5xp/0H1Nof5j/wAHMpKafGfJLr3IzqpdoaGbLVcqqPqxjp8VI4Uf1tb3dOeOUpDpj32Bj6LU/wCAdJ7n7rH3hLNBLee1W6RRk0DSCNRX7WkA6d/9n++HX/P99qf+ce4//rJ7d/rlyz/0d4/2N/0D0h/4Gz3y/wDCdXv+9Qf9bemib+Y98HKeuGLn+SXXsGSaWCBcdNNlo64z1IjNNCKR8UtQZagTJoXTd9Qte49tHnjlJX8Nt9gElaaTWueGKVz0uT7rH3hJbY3kftTujWmkt4qiMpRa6jqEmmi0NTXFDXp3/wBn++HX/P8Afan/AJx7j/8ArJ7d/rlyz/0d4/2N/wBA9If+Bs98v/CdXv8AvUH/AFt69/s/3w6/5/vtT/zj3H/9ZPfv65cs/wDR3j/Y3/QPXv8AgbPfL/wnV7/vUH/W3r3+z/fDr/n++1P/ADj3H/8AWT37+uXLP/R3j/Y3/QPXv+Bs98v/AAnV7/vUH/W3ppi/mO/B6avOLh+SPX0uTEksRx0UuXkrxLArvPEaRcUagSQrGxddN1Cm/wBD7aHPHKRfwxvsJk4aRqrjjilelr/dZ+8HHbC8k9qtzWzoG8UiMJRqAHUZNNDUUzmvTt/s/wB8Ov8An++1P/OPcf8A9ZPbv9cuWf8Ao7x/sb/oHpF/wNnvl/4Tq9/3qD/rb1Hq/wCYV8MKCnkq675A7MoqWEKZqmriz1PTxBmVFMk02GSNAzsALkXJA91bnTlZFLPvMQUcSdQH/HenYfuy+/FzKkFv7aX8kzfCiGFmPngCUk46Y/8AhzD4F/8AeUPWH/nwr/8A63e2f6+8nf8ATQW/7T/m6Mf+BN+8f/4SDeP94T/oPr3/AA5h8C/+8oesP/PhX/8A1u9+/r7yd/00Fv8AtP8Am69/wJv3j/8AwkG8f7wn/QfRevhV83fiptX44bNwm4O6Ns4zK0+4+2aqajmps7I6U+V7h39lsdNrgxEsTJV42uhmWzH0uL2Nx7JuVea+XrfY7WKbdI1kDzEijcDNIRwXzBB6kz38+7/7x7x7p77f7byFdy2bWu3Irq0IGqPbLONxQyA1V0ZTjiOjU/7P98Ov+f77U/8AOPcf/wBZPYh/rlyz/wBHeP8AY3/QPUO/8DZ75f8AhOr3/eoP+tvTTS/zHvg7XVTUNF8kevayuTy66Olmy9RVJ4W0zaqeHFPMvibhrj0n6+2l545SdtCb7AX9BUn9lOl033WPvCW0Iubj2q3OO3NKSOI1U14dxkAz5evTt/s/3w6/5/vtT/zj3H/9ZPbv9cuWf+jvH+xv+gekP/A2e+X/AITq9/3qD/rb17/Z/vh1/wA/32p/5x7j/wDrJ79/XLln/o7x/sb/AKB69/wNnvl/4Tq9/wB6g/629e/2f74df8/32p/5x7j/APrJ79/XLln/AKO8f7G/6B69/wADZ75f+E6vf96g/wCtvXv9n++HX/P99qf+ce4//rJ79/XLln/o7x/sb/oHr3/A2e+X/hOr3/eoP+tvXv8AZ/vh1/z/AH2p/wCce4//AKye/f1y5Z/6O8f7G/6B69/wNnvl/wCE6vf96g/629e/2f74df8AP99qf+ce4/8A6ye/f1y5Z/6O8f7G/wCgevf8DZ75f+E6vf8AeoP+tvXv9n++HX/P99qf+ce4/wD6ye/f1y5Z/wCjvH+xv+gevf8AA2e+X/hOr3/eoP8Arb17/Z/vh1/z/fan/nHuP/6ye/f1y5Z/6O8f7G/6B69/wNnvl/4Tq9/3qD/rb17/AGf74df8/wB9qf8AnHuP/wCsnv39cuWf+jvH+xv+gevf8DZ75f8AhOr3/eoP+tvXv9n++HX/AD/fan/nHuP/AOsnv39cuWf+jvH+xv8AoHr3/A2e+X/hOr3/AHqD/rb17/Z/vh1/z/fan/nHuP8A+snv39cuWf8Ao7x/sb/oHr3/AANnvl/4Tq9/3qD/AK29e/2f74df8/32p/5x7j/+snv39cuWf+jvH+xv+gevf8DZ75f+E6vf96g/629e/wBn++HX/P8Afan/AJx7j/8ArJ79/XLln/o7x/sb/oHr3/A2e+X/AITq9/3qD/rb0U/5rfNj4sbv6HXC7b7l21lsoO8fifmTR09Lnlk/hm2PlZ0tubPVl5sRFH48bgsRU1Li+opEQoLWBDnNfNXL1zs4ig3RGk+ss3oA3BLyBmPw+SqT+XU0ewPsF7w7J7jNf7ryJdw2n9XeY4NbNDTxLjl3dYIVxITWSaREHzYVoM9Gw/2f74df8/32p/5x7j/+snsR/wBcuWf+jvH+xv8AoHqF/wDgbPfL/wAJ1e/71B/1t69/s/3w6/5/vtT/AM49x/8A1k9+/rlyz/0d4/2N/wBA9e/4Gz3y/wDCdXv+9Qf9bevf7P8AfDr/AJ/vtT/zj3H/APWT37+uXLP/AEd4/wBjf9A9e/4Gz3y/8J1e/wC9Qf8AW3r3+z/fDr/n++1P/OPcf/1k9+/rlyz/ANHeP9jf9A9e/wCBs98v/CdXv+9Qf9bevf7P98Ov+f77U/8AOPcf/wBZPfv65cs/9HeP9jf9A9e/4Gz3y/8ACdXv+9Qf9bevf7P98Ov+f77U/wDOPcf/ANZPfv65cs/9HeP9jf8AQPXv+Bs98v8AwnV7/vUH/W3o4fsTdQd1737r3XvfuvdfPY/l+/Byi+fvyV7J6cruyarq6HbWwd49mLuCk2rFu+Sskw2/tmbWGHbGzbg22sCVC7yM5n87lTThPGdepcKuTOUU5z3/AHDa3vjbiOF7jWE110yImmmpeOuta+XDr6c/vL/eGuPu0+0vKXPVtyom8SXe5Wu0m2kuDbBRLZ3Vx4viCGckqbXTp0iuqurFCer5dfyH+3vjB1juLvTpnu2Dtug61wtbu7deH/upWdd74xGFwqfd5bO7Zlotz7noswmFxaTVlShnoahIIH8KzvZPYv5l9ntz5fsJ942rdhcpboZZF0GKRVXJZKM4bSKk5BoMV6x19kf7xzkj3e5u2v265+9vm2W43a4Sxs5/qFvbSSWU6Y4bgPBA8XiyFY1OmRSzDWUFT1bT/Iz+c/Y3yq6f7A6w7lzk+7OxOiKna0dDvbKVDz7h3fsbdkWaixDbimkUvlc7tuu27PTz5B3M1XBPTGfVUCWeeSPaPm6+5i2y92/dJjJfWZSkrfE8b6tOr1ZSpBbiQRXNScKv7w/7u3K3s1zzyzzdyHty2XK3MaXBk2+FaQ213bGIyiADEcM6TqyxAaUZZAlE0olUHzb/AO4gfqz/AMWP+Dn/AFr6Z9xzzb/0+jbf+e6w/wCsHWZ/3fP/AJGbzn/4qvNv/eU63M/eUnXBzr3v3XugT+SPdeC+OXQ3bPeW4/t3x3Wex85uaKiqppaaLM5mmpWh23t0VEMNRJBPuXcU9Lj4n0MFlqVJ4ufZTvu6w7Hs+5bvPTw7eFpKHGpgO1a5+JqL+fQ/9quQNx90/cfkv282rULvdtwhtDIgDGKJmrPPpJUEQQB5WFchD187jrPu3tfrLvrYnzIqEzGY3BS9212+arc2QXJJQbz3djMpid17/wABV5dJIfvJ8tjd2RJkoFn8v2uUXyWWVS2Edhu247fvNnzQwZphdmYyNWjuCHkUt5kh+4V4Nnj19Q/Nvt9yXzd7bcx+w8TQQba/LybclpH4Ze1tpI5LeymWMg6RHJbExMVprhOnKmn0jdlbvwPYOzdpb+2rWfxHa+99s4Hd+28gYnh++wO5cVSZrD1nhlCyxfc4+tjfSwDLqsefedVrcw3trbXlu2q3ljWWNvVWAZT+YPXyn7/sm5cs77vXLe8weFu+33c1jdRVB0TQSNFKtRg6XQiowegY+W/x9j+VHx07P+P8u7H2PF2VisZiZd1R4RdxyYiKg3Fhs9JLHhWy2DWtkqExJhUGqiEZk1nVp0MV8ybKOYdj3DZTc+CJ1CmTTq00ZW+Gq14U49D32U9zG9nPdHlD3LTZhuD7TPJOtmZfAEpeGWEAy+HLpAMmo9hrSmK1FAX/AEDRbd/7zDzX/ojqH/7a3uGf9YW3/wCmnf8A5wD/AK29dLP+Ts27f+ENtv8AubP/AN6/qgLsz4vY0fL6r+J3xr3rWd+V39/KLrHBbw/gdJtii3Ju9J1odxTUVLT5rP0lPtjb+TSojbImskp5aWkkqwywEWhjcOXoxzO3Lew3ZvH8YW6S6QoZ+DUAZgEU17q0oC3Drpbyj7wXZ9jYfen3Y2CPlu3/AHa+73FiJWnaC2I1wBmaKFmuJ4ypEWgMHdYqFwet6f8Alw4dtu/DXqTb7zrVPgq7tLDvVJGYlqWxncXYNE06xFnMazGDUFLEgG1z7y95Hi8DlfbYSalDKtfWk0g6+dX7018N099eddzWMotxHt84QmunxNss3pWgrStK9Kb53/IyD4p/EzuruxKmKDcG3NpVON2LG5omkqewt0Sxbb2UI6SvYRZCGhz+UhrKqFVkb7GmnfQwQj2/zhvg5d5b3Xdg1Jo4isPDMj9seDxoxBI9Aeir7uftbJ7ze9PIHt+Yi223d8su4ka6LZW4M91VkyheGNkRqgeI6CoJHWhj8NO8ty/FX5PdDfJKtiySYGg31Kc9WlIZpNw7LyUj7X7OpqX7smKorTt3O1So76dFUUcMrKGXDvlbdrjl3mDZt9cN4Im7z/FGeyWleJ0sfz6+kD349vNo95PaH3J9qLd4juUm3D6aPIEF1GBcWBbTkL40KVArVKggg0P0f6Kto8lR0mRx1XTV+Pr6aCtoa6iniqqOto6qJJ6WrpKqB5IKmmqYJFeORGZHRgQSD7znR1kVXRgyMKgjIIPAg+YPXyrzwT2s81rdQvHcxuY5I5AVZWU0ZWU0KspFCDkHB6k+7dNde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3RMfn1/2Tmn/iwnwy/+DJ6E9hbnL/khj/nusf8AtOt+p5+7Z/09J/8AxV+af/JX3jo53sU9QN1737r3Xvfuvde9+691737r3Xvfuvde9+691737r3XvfuvdaH/8or5W9I/D75hdtdl99bmrtq7PznT+/Ni43IUG3c9uaabcuT7Q61z9HRNQbdx+SrYYpMXtmsczMgiUxhSwZ1Bw/wDbXmPaeWOaNzv95uDHavbSQqwVn7jNEwFFBPBDnh19G332/Zn3B98vYrkjlL222iO93y33yz3GWKSeG3Agj2++hZ9c7xoSJLiMaQdRrWlAaW+/OP8AnrfF3NdBdmdafHMbu7J372ZsrcGxqXNZTaWU2ps/atBuzFVmCzGZr5NxNi87X5XH46ukejp4KJ4JKjQZZVRWR5M5t93+Xpdmv7DY/FuLyeJoQ7IURA4KljqoxIBwAKV4nrB77vX93T7w2PuVynzX7p/RbTy1tO4Q7i8ENzHc3Nw9tIs0cSCDxIUjd0AkZpAwWulSxBCb/wCE43QW8Nr7G72+Qm5MLkcTtzsuo2jsnrmrrY3pYtxUGz6nclXvDM0EMqrJWYqLMZGkooapLwtVUtXErF4ZAqf2N2a5t7PeN6niZYLgpFATjUELF2HqNRAB4VDDyPRt/eoe5Wx7xzH7c+2O038U+6bQlzuG6pGQxge6WBbaJyMLIYo3kZD3BHiYgBlqTP5t/wDcQP1Z/wCLH/Bz/rX0z7C/Nv8A0+jbf+e6w/6wdTx93z/5Gbzn/wCKrzb/AN5Trcz95SdcHOve/de61sv+FFvyUO1+puq/i7gcj4st2hmn7H35TU9TVQzpsjZs7Ue2MfXQxlKaqx24t4yyVKBy+mfAA6QdLe4J98N++n23buX4ZKSXD+PMATXw0woPkQz5+1Ourn91t7UDeeducfeDcrWtls9uNr212VSDd3Q1TuhNWV4LUBDSlVuaV4jovnen8vxdq/yLuq9wLg6eHtTr3K4/5T7omRKyryc+K7ZNJitw4dVRAlA2J6+yG3p8ihXxxtttiWvdmJN35L+n9otum8EDcYGG4ycSaTUDL8qRlC3/ADT6kz27+8yd5/vE+cNuO4M3Ju6QvydZqSqxiTbtUkEufj8S9S5WI1qRdDFMCwX+QX8jx298Op+o8vWio3Z8ctzzbVEbiVqiTYG7ZK7cmyKyeaSWRZPBW/xbGxIgQRU2NiW3IJGvs3vn7z5XO2yvW5sZDH8/DerRn9upfkFHWMv95P7Vnkf32Tnayt9Oy81WgvaimkXluEgu0AAFKr4MxJrqeZjXyF5fuXOuePVTH84P5xn4c/GasxWzcoaPu3u5Mtsjrh6Weop8htrGLSRJvPsKCam0PT1O2MfkIYaFxLHImUrqaVRIkMyiN/c7m3+q+wPHayU3a7rDBTiop3yY80BoP6RBzQ9Zqfcb+7z/AK+3u3b3m+2ev2+5fMe4bqHAKTvqJtbIhqgrcOjNIKEGGORSVZ0PVd3/AAn3+EJwmCzfzc7ExV8zuiLLbM6Op6+GKSSi28szUW9uwIPPTySw1mdrYXw9FNHLHItJDkFdXiqo29gj2X5S8GGbmy+j/VkrFaBvJeEkg9Cx7QfQN5MOsof7zP7wY3Dctv8Au+8rXlLCzMd/zC0RIDz012lmaEArChE8ikEF2gIIaJh1dr8Cv+yW9jf+HX3T/wC/y7J9yzyf/wAq/af81J/+r8vXPv7x3/T3+Yf+eLa/+7TY9UIf8KM/kfJkMv0p8Sdt1bVH2YbuLf1HRyQVDS5Sv/iG1uu8TLDAr1kNdS0Zy9U8DECSOtpZAp9DCGvfHfS8m1ctQNWn+NTAZyapEPWoGo0+Y66Tf3WXtWltZ8/+9m6whQ/+6LbXkBUCNNFxeygmilGbwEDDgY5VqMjqB/Ml+AEnUX8p34n19FhqmPfPxhWgqezlSlxhmpV74mp8h2S2RqaX/KKuPA9qVWNo6VkeULSsxcFRrSvPnJh23245cdIj9Xt9DcYGPqKGWpGTpmKgccft6UfdR+8uvO330fee3uL9Dy9zeXTaCWkox2gMlhoVu1TNtyyu4IWr0AoTpNr38l35Jj5D/Brr6gy2QWr3t0fJJ0zuhJJ6dquSg2vS0smxci9PEqTJS1GyKuhpRNICZ6qiqDqZgx9yN7V77+++UbFJHrd2n+KyetEA8M/YYyBXzIPWGP39vaj/AFr/ALxHM9xZWxTl/mEDfrMgNpD3DMLtAxqCy3ayPpHwpIgoAR1bH7kfrC7r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6Jj8+v+yc0/8WE+GX/wZPQnsLc5f8kMf891j/2nW/U8/ds/6ek//ir80/8Akr7x0c72KeoG697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3XutCn+VH8QOnvmr8uO1urO7YNyT7VwHU2+uwMem1s4cBkBuDFdmddbdpGmrBS1nloxjd1VYaLSNTlGv6bHDr265Z2vmvmbctu3ZZDbJbSTL4baTqEsSjNDijnr6Q/vme+PPXsD7Iclc4+30tom83O9We2Sm8h8ZPBksL6dgF1LRtdulDXhUefWzX1x/JD/l29eZRMxP1HmuwqyCeGoo4ux987lzmLpXheOQI+Cx1ZhMHlIJGj9cVfTVcbqSpXSbe58sfabkiykEp2xp2BqPHkdgP9qCqn8weuSXNP94N96Lmezaxj53g2yBlKudqtIIZGBBGJnSWaMiuDG6EGhBr1a1h8PiNvYnGYHAYvHYPBYWgpMVhsLh6GmxmJxOLx8EdLQY3GY6iigo6CgoqWJY4YYkSOONQqgAAe5FiiigjjhhjVIUUKqKAAAMAADAAHADrDO+vr3c7273LcryW43G4kaaeed2kkkkclneR3JZ3diSzEkkkkmvWm782/wDuIH6s/wDFj/g5/wBa+mfeL/Nv/T6Nt/57rD/rB13Z+75/8jN5z/8AFV5t/wC8p1uZ+8pOuDnXvfuvdaDXy3yPan80T+ZR2Rt3oyjh3pVVuXzex+p6GbOQ4rBr171LicgGzMOS3FU0dHiKDcAxNbmTG5iDVeSKIpkkAbDfmV9x9wefL6DaFErFmhtgWovhwg91WIADULfa3qevpM9krbk37n/3UOVd19xJ2sIUhi3HepFhMk31u5SJSIpArNI8PiRwVFaJFUkKpobTLfy8v57ufwWT2tne2u4c1tnNYitwGZ25lvmXX5HBZbBZGjkx2QwuTxFZ2JNj6/EV+PmeCamljeGWFyjKVJHsSS8ke780MlvNudy9u6lGRr4lSpFCpUyUKkYIOCOoVsvvQf3c227jabxt3JGx2+7W863MF1ByvGk0cyMHSWORbIOkiOAyuCGDAEEEdBL/ACnd/b1+DH8y7/QJ23SHblTv3JZT47dg4kzJX09Fu+srqeq2HXUdRS1S0NZHU7voqOlgrEMsTUGTkkjurg+y324vbrlDn39zbkuhpmNjMvEByQYyKGhq4AB9GJHHoa/fS5b2D7xP3TR7lckzfVRbbFHzRtk1CjNbKjLeIysutStszu0ZoRJCqtkU63ctx7iwe0NvZ7dm58rRYLbW18LlNxbhzeRmWnx+HweEoZ8llsrX1DemCix9BTSTSueFRCfx7yxnnhtoJrm4kCQRoXd2wFVRUkn0AFevn32ra9x3zc9u2XaLOS43a8njtbW3iGp5ZpXEccaKOLO7BQPMkdaOGVqewf51f8y6KmpGzGJ6sNd9nSSiCZX63+OWyclJNNXTLbI0uP3RuX753HkLU77gzCRXEOkLiRI177rc+hV1Lt1aD/hVtGePmA71+zW1OHX0M2cXLP3AvumPLOIJ+cjHrcVFL7fLuMAIPgZ7e30AYowtoC1Nda7xG09q7e2Ltbbeydo4qlwW1doYHEbY21hKIOKPEYHA0FPi8RjKXyvJL4KGgpY4k1MzFV5JNz7y2treC0t4LW2jCW8SCONBwVVFAB9gHXz1b1vG58xbxuu/73ePc7zfXMl3d3ElNUs0zmSSRqADU7sSaADOB0VD4NZGgxHxL2rlsrW0uNxeMz/eeRyWQrp46WioKCi7s7MqaytrKmZkhp6Wlp4meSRyFRFJJAHsO8pOkfLltJIwWNXnZmOAAJ5SST5ADqZfvCWtze+9G8WVnA8t3NbbTFFFGCzu77VYKqqoqWZmIAAySaDrSz3XgvkJ/NV+dndG8OiMDV5/dedy+b31t+KtzuK24No9ZbNrcVtjZLVmeqZsZjqGpxOI/hVKjqwllq3DAs7M3vFS4h3v3F5w3W52eEvcOzTJVguiJCEjq2ACBpHzPXfTZty9sfua/dz5B2P3H3FLbZ7eCLbroxwyT/U390klxd6YVEjusknjOQRQIKGgAHR3d3fy4P55nYG3Mrs7fnZXam9to52BKbN7V3d8wajcm3MzTRTxVUdPlcHmewK3GZCCOqp45FSaJ1EiKwFwCBbc8ie7l7BJa3m4XEts4o8ct6WVhxoVaQg5Hn1j7sn3q/7vDlndbPfeW+Udn2/e7Zi9veWPLKwTxMQVLRyxWayISpIqpBoSOB69/Ix7k3J8Z/nF2D8VOy4KnbLdrRZzYOZwWUmpaMYPuPqmpzFZiaesaoXUamakhzWKjiicGoq6uAAOQnvXtFuk+wc23vLl+pj+p1QsjUGmeEsQDX5a1+ZI69/eI8i7V7tfd65X95uUpFuxsxi3KC4hDN4u17isSyMun8IYwTEsO1Ecmmetz73lP1wV697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3XuiY/Pr/snNP/FhPhl/8GT0J7C3OX/JDH/PdY/9p1v1PP3bP+npP/4q/NP/AJK+8dHO9inqBuve/de697917r3v3Xuve/de697917onn+z/AHw6/wCf77U/849x/wD1k9hn+uXLP/R3j/Y3/QPU4/8AA2e+X/hOr3/eoP8Arb17/Z/vh1/z/fan/nHuP/6ye/f1y5Z/6O8f7G/6B69/wNnvl/4Tq9/3qD/rb17/AGf74df8/wB9qf8AnHuP/wCsnv39cuWf+jvH+xv+gevf8DZ75f8AhOr3/eoP+tvWrh/JX3Rgfjr8y+2uw+7MgvXmy890ZvzbWI3Bm4Kp6OuzuU7U6rzmPxsS4+CtqRUVOJwlXOupFXRA1yDYHHz2rmi2Pmnc77dm8C0e0kjV3BoWM0LAYqakKT+XXYL7/O1X/uj7C8k8rcgW53TmC25hs7ue1tyoZIY9u3CF5CXKLRZJUXBJqw8uto//AGf74df8/wB9qf8AnHuP/wCsnvIP+uXLP/R3j/Y3/QPXH3/gbPfL/wAJ1e/71B/1t69/s/3w6/5/vtT/AM49x/8A1k9+/rlyz/0d4/2N/wBA9e/4Gz3y/wDCdXv+9Qf9betRP+ZhvLdm7P5k27Pkr8bK2bP0u3ct0lu/rrf+JxlJXUFPu3rzZOxpaTIQ43ctC9HXnCbowVmhq6SWmleEq6SRkg408+3F1c893G/bCxdY2glgmUAgPGkdDRxQ6XXgQQaeY67c/dL2TY9k+6ls/tP7rwLbTXUO62O6bbM7o7W17dXYZDJAwZPFt5sMjq6hqgq1CMv/AA6b/OI/5/JmP/RLfHf/AO1f73/rg+6H/Rzf/nBbf9auq/8AAffcV/6YWD/uab3/ANt/Vz9b/Mjzf/DXGRrNy9jDenze3R1juLa1bg6LCwbc3JR7p3fujLbZp9wR0+0sJt7a2JqdobPyKZOFqbxKz0cerVK7apUfnmb/AFvnae98Xm2S3aMoFCsHdiuqiKqDQh1ClOA8+sCYPurbd/wYNrb7Vyv9B93y03eG8juJJWnga2treOcwlrmWa4kW5uUMLa9RAdqUUChEf5F1N0v8bM/3R3b8ht54nr3fOVxeL6z6/wANmkrZq0bZqKmm3LvTMvT47HZARRZDI4/E09NIZEb/ACWpUqQwPsHe0SbXsM267tvdysF2yi3hV610Eh3bAPEhQPsPWRv94ncc+e6+3che3/thsU26cuwTSbtuc9vpCfUBWgtYqu6VKRvOzihHfGa1HWxt/s/3w6/5/vtT/wA49x//AFk9zl/XLln/AKO8f7G/6B65Y/8AA2e+X/hOr3/eoP8Arb1q1/zm8HsPs35RbJ+SnxY3fR74yW7NsYeHfbbYfIxZTb2/euZaOg25uSRMrSUAhiye11x1PT+DWElxEjOFLrrx7904LTcOYbTfuXbgTSSRqJvDrVZIqBW7gOKaQKeanrsL9wzc+YeUfaDmH2n949kfb7Oyu5W24XgQxzWd8GeeAeGz1Mdx4rtqpUTqBUKaWEfzDvm1i/kn/LLwm3Nh7q+w727Gg6pHbfVuLo6qgy1IsPjruwcIDUxzU38Dh3Nj42TxVbSTUYQNdHkT2Neduak33kGKCznpvE4h+pt1BBHnIucadQ9cj8+sYvuwewN17Ufe2vt15k2fxPbnan3E7LvEzK8bVqllL2kN4pgcg1QBZK0yFPWvt8ae7fnH8P5t2VXx1rqzr2s3xFiYN0Vx696u3dkMjTYR66TG0kdfvvau56zHUcMuRld4aV4IpnKtKrtHGVhbYd05v5YNy2xsYGmoJD4cLkha0FZEcgZOBSvnwHXTb3Z5C+7t75JssXulAm6QbcZGs4/rdwtkRpdAkYpZ3FursQigM4YqKhSAzVNd/wAOm/ziP+fyZj/0S3x3/wDtX+xH/rg+6H/Rzf8A5wW3/WrqGP8AgPvuK/8ATCwf9zTe/wDtv6sQz/zbp6H+TLiOrtlbpk3N8muzsNufYe8cJh6T7HL7ep9/dlb0yvZGcyMS42kw8FNX7Zmq6ILRuhhnycTRBQnA3n5rC+1sW32lwZN/uEaGVFFCviSuZWOAoqtRjgWFOsXds9gHuPv433N+/wCzi09o9ouINysbidtcUxs7G1jsYUPiNKWScJJVwdSwsGqTmF/I0yHx/wDir19272R3pv7b+x+2uydxY7a+LwOaoK6oy+F682nTffJVRVuNo8h9tFuzceYmM9OShZcTSyMCChFPaNtn5dstzvt3u0h3KdxGqOCSsSCtagGmtmNR/RB6Uf3h8HuV7y8z8kcq+3XLlzuHJO02r3k1zA6rHLe3LaCpSRk1G2giXS2aGaRRTNb5P9n++HX/AD/fan/nHuP/AOsnuYf65cs/9HeP9jf9A9c4v+Bs98v/AAnV7/vUH/W3rU7/AJl1DicL/MAxfys+G+fx+76fOV+x+33rtqUb0sG1e3do5Cniy0VZQ5GCkepOeqcDS5eeVomiq6jI1CsGIe+OPPsSRc6R8x8ryiUOY7msYpomQ5qDSuoqGPqWPXaL7pl3d3/3Z732Z99ttksZLeO72MR3jajcbbcoxjKuhYL4ImeBQCCixRkUqOtqPaX8xf4lbi2ptjcGW7Xwm08rndvYXMZPauWp83Nlds5DJ42mra3b+TlpMM9LLkMNUztTTNExjaSMlSRb3kPbc7cuT29vNJuKxyOis0bBqqSASpotKqcHrjhvf3Xfena953bbLLk24vbO3upYIryAxCOdI3ZFmjDShgkqgOoOaEVz0of9n++HX/P99qf+ce4//rJ7f/rlyz/0d4/2N/0D0Wf8DZ75f+E6vf8AeoP+tvXv9n++HX/P99qf+ce4/wD6ye/f1y5Z/wCjvH+xv+gevf8AA2e+X/hOr3/eoP8Arb17/Z/vh1/z/fan/nHuP/6ye/f1y5Z/6O8f7G/6B69/wNnvl/4Tq9/3qD/rb17/AGf74df8/wB9qf8AnHuP/wCsnv39cuWf+jvH+xv+gevf8DZ75f8AhOr3/eoP+tvXv9n++HX/AD/fan/nHuP/AOsnv39cuWf+jvH+xv8AoHr3/A2e+X/hOr3/AHqD/rb17/Z/vh1/z/fan/nHuP8A+snv39cuWf8Ao7x/sb/oHr3/AANnvl/4Tq9/3qD/AK29e/2f74df8/32p/5x7j/+snv39cuWf+jvH+xv+gevf8DZ75f+E6vf96g/629e/wBn++HX/P8Afan/AJx7j/8ArJ79/XLln/o7x/sb/oHr3/A2e+X/AITq9/3qD/rb17/Z/vh1/wA/32p/5x7j/wDrJ79/XLln/o7x/sb/AKB69/wNnvl/4Tq9/wB6g/629e/2f74df8/32p/5x7j/APrJ79/XLln/AKO8f7G/6B69/wADZ75f+E6vf96g/wCtvXv9n++HX/P99qf+ce4//rJ79/XLln/o7x/sb/oHr3/A2e+X/hOr3/eoP+tvRT/mt82Pixu/odcLtvuXbWWyg7x+J+ZNHT0ueWT+GbY+VnS25s9WXmxEUfjxuCxFTUuL6ikRCgtYEOc181cvXOziKDdEaT6yzegDcEvIGY/D5KpP5dTR7A+wXvDsnuM1/uvIl3Daf1d5jg1s0NPEuOXd1ghXEhNZJpEQfNhWgz0bD/Z/vh1/z/fan/nHuP8A+snsR/1y5Z/6O8f7G/6B6hf/AIGz3y/8J1e/71B/1t69/s/3w6/5/vtT/wA49x//AFk9+/rlyz/0d4/2N/0D17/gbPfL/wAJ1e/71B/1t69/s/3w6/5/vtT/AM49x/8A1k9+/rlyz/0d4/2N/wBA9e/4Gz3y/wDCdXv+9Qf9bevf7P8AfDr/AJ/vtT/zj3H/APWT37+uXLP/AEd4/wBjf9A9e/4Gz3y/8J1e/wC9Qf8AW3r3+z/fDr/n++1P/OPcf/1k9+/rlyz/ANHeP9jf9A9e/wCBs98v/CdXv+9Qf9bevf7P98Ov+f77U/8AOPcf/wBZPfv65cs/9HeP9jf9A9e/4Gz3y/8ACdXv+9Qf9bejh+xN1B3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+690U/wCENBS43417Mo6LNYzcFPHuft90y2IizEOPnao7n7CqZoYo8/icHlBJQzTNTyl6ZEM0TGJpIikjh3lRFj2K1VZVdfEm7l1UzPIfxBTjgcceFRnqZvvAXM137rb9PPYS20ptNtBhnMRcadrslBJhkljo4AYUcnSRqCtVQbD2IuoZ697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuii/OLH0mT6BSkrc5i9uwf6d/iNVfxPMQ5qehM+P+WvSFfSY3x7fw+dyX3ucq6ZKGlb7f7dKqojaplp6YS1EQa5tRZNmCvMqD6yzOptVMXkBA7VY1YigxSpFSBUibfu93M1p7lPNb7fNdSf1b5lTwYDEHo/Le7I0lZpYU0QqxkcatZRGEaySaUY3XsS9Ql1737r3Xvfuvde9+691737r3Xvfuvdf/2Q=="
    })
  ])
], -1));
const _hoisted_15 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ createBaseVNode("p", null, [
  /* @__PURE__ */ createTextVNode(" Une fois le texte s\xE9lectionn\xE9 (le texte devient vert quand il est\xA0s\xE9lectionn\xE9), copi\xE9 le texte et collez-le dans votre"),
  /* @__PURE__ */ createBaseVNode("br"),
  /* @__PURE__ */ createTextVNode("outil de messagerie mail, dans les param\xE8tres pour les signatures\xA0automatiques. ")
], -1));
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", _hoisted_1, [
    createBaseVNode("div", _hoisted_2, [
      createBaseVNode("div", _hoisted_3, [
        _hoisted_4,
        createBaseVNode("form", _hoisted_5, [
          withDirectives(createBaseVNode("input", {
            type: "text",
            placeholder: "pr\xE9nom",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => _ctx.firstname = $event)
          }, null, 512), [
            [vModelText, _ctx.firstname]
          ]),
          withDirectives(createBaseVNode("input", {
            type: "text",
            placeholder: "nom",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => _ctx.name = $event)
          }, null, 512), [
            [vModelText, _ctx.name]
          ]),
          withDirectives(createBaseVNode("input", {
            type: "text",
            placeholder: "fonction",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => _ctx.activity = $event)
          }, null, 512), [
            [vModelText, _ctx.activity]
          ]),
          withDirectives(createBaseVNode("input", {
            type: "text",
            placeholder: "num\xE9ro",
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => _ctx.tel = $event)
          }, null, 512), [
            [vModelText, _ctx.tel]
          ])
        ]),
        createBaseVNode("div", {
          onClick: _cache[4] || (_cache[4] = (...args) => _ctx.copySignatureInClipBoard && _ctx.copySignatureInClipBoard(...args)),
          class: "v-mail-signature-generator__container"
        }, [
          createBaseVNode("div", _hoisted_6, [
            createBaseVNode("table", _hoisted_7, [
              createBaseVNode("tbody", null, [
                createBaseVNode("tr", null, [
                  createBaseVNode("td", _hoisted_8, [
                    createTextVNode(toDisplayString(_ctx.getCleanedEmptyString(_ctx.firstname, "pr\xE9nom")) + " " + toDisplayString(_ctx.getCleanedEmptyString(_ctx.name, "/ nom")) + " ", 1),
                    _hoisted_9,
                    createTextVNode(" " + toDisplayString(_ctx.getCleanedEmptyString(_ctx.activity, "fonction")), 1)
                  ])
                ]),
                _hoisted_10,
                _hoisted_11,
                createBaseVNode("tr", null, [
                  createBaseVNode("td", _hoisted_12, [
                    createBaseVNode("a", {
                      href: "tel:" + _ctx.tel,
                      style: { "text-decoration": "none" }
                    }, toDisplayString(_ctx.getCleanedEmptyString(_ctx.tel, "num\xE9ro")), 9, _hoisted_13)
                  ])
                ]),
                _hoisted_14
              ])
            ])
          ], 512)
        ]),
        createBaseVNode("button", {
          onClick: _cache[5] || (_cache[5] = (...args) => _ctx.copySignatureInClipBoard && _ctx.copySignatureInClipBoard(...args)),
          class: "fp-ui-button"
        }, "Selectionner le texte de signature"),
        _hoisted_15
      ])
    ])
  ]);
}
const MailSignature = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["styles", [_style_0]], ["__scopeId", "data-v-1c4e690b"]]);

function register() {
  customElements.define("mail-signature", defineCustomElement(MailSignature));
}

export { register };
