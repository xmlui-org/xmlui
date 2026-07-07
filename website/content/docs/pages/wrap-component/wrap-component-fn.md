# wrapComponent

`wrapComponent` is the default wrapper primitive. It turns XMLUI metadata plus a small config object into a component renderer that extracts props, wires events, renders templates, and forwards everything else to a React component.

Use `wrapComponent` first. Reach for `wrapCompound` only when you want the wrapper itself to hide XMLUI's value plumbing and present a simpler `value` / `onChange` / `registerApi` interface to the render component.

## When to use it

- Use `wrapComponent` for most wrappers, including simple visual components and many stateful ones.
- Use it when the native React component already works with XMLUI-style props such as `value`, `initialValue`, `updateState`, and `registerComponentApi`.
- Use it when `customRender` is enough to adapt prop names, layout, or callback wiring.
- Built-in `Slider` is a good counterexample to the old "stateful means wrapCompound" rule: it is stateful, but it still uses `wrapComponent`.

## Architecture

```text
SETUP

  metadata + config
          |
          v
  mergeWithMetadata
          |
          v
  wrapComponent(...)
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
       build props object
        |      |      |
        |      |      +--> templates / renderers
        |      +---------> resource URL resolution
        +----------------> events + semantic tracing
              |
              v
   forward remaining props via metadata
              |
              v
   render Component or call customRender
```

## What you get for free

- **Metadata-driven extraction.** `valueType: "boolean"`, `"number"`, and `"string"` automatically select the right extractor.
- **Event wiring and tracing.** Events declared in metadata are looked up through XMLUI and traced semantically in verbose mode.
- **Resource URL resolution.** Props marked with `isResourceUrl: true` are resolved through `extractResourceUrl`.
- **Template handling.** `ComponentDef` props can become either static React nodes or render-prop callbacks.
- **Generic forwarding.** Props that are not specially handled still flow through `extractValue()`.
- **Escape hatch.** `customRender` lets you keep the auto-extraction pipeline while taking full control over the final JSX.

## Stateful does not imply `wrapCompound`

`wrapComponent` auto-detects stateful components when metadata declares `initialValue` or `didChange`. In that mode it can pass `value`, `initialValue`, and `updateState` through to the native component.

That is why built-in `Slider` still uses `wrapComponent`: the React component already understands XMLUI's state contract, and the wrapper only needs `customRender` to adapt a few prop names and callbacks. `wrapCompound` is for a different shape of render component, not for "all components with changing values".

## The role of `mergeWithMetadata`

Both wrapper functions start by calling `mergeWithMetadata`. It reads metadata and combines it with any explicit config so the wrapper can infer most of the boring plumbing:

- boolean, number, and string prop extraction
- event name to React prop mapping
- callback props resolved via `lookupSyncCallback`
- template props and render-prop templates
- prop renames and exclusions

The config is meant for exceptions. As metadata gets richer, the wrapper usually gets smaller.

See [wrapCompound](/docs/guides/wrap-component/wrap-compound-fn) for the specialization that adds a `StateWrapper` and a simplified render-component interface.

## Example: Avatar

Avatar is the cleanest `wrapComponent` example because nothing about it is unusual. The metadata declares typed props, a resource URL, and a couple of events. The wrapper itself is almost empty.

```typescript
import { wrapComponent } from "../../components-core/wrapComponent";
import { Avatar } from "./AvatarNative";
import { createMetadata, dClick, dContextMenu } from "../metadata-helpers";

const COMP = "Avatar";

export const AvatarMd = createMetadata({
  status: "stable",
  description: "Avatar displays a user's profile picture.",
  props: {
    size: { valueType: "string", defaultValue: "md" },
    name: { valueType: "string" },
    url: { valueType: "string", isResourceUrl: true },
  },
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
  },
});

export const avatarComponentRenderer = wrapComponent(
  COMP,
  Avatar,
  AvatarMd,
);
```
