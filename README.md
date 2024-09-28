# Reactive

**Simple and Powerful Signal implementation**

## Installation

```sh
npm i @dmytromykhailiuk/reactive
```

## Example of usage

### Basic examples
```typescript
import { Signal, ComputedSignal, SignalEffect, DebouncedSignalEffect } from '@dmytromykhailiuk/reactive';

const a = new Signal(1);
const b = new Signal(2);
const c = new ComputedSignal(() => a.value + b.value);

console.log('ComputedSignal', c.value); 
// ComputedSignal 3

a.value = a.value + 1;
b.value = b.value + 2;
console.log('ComputedSignal', c.value); 
// ComputedSignal 6

const effect = new SignalEffect(() => console.log('SignalEffect', c.value));
// SignalEffect 6

a.value = a.value + 1;
// SignalEffect 7
a.value = a.value + 1;
// SignalEffect 8
b.value = b.value + 2;
// SignalEffect 10
b.value = b.value;

effect.destroy();

const debouncedEffect = new DebouncedSignalEffect(() => console.log('DebouncedSignalEffect', c.value));
// DebouncedSignalEffect 10

a.value = a.value + 1;
a.value = a.value + 1;
b.value = b.value + 2;


// DebouncedSignalEffect 14

```

### Ways to change the value of Signal
```typescript
const example = new Signal(1);

// Using setter of "value" field
example.value = 3; 
console.log(example.value); // 3


// Using "update" method
example.update(5); 
console.log(example.value); // 5


// Using "update" method with callback
example.update(prevValue => prevValue + 5);
console.log(example.value); // 10

```

### Alternative way to watch for Signal or Computed using "subscribe"
```typescript
const example = new Signal(0);

// using "subscribe" method
const unsub = example.subscribe((value) => console.log('subscribe', value));

example.update(2);
// subscribe 2
example.update(2);
example.update(4);
// subscribe 4
unsub();

// 

```
