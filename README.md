# Reactive

**Simple and Powerful Signal implementation**

## Installation

```sh
npm i @dmytromykhailiuk/reactive
```

## Example of usage

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
