"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebouncedSignalEffect = exports.SignalEffect = exports.ComputedSignal = exports.Signal = void 0;
let CURRENT_EXECUTION = null;
class Signal {
    _value;
    isDestoyed = false;
    observers = new Set();
    subscribers = new Set();
    constructor(_value) {
        this._value = _value;
    }
    get value() {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        if (CURRENT_EXECUTION && !this.observers.has(CURRENT_EXECUTION)) {
            this.registerObserver(CURRENT_EXECUTION);
        }
        return this._value;
    }
    set value(newValue) {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        if (JSON.stringify(newValue) === JSON.stringify(this._value)) {
            return;
        }
        this._value = newValue;
        this.trigger();
    }
    get __subscribers__() {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        return this.subscribers;
    }
    set __subscribers__(subscribers) {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        this.subscribers = subscribers;
    }
    get __observers__() {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        return this.observers;
    }
    set __observers__(observers) {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        this.observers = observers;
    }
    subscribe(callback) {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        const object = { callback };
        const subscribers = this.subscribers;
        subscribers.add(object);
        return () => {
            subscribers.delete(object);
        };
    }
    trigger() {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        this.subscribers.forEach(({ callback }) => callback(this._value));
        this.observers.forEach((observer) => observer.run());
    }
    registerObserver(observer) {
        this.observers.add(observer);
        observer.addDependency(this);
    }
    removeObserver(observer) {
        if (this.isDestoyed) {
            throw new Error('Signal already destroyed!');
        }
        this.observers.delete(observer);
    }
    destroy({ replaceSubscriptions = false, replaceObservers = false } = {}) {
        if (replaceSubscriptions) {
            this.subscribers = new Set();
        }
        else {
            this.subscribers.clear();
        }
        this.observers.forEach((observer) => {
            observer.removeDependency(this);
        });
        if (replaceObservers) {
            this.observers = new Set();
        }
        else {
            this.observers.clear();
        }
        this.isDestoyed = true;
    }
}
exports.Signal = Signal;
class ComputedSignal {
    callback;
    signalsFromArguments;
    isDestoyed = false;
    _value = null;
    observers = new Set();
    subscribers = new Set();
    dependencies = new Set();
    isInitialized = false;
    constructor(callback, signalsFromArguments = []) {
        this.callback = callback;
        this.signalsFromArguments = signalsFromArguments;
        this.run();
        this.isInitialized = true;
    }
    get value() {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        if (CURRENT_EXECUTION && !this.observers.has(CURRENT_EXECUTION)) {
            this.registerObserver(CURRENT_EXECUTION);
        }
        return this._value;
    }
    get __subscribers__() {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        return this.subscribers;
    }
    set __subscribers__(subscribers) {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        this.subscribers = subscribers;
    }
    get __observers__() {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        return this.observers;
    }
    set __observers__(observers) {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        this.observers = observers;
    }
    get __dependencies__() {
        return Array.from(this.dependencies);
    }
    registerDependencies(dependencies) {
        dependencies.forEach((dependency) => {
            dependency.registerObserver(this);
        });
    }
    run() {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        CURRENT_EXECUTION = this;
        if (!this.isInitialized) {
            this.signalsFromArguments.forEach((signal) => signal.value);
        }
        const newValue = this.callback();
        CURRENT_EXECUTION = null;
        if (JSON.stringify(newValue) === JSON.stringify(this._value)) {
            return;
        }
        this._value = newValue;
        this.trigger();
    }
    trigger() {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        this.subscribers.forEach(({ callback }) => callback(this._value));
        this.observers.forEach((observer) => observer.run());
    }
    addDependency(dependency) {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        this.dependencies.add(dependency);
    }
    removeDependency(dependency) {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        this.dependencies.delete(dependency);
    }
    subscribe(callback) {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        const object = { callback };
        const subscribers = this.subscribers;
        subscribers.add(object);
        return () => {
            subscribers.delete(object);
        };
    }
    registerObserver(observer) {
        this.observers.add(observer);
        observer.addDependency(this);
    }
    removeObserver(observer) {
        if (this.isDestoyed) {
            throw new Error('Computed already destroyed!');
        }
        this.observers.delete(observer);
    }
    destroy({ replaceSubscriptions = false, replaceObservers = false } = {}) {
        if (replaceSubscriptions) {
            this.subscribers = new Set();
        }
        else {
            this.subscribers.clear();
        }
        this.observers.forEach((observer) => {
            observer.removeDependency(this);
        });
        if (replaceObservers) {
            this.observers = new Set();
        }
        else {
            this.observers.clear();
        }
        try {
            this.dependencies.forEach((dependency) => dependency.removeObserver(this));
        }
        catch {
        }
        finally {
            this.dependencies.clear();
            this.isDestoyed = true;
        }
    }
}
exports.ComputedSignal = ComputedSignal;
class SignalEffect {
    callback;
    signalsFromArguments;
    isDestoyed = false;
    dependencies = new Set();
    isInitialized = false;
    constructor(callback, signalsFromArguments = []) {
        this.callback = callback;
        this.signalsFromArguments = signalsFromArguments;
        this.run();
        this.isInitialized = true;
    }
    get __dependencies__() {
        return Array.from(this.dependencies);
    }
    registerDependencies(dependencies) {
        dependencies.forEach((dependency) => {
            dependency.registerObserver(this);
        });
    }
    run() {
        if (this.isDestoyed) {
            throw new Error('Effect already destroyed!');
        }
        CURRENT_EXECUTION = this;
        if (!this.isInitialized) {
            this.signalsFromArguments.forEach((signal) => signal.value);
        }
        this.callback();
        CURRENT_EXECUTION = null;
    }
    addDependency(dependency) {
        if (this.isDestoyed) {
            throw new Error('Effect already destroyed!');
        }
        this.dependencies.add(dependency);
    }
    removeDependency(dependency) {
        if (this.isDestoyed) {
            throw new Error('Effect already destroyed!');
        }
        this.dependencies.delete(dependency);
    }
    destroy() {
        try {
            this.dependencies.forEach((dependency) => dependency.removeObserver(this));
        }
        catch {
        }
        finally {
            this.dependencies.clear();
            this.isDestoyed = true;
        }
    }
}
exports.SignalEffect = SignalEffect;
class DebouncedSignalEffect {
    callback;
    signalsFromArguments;
    isDestoyed = false;
    dependencies = new Set();
    timerId;
    isInitialized = false;
    debounceTime = 0;
    constructor(callback, signalsFromArguments = [], options = {}) {
        this.callback = callback;
        this.signalsFromArguments = signalsFromArguments;
        this.isInitialized = options.isInitialized ?? this.isInitialized;
        this.debounceTime = options.debounceTime ?? this.debounceTime;
        this.run();
        this.isInitialized = true;
    }
    get __dependencies__() {
        return Array.from(this.dependencies);
    }
    registerDependencies(dependencies) {
        dependencies.forEach((dependency) => {
            dependency.registerObserver(this);
        });
    }
    run() {
        if (this.isInitialized) {
            return this.runDebounce();
        }
        this.runCallback();
    }
    addDependency(dependency) {
        if (this.isDestoyed) {
            throw new Error('Effect already destroyed!');
        }
        this.dependencies.add(dependency);
    }
    removeDependency(dependency) {
        if (this.isDestoyed) {
            throw new Error('Effect already destroyed!');
        }
        this.dependencies.delete(dependency);
    }
    destroy() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        try {
            this.dependencies.forEach((dependency) => dependency.removeObserver(this));
        }
        catch {
        }
        finally {
            this.dependencies.clear();
            this.isDestoyed = true;
        }
    }
    runDebounce() {
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
        this.timerId = setTimeout(() => {
            this.runCallback();
            this.timerId = null;
        }, this.debounceTime);
    }
    runCallback() {
        if (this.isDestoyed) {
            throw new Error('Effect already destroyed!');
        }
        CURRENT_EXECUTION = this;
        if (!this.isInitialized) {
            this.signalsFromArguments.forEach((signal) => signal.value);
        }
        this.callback();
        CURRENT_EXECUTION = null;
    }
}
exports.DebouncedSignalEffect = DebouncedSignalEffect;
//# sourceMappingURL=index.js.map