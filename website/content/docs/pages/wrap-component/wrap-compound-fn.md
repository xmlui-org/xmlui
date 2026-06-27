# wrapCompound

`wrapCompound` is a specialization of `wrapComponent` for wrappers that want to hide XMLUI's value machinery from the React render component. Instead of receiving `initialValue`, `updateState`, and other XMLUI-facing props directly, the render component gets a smaller interface:

- `value`
- `onChange(newValue)`
- `registerApi(apis)`
- the rest of the forwarded props

That makes it a good fit for wrappers around third-party controls that already think in terms of controlled React state.

## When to use it

- Use `wrapCompound` when you want the wrapper to own value parsing, local value state, and callback freshness.
- Use it when the render component should be plain React with no XMLUI-specific imports or prop contract.
- Use it when `parseInitialValue` and `formatExternalValue` are useful boundary hooks.
- Do not use it just because a component has `didChange` or `initialValue`. Many stateful components, including built-in `Slider`, still use `wrapComponent`.

Current note: there are no built-in `wrapCompound` users in `xmlui/src/components` today. The real examples in this repo are extension components such as `Gauge` and `TiptapEditor`.

## Architecture

```text
SETUP

  metadata + config
          |
          v
  mergeWithMetadata
          |
          v
  wrapCompound(...)
          |
          v
  build StateWrapper
          |
          v
  createComponentRenderer(...)
          |
          v
  registered with the XMLUI engine
```

```text
RENDER

  XMLUI node + renderer context
              |
              v
      build wrapper props
              |
              v
  __initialValue / __value / __onDidChange /
  __registerComponentApi
              |
              v
      CallbackSync (outer)
              |
              v
     MemoizedInner (inner)
              |
              v
  RenderComponent(value, onChange, registerApi, ...)

  onChange(newValue)
        |
        +--> update localValue
        |
        +--> route through didChange path

  external XMLUI value changes
        |
        +--> sync back into MemoizedInner
```

## What it adds beyond `wrapComponent`

- **StateWrapper.** `CallbackSync` keeps callback refs current while `MemoizedInner` avoids re-rendering on every XMLUI evaluation.
- **Simplified render contract.** The render component works with `value`, `onChange`, and `registerApi` instead of XMLUI plumbing props.
- **Boundary hooks.** `parseInitialValue` converts the raw markup value into the native format; `formatExternalValue` normalizes values flowing back in from XMLUI state.
- **Same metadata-driven inference for most wrapper work.** Booleans, numbers, strings, events, callbacks, templates, renderers, renames, and exclusions are still inferred through `mergeWithMetadata`.

## Relationship to `wrapComponent`

The two wrappers are not competitors. `wrapComponent` is the base primitive; `wrapCompound` is a convenience layer for a narrower render-component shape.

Use this rule of thumb:

- If the native component already knows how to work with `value`, `initialValue`, `updateState`, and XMLUI-style callbacks, start with `wrapComponent`.
- If you want the wrapper to absorb that plumbing and hand the render component a simpler controlled-input interface, use `wrapCompound`.

## Example: Gauge

`Gauge` is a real `wrapCompound` example from `packages/xmlui-gauge`. The wrapper handles value normalization and XMLUI integration. The render component only worries about the Smart UI gauge element and its native `change` event.

```typescript
import { GaugeRender } from "./GaugeRender";
import {
  wrapCompound,
  createMetadata,
  d,
  dDidChange,
  dEnabled,
  dInitialValue,
} from "xmlui";

const COMP = "Gauge";

export const GaugeMd = createMetadata({
  status: "experimental",
  description: "`Gauge` wraps the Smart UI Gauge web component.",
  props: {
    initialValue: dInitialValue(),
    minValue: { valueType: "number", defaultValue: 0 },
    maxValue: { valueType: "number", defaultValue: 100 },
    analogDisplayType: d("Display type.", undefined, "string", "needle"),
    digitalDisplay: d("Show digital value display.", undefined, "boolean", false),
    enabled: dEnabled(),
  },
  events: {
    didChange: dDidChange(COMP),
  },
});

export const gaugeComponentRenderer = wrapCompound(COMP, GaugeRender, GaugeMd, {
  rename: {
    minValue: "min",
    maxValue: "max",
  },
  parseInitialValue: (raw, props) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 100;
    const val = typeof raw === "string" ? parseFloat(raw) : Number(raw);
    if (Number.isNaN(val)) return min;
    return Math.min(max, Math.max(min, val));
  },
  formatExternalValue: (value, props) => {
    const min = Number(props.min) || 0;
    const max = Number(props.max) || 100;
    const val = Number(value);
    if (Number.isNaN(val)) return min;
    return Math.min(max, Math.max(min, val));
  },
});
```

The corresponding render component is plain React. Its important props look like this:

```typescript
type Props = {
  value?: number;
  onChange?: (value: number) => void;
  registerApi?: (api: Record<string, unknown>) => void;
  min?: number;
  max?: number;
  enabled?: boolean;
};
```

That is the point of `wrapCompound`: the wrapper owns the XMLUI-specific state bridge, while the render component stays focused on the third-party control.
