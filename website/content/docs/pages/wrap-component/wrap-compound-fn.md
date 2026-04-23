# wrapCompound

`wrapCompound` creates a stateful XMLUI renderer that manages the full value lifecycle: `initialValue` parsing, local state, external value syncing, and automatic `updateState` calls on change. It extends everything `wrapComponent` does -- prop forwarding, event auto-tracing, resource URLs -- and adds state management via a `StateWrapper`.

**When to use it:** Components with `initialValue` and `didChange` -- Slider, TextBox, Select, DatePicker, ColorPicker, FileInput. If the component has a value that changes, use `wrapCompound`.

## Architecture

```
 SETUP (once, at registration time)
 ===================================

 SliderWrapped.tsx                  wrapCompound.tsx
 ────────────────                   ────────────────
 SliderWMd = createMetadata(...)    mergeWithMetadata(metadata, config)
       │                                │
       ▼                                ▼
 wrapCompound(                      auto-classifies props/events
   "SliderW",       ──────────►     (same as wrapComponent)
   SliderRender,                        │
   SliderWMd,                           ▼
   { parseInitialValue,             builds StateWrapper:
     formatExternalValue,             CallbackSync (outer, not memoized)
     rename, callbacks }                  └─► MemoizedInner (memoized)
 )                                              └─► SliderRender
       │                                │
       ▼                                ▼
 sliderWComponentRenderer           createComponentRenderer(type, metadata, renderFn)
       │                                │
       ▼                                ▼
 registered with XMLUI engine       registers renderFn with the engine


 RENDER (every time engine evaluates <SliderW .../>)
 ===================================================

 XMLUI markup              engine                    wrapCompound's renderFn
 ────────────              ──────                    ──────────────────────
 <SliderW                  parses node,              receives context
   minValue="0"     ──►    creates context    ──►      │
   maxValue="100"                                      ▼
   initialValue="50"                              builds props:
   onDidChange=                                   ┌────────────────────────────────┐
     "{(v)=>x=v}"                                 │ __initialValue ← extractValue  │
 />                                               │ __value ← engine state         │
                                                  │ __updateState ← engine         │
                                                  │ __onDidChange = (newVal) => {  │
                                                  │    pushTrace()                 │
                                                  │    updateState({value:newVal}) │
                                                  │    handler(newVal)             │
                                                  │    pushXsLog(value:change ...) │
                                                  │    popTrace()                  │
                                                  │ }                              │
                                                  │ min, max, step ← extractValue  │
                                                  └────────────────────────────────┘
                                                           │
                                                           ▼
                                                  <StateWrapper {...props} />


 INSIDE StateWrapper (React component tree)
 ===========================================

 CallbackSync (outer — renders every time, cheap)
 ┌─────────────────────────────────────────���───────────────────┐
 │ Receives __onDidChange, __updateState, etc. from renderer.  │
 │ Writes them into a stable ref (callbackRef).                │
 │ No DOM work — just keeps the ref current.                   │
 └────────────────────────────┬──────────────────────���─────────┘
                              │ passes callbackRef + value props
                              ▼
 MemoizedInner (inner — only re-renders when value/className change)
 ┌─────────────────────────────────────────────────────────────┐
 │ Owns localValue state (React.useState).                     │
 │ On mount: parseInitialValue("50") → [50], tell engine.      │
 │ On external change: formatExternalValue, setLocalValue.     │
 │ Provides stable onChange and registerApi via useCallback.   │
 │                                                             │
 │ onChange(newVal):                                           │
 │   setLocalValue(newVal)          ← update React state       │
 │   callbackRef.__onDidChange(53)  ← triggers trace + engine  │
 └────────────────────────────┬────────────────────────────────┘
                              │ passes value, onChange, registerApi
                              ▼
 SliderRender (plain React component — no XMLUI imports)
 ┌─────────────────────────────────────────────────────────────┐
 │ Receives: value=[50], onChange, registerApi, min, max, ...  │
 │ Renders: Radix UI <Slider.Root> with Radix props.           │
 │ On user drag: calls onChange(53).                           │
 │ On mount: calls registerApi({ focus, setValue, value }).    │
 └─────────────────────────────────────────────────────────────┘
```

## Why `mergeWithMetadata` enables progressive enhancement

Both `wrapComponent` and `wrapCompound` call `mergeWithMetadata` at setup time. It reads `valueType` annotations and event declarations from the metadata and auto-classifies them -- so the wrapper config only needs to specify exceptions. Here's what SliderW's config would look like without it:

```typescript
wrapCompound(COMP, SliderRender, SliderWMd, {
  booleans: ["enabled", "readOnly", "required", "autoFocus", "showValues"],
  numbers: ["minValue", "maxValue", "step", "minStepsBetweenThumbs"],
  events: {
    didChange: "onDidChange",
    gotFocus: "onGotFocus",
    lostFocus: "onLostFocus",
  },
  callbacks: { valueFormat: "valueFormat" },
  rename: { minValue: "min", maxValue: "max" },
  parseInitialValue: ...,
  formatExternalValue: ...,
})
```

Instead, `mergeWithMetadata` infers booleans, numbers, and events from the metadata, so the actual config is just:

```typescript
wrapCompound(COMP, SliderRender, SliderWMd, {
  callbacks: { valueFormat: "valueFormat" },
  rename: { minValue: "min", maxValue: "max" },
  parseInitialValue: ...,
  formatExternalValue: ...,
})
```

No `booleans`, no `numbers`, no `events` -- because the metadata already declares those types. This makes progressive enhancement incremental: add `valueType: "boolean"` to a prop's metadata and `mergeWithMetadata` picks it up automatically. The wrapper config never grows -- only the metadata does.

**What you get beyond wrapComponent:**

- **Value lifecycle.** The wrapper parses `initialValue`, maintains `localValue` state in React, syncs external value changes, and calls `updateState` automatically when the value changes.
- **parseInitialValue / formatExternalValue.** Optional hooks to transform values at the boundaries -- parse a string `"[10,90]"` into an array, clamp to min/max, normalize date formats.
- **StateWrapper (CallbackSync + MemoizedInner).** A two-component split that solves React.memo's stale-closure problem. The outer component (CallbackSync) always renders but does no DOM work -- it just updates a ref. The inner component (MemoizedInner) only re-renders when non-function props change. This keeps wrapped components performant even when XMLUI re-evaluates frequently.
- **Clean render component interface.** The React render component receives `value`, `onChange`, and `registerApi` -- no XMLUI imports needed.

## Example: SliderW

SliderW wraps a Radix UI slider. It uses `parseInitialValue` to parse string values and clamp to min/max, `formatExternalValue` to validate incoming values, `rename` to map XMLUI's `minValue`/`maxValue` to Radix's `min`/`max`, and `callbacks` for a custom `valueFormat` function.

```typescript
// SliderWrapped.tsx — exports sliderWComponentRenderer (registered with engine)

import { SliderRender } from "./SliderRender";     // plain React component
import {
  wrapCompound, createMetadata, d,
  dDidChange, dEnabled, dGotFocus, dInitialValue,
  dLostFocus, dReadonly, dRequired,
} from "xmlui";

const COMP = "SliderW";

// Metadata → consumed by wrapCompound, docs site, and IDE plugins.
export const SliderWMd = createMetadata({
  status: "stable",
  description: "SliderW — wrapCompound version of Slider.",
  props: {
    initialValue: dInitialValue(),
    minValue:  { valueType: "number", defaultValue: 0 },
    maxValue:  { valueType: "number", defaultValue: 10 },
    step:      { valueType: "number", defaultValue: 1 },
    enabled: dEnabled(),
    readOnly: dReadonly(),
    showValues: { valueType: "boolean", defaultValue: true },
    valueFormat: { valueType: "any" },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
});

export const sliderWComponentRenderer = wrapCompound(
  COMP,
  SliderRender,
  SliderWMd,
  {
    callbacks: { valueFormat: "valueFormat" },
    rename: { minValue: "min", maxValue: "max" },

    parseInitialValue: (raw, props) => {
      const min = Number(props.min) || 0;
      const max = Number(props.max) || 10;
      let val = raw;
      if (typeof raw === "string") {
        try { val = JSON.parse(raw); }
        catch { val = parseFloat(raw); }
      }
      if (val == null || (typeof val === "number" && isNaN(val))) val = min;
      const arr = Array.isArray(val) ? val : [val];
      return arr.map((v) =>
        Math.min(max, Math.max(min, Number(v) || min)));
    },

    formatExternalValue: (value, props) => {
      const min = Number(props.min) || 0;
      const max = Number(props.max) || 10;
      const arr = Array.isArray(value)
        ? value : value != null ? [value] : [min];
      return arr.map((v) =>
        Math.min(max, Math.max(min, Number(v) || min)));
    },
  },
);
```
