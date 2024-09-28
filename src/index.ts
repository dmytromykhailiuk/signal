let CURRENT_EXECUTION: ComputedSignal | SignalEffect | DebouncedSignalEffect = null;

type UpdateCallback<T> = (_: T) => T;

export class Signal<T = any> {
  private isDestoyed = false;
  private observers = new Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>();
  private subscribers = new Set<{ callback: (_: T) => void }>();

  constructor(private _value: T) {}

  get value(): T {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    if (CURRENT_EXECUTION && !this.observers.has(CURRENT_EXECUTION)) {
      this.registerObserver(CURRENT_EXECUTION);
    }
    return this._value;
  }

  set value(newValue: T) {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    if (JSON.stringify(newValue) === JSON.stringify(this._value)) {
      return;
    }
    this._value = newValue;
    this.trigger();
  }

  get __subscribers__(): Set<{ callback: (_: T) => void }> {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    return this.subscribers;
  }

  set __subscribers__(
    subscribers: Set<{
      callback: (_: T) => void;
    }>,
  ) {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    this.subscribers = subscribers;
  }

  get __observers__(): Set<ComputedSignal | SignalEffect | DebouncedSignalEffect> {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    return this.observers;
  }

  set __observers__(observers: Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>) {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    this.observers = observers;
  }

  update(input: UpdateCallback<T> | T): void {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    if (typeof input === 'function' && typeof this._value !== 'function') {
      this.value = (input as UpdateCallback<T>)(this._value);
    } else {
      this.value = input as T;
    }
  }

  subscribe(callback: (_: T) => void): () => void {
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

  trigger(): void {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    this.subscribers.forEach(({ callback }) => callback(this._value));
    this.observers.forEach((observer) => observer.run());
  }

  registerObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void {
    this.observers.add(observer);
    observer.addDependency(this);
  }

  removeObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void {
    if (this.isDestoyed) {
      throw new Error('Signal already destroyed!');
    }
    this.observers.delete(observer);
  }

  destroy({ replaceSubscriptions = false, replaceObservers = false } = {}): void {
    if (replaceSubscriptions) {
      this.subscribers = new Set();
    } else {
      this.subscribers.clear();
    }
    this.observers.forEach((observer) => {
      observer.removeDependency(this);
    });
    if (replaceObservers) {
      this.observers = new Set();
    } else {
      this.observers.clear();
    }
    this.isDestoyed = true;
  }
}

export class ComputedSignal<T = any> {
  private isDestoyed = false;
  private _value: T = null;
  private observers = new Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>();
  private subscribers = new Set<{ callback: (_: T) => void }>();
  private dependencies = new Set<Signal | ComputedSignal>();
  private isInitialized = false;

  constructor(
    private callback: () => T,
    private signalsFromArguments: Array<Signal | ComputedSignal> = [],
  ) {
    this.run();
    this.isInitialized = true;
  }

  get value(): T {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    if (CURRENT_EXECUTION && !this.observers.has(CURRENT_EXECUTION)) {
      this.registerObserver(CURRENT_EXECUTION);
    }
    return this._value;
  }

  get __subscribers__(): Set<{ callback: (_: T) => void }> {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    return this.subscribers;
  }

  set __subscribers__(subscribers: Set<{ callback: (_: T) => void }>) {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    this.subscribers = subscribers;
  }

  get __observers__(): Set<ComputedSignal | SignalEffect | DebouncedSignalEffect> {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    return this.observers;
  }

  set __observers__(observers: Set<ComputedSignal | SignalEffect | DebouncedSignalEffect>) {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    this.observers = observers;
  }

  get __dependencies__(): Array<Signal | ComputedSignal> {
    return Array.from(this.dependencies);
  }

  registerDependencies(dependencies: Array<Signal | ComputedSignal>): void {
    dependencies.forEach((dependency) => {
      dependency.registerObserver(this);
    });
  }

  run(): void {
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

  trigger(): void {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    this.subscribers.forEach(({ callback }) => callback(this._value));
    this.observers.forEach((observer) => observer.run());
  }

  addDependency(dependency: Signal | ComputedSignal): void {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    this.dependencies.add(dependency);
  }

  removeDependency(dependency: Signal | ComputedSignal) {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    this.dependencies.delete(dependency);
  }

  subscribe(callback: (_: T) => void): () => void {
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

  registerObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void {
    this.observers.add(observer);
    observer.addDependency(this);
  }

  removeObserver(observer: ComputedSignal | SignalEffect | DebouncedSignalEffect): void {
    if (this.isDestoyed) {
      throw new Error('Computed already destroyed!');
    }
    this.observers.delete(observer);
  }

  destroy({ replaceSubscriptions = false, replaceObservers = false } = {}): void {
    if (replaceSubscriptions) {
      this.subscribers = new Set();
    } else {
      this.subscribers.clear();
    }
    this.observers.forEach((observer) => {
      observer.removeDependency(this);
    });
    if (replaceObservers) {
      this.observers = new Set();
    } else {
      this.observers.clear();
    }
    try {
      this.dependencies.forEach((dependency) => dependency.removeObserver(this));
    } catch {
    } finally {
      this.dependencies.clear();
      this.isDestoyed = true;
    }
  }
}

export class SignalEffect {
  private isDestoyed = false;
  private dependencies = new Set<Signal | ComputedSignal>();
  private isInitialized = false;

  constructor(
    private callback: () => void | Promise<void>,
    private signalsFromArguments: Array<Signal | ComputedSignal> = [],
  ) {
    this.run();
    this.isInitialized = true;
  }

  get __dependencies__(): Array<Signal | ComputedSignal> {
    return Array.from(this.dependencies);
  }

  registerDependencies(dependencies: Array<Signal | ComputedSignal>): void {
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

  addDependency(dependency: Signal | ComputedSignal): void {
    if (this.isDestoyed) {
      throw new Error('Effect already destroyed!');
    }
    this.dependencies.add(dependency);
  }

  removeDependency(dependency: Signal | ComputedSignal): void {
    if (this.isDestoyed) {
      throw new Error('Effect already destroyed!');
    }
    this.dependencies.delete(dependency);
  }

  destroy(): void {
    try {
      this.dependencies.forEach((dependency) => dependency.removeObserver(this));
    } catch {
    } finally {
      this.dependencies.clear();
      this.isDestoyed = true;
    }
  }
}

export class DebouncedSignalEffect {
  private isDestoyed = false;
  private dependencies = new Set<Signal | ComputedSignal>();
  private timerId: NodeJS.Timeout;
  private isInitialized = false;
  private debounceTime = 0;

  constructor(
    private callback: () => void | Promise<void>,
    private signalsFromArguments: Array<Signal | ComputedSignal> = [],
    options: { isInitialized?: boolean; debounceTime?: number } = {},
  ) {
    this.isInitialized = options.isInitialized ?? this.isInitialized;
    this.debounceTime = options.debounceTime ?? this.debounceTime;
    this.run();
    this.isInitialized = true;
  }

  get __dependencies__(): Array<Signal | ComputedSignal> {
    return Array.from(this.dependencies);
  }

  registerDependencies(dependencies: Array<Signal | ComputedSignal>): void {
    dependencies.forEach((dependency) => {
      dependency.registerObserver(this);
    });
  }

  run(): void {
    if (this.isInitialized) {
      return this.runDebounce();
    }
    this.runCallback();
  }

  addDependency(dependency: Signal | ComputedSignal): void {
    if (this.isDestoyed) {
      throw new Error('Effect already destroyed!');
    }
    this.dependencies.add(dependency);
  }

  removeDependency(dependency: Signal | ComputedSignal): void {
    if (this.isDestoyed) {
      throw new Error('Effect already destroyed!');
    }
    this.dependencies.delete(dependency);
  }

  destroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    try {
      this.dependencies.forEach((dependency) => dependency.removeObserver(this));
    } catch {
    } finally {
      this.dependencies.clear();
      this.isDestoyed = true;
    }
  }

  private runDebounce(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.timerId = setTimeout(() => {
      this.runCallback();
      this.timerId = null;
    }, this.debounceTime);
  }

  private runCallback(): void {
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
