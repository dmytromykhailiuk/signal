export declare class Signal<T = any> {
    private _value;
    private isDestoyed;
    private observers;
    private subscribers;
    constructor(_value: T);
    get value(): T;
    set value(newValue: T);
    get __subscribers__(): Set<{
        callback: (_: T) => void;
    }>;
    set __subscribers__(subscribers: Set<{
        callback: (_: T) => void;
    }>);
    get __observers__(): Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>;
    set __observers__(observers: Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>);
    subscribe(callback: (_: T) => void): () => void;
    trigger(): void;
    registerObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void;
    removeObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void;
    destroy({ replaceSubscriptions, replaceObservers }?: {
        replaceSubscriptions?: boolean;
        replaceObservers?: boolean;
    }): void;
}
export declare class ComputedSignal<T = any> {
    private callback;
    private signalsFromArguments;
    private isDestoyed;
    private _value;
    private observers;
    private subscribers;
    private dependencies;
    private isInitialized;
    constructor(callback: () => T, signalsFromArguments?: Array<Signal | ComputedSignal>);
    get value(): T;
    get __subscribers__(): Set<{
        callback: (_: T) => void;
    }>;
    set __subscribers__(subscribers: Set<{
        callback: (_: T) => void;
    }>);
    get __observers__(): Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>;
    set __observers__(observers: Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>);
    get __dependencies__(): Array<Signal | ComputedSignal>;
    registerDependencies(dependencies: Array<Signal | ComputedSignal>): void;
    run(): void;
    trigger(): void;
    addDependency(dependency: Signal | ComputedSignal): void;
    removeDependency(dependency: Signal | ComputedSignal): void;
    subscribe(callback: (_: T) => void): () => void;
    registerObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void;
    removeObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void;
    destroy({ replaceSubscriptions, replaceObservers }?: {
        replaceSubscriptions?: boolean;
        replaceObservers?: boolean;
    }): void;
}
export declare class SignalEffect {
    private callback;
    private signalsFromArguments;
    private isDestoyed;
    private dependencies;
    private isInitialized;
    constructor(callback: () => void | Promise<void>, signalsFromArguments?: Array<Signal | ComputedSignal>);
    get __dependencies__(): Array<Signal | ComputedSignal>;
    registerDependencies(dependencies: Array<Signal | ComputedSignal>): void;
    run(): void;
    addDependency(dependency: Signal | ComputedSignal): void;
    removeDependency(dependency: Signal | ComputedSignal): void;
    destroy(): void;
}
export declare class DebouncedSignalEffect {
    private callback;
    private signalsFromArguments;
    private isDestoyed;
    private dependencies;
    private timerId;
    private isInitialized;
    private debounceTime;
    constructor(callback: () => void | Promise<void>, signalsFromArguments?: Array<Signal | ComputedSignal>, options?: {
        isInitialized?: boolean;
        debounceTime?: number;
    });
    get __dependencies__(): Array<Signal | ComputedSignal>;
    registerDependencies(dependencies: Array<Signal | ComputedSignal>): void;
    run(): void;
    addDependency(dependency: Signal | ComputedSignal): void;
    removeDependency(dependency: Signal | ComputedSignal): void;
    destroy(): void;
    private runDebounce;
    private runCallback;
}
