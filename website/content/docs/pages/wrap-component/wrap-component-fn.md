# wrapComponent

`wrapComponent` creates a stateless XMLUI renderer. It bridges XMLUI markup to a React component by automatically forwarding props, binding events with semantic tracing, and resolving resource URLs. It does not manage value lifecycle -- no `initialValue` parsing, no local state, no `updateState` calls.

**When to use it:** Components that render props but don't need XMLUI's value/state machinery. Avatar, Icon, Badge, Markdown -- anything without `initialValue` and `didChange`.

## Architecture

```
 SETUP (once, at registration time)
 ===================================

 Avatar.tsx                         wrapComponent.tsx
 ──────────                         ────────────────
 AvatarMd = createMetadata(...)     mergeWithMetadata(metadata, config)
       │                                │
       ▼                                ▼
 wrapComponent(                     auto-classifies props/events:
   "Avatar",        ──────────►       booleanSet, numberSet, stringSet
   AvatarNative,                      resourceUrlSet, eventMap
   AvatarMd                           renameMap, excludeSet
 )                                      │
       │                                ▼
       ▼                            createComponentRenderer(type, metadata, renderFn)
 avatarComponentRenderer                │
       │                                ▼
       ▼                            registers renderFn with the engine
 registered with XMLUI engine


 RENDER (every time engine evaluates <Avatar .../>)
 ==================================================

 XMLUI markup              engine                    wrapComponent's renderFn
 ────────────              ──────                    ───────────────────────
 <Avatar                   parses node,              receives context:
   url="pic.jpg"    ──►    creates context    ──►      { node, extractValue,
   name="Jon"              with extractValue,            lookupEventHandler,
   onClick="..." />        lookupEventHandler            className, ... }
                                                           │
                           ┌───────────────────────────────┘
                           ▼
                    builds props object:
                    ┌──────────────────────────────────────────────┐
                    │ 1. className ← engine CSS                    │
                    │ 2. events ← lookupEventHandler + auto-trace  │
                    │    onClick = (...args) => {                  │
                    │      pushTrace()                             │
                    │      handler(...args)                        │
                    │      pushXsLog(semantic trace)               │
                    │      popTrace()                              │
                    │    }                                         │
                    │ 3. resource URLs ← extractResourceUrl        │
                    │ 4. everything else ← extractValue            │
                    │    (typed: asBoolean, asNumber, asString,    │
                    │     or generic extractValue for unknowns)    │
                    └──────────────────────────────────────────────┘
                           │
                           ▼
                    <AvatarNative {...props} />
                    (plain React component, no XMLUI imports)
```

**What you get for free:**

- **Prop forwarding.** Every prop in XMLUI markup reaches the React component via `extractValue()`, even if the metadata doesn't declare it. New props on the React component "just work" without editing the wrapper.
- **Type-safe extraction.** Props declared in metadata with `valueType: "boolean"` or `"number"` get the correct `extractValue` variant automatically, via `mergeWithMetadata`.
- **Event auto-tracing.** Events declared in metadata get `pushTrace()`/`popTrace()` wrapping and semantic trace emission -- `value:change` for `didChange`, `focus:change` for `gotFocus`/`lostFocus`.
- **Resource URL resolution.** Props marked `isResourceUrl: true` in metadata are resolved via `extractResourceUrl` instead of `extractValue`.

## The role of `mergeWithMetadata`

Both `wrapComponent` and `wrapCompound` call `mergeWithMetadata` at setup time. It reads `valueType` annotations and event declarations from the metadata and auto-classifies them into `booleanSet`, `numberSet`, `stringSet`, `eventMap`, etc. This means the wrapper config only needs to specify exceptions (renames, callbacks, custom parsing) -- everything else is inferred from metadata.

On day one you can wrap a component with empty metadata -- every prop forwards as a raw string via `extractValue()`. As you add `valueType: "boolean"` or event declarations to the metadata, `mergeWithMetadata` picks them up automatically. The wrapper config never grows -- only the metadata does.

See the [wrapCompound](/docs/guides/wrap-component/wrap-compound-fn) section for a detailed before/after example showing how much boilerplate `mergeWithMetadata` eliminates.

## Example: Avatar

Avatar is a clean example -- no state, just props and events. The metadata declares `url` as a resource URL and two events (`click`, `contextMenu`). The `wrapComponent` call needs zero config because everything is inferred from metadata.

```typescript
// Avatar.tsx — exports avatarComponentRenderer (registered with engine)

import { wrapComponent } from "../../components-core/wrapComponent";
import { Avatar } from "./AvatarNative";     // plain React component
import { createMetadata, dClick, dContextMenu } from "../metadata-helpers";

const COMP = "Avatar";

// Metadata → consumed by wrapComponent, docs site, and IDE plugins.
export const AvatarMd = createMetadata({
  status: "stable",
  description: "Avatar displays a user's profile picture...",
  props: {
    size:  { valueType: "string", defaultValue: "md" },  // → stringSet
    name:  { valueType: "string" },                       // → stringSet
    url:   { valueType: "string", isResourceUrl: true },  // → resourceUrlSet
  },
  events: {
    click: dClick(COMP),              // → eventMap: onClick
    contextMenu: dContextMenu(COMP),  // → eventMap: onContextMenu
  },
});

// Zero config — mergeWithMetadata infers everything from AvatarMd.
export const avatarComponentRenderer = wrapComponent(
  COMP,        // XMLUI component name
  Avatar,      // plain React component
  AvatarMd,    // metadata
);
```
