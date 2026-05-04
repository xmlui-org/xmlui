# Extension Packages — AI Reference

## Overview

XMLUI extensions are npm packages that add components, themes, and global functions to an app.
Each extension exports a default `Extension` object. In Vite mode, extensions are imported and
bundled at build time. In standalone mode, they are loaded as UMD scripts that self-register at
runtime via `StandaloneExtensionManager`. The framework core (`ComponentProvider`) subscribes to
the manager and merges extension artifacts into three separate namespace pools.

---

## Extension Interface

**File:** `xmlui/src/abstractions/ExtensionDefs.ts`

```ts
export type ComponentExtension = ComponentRendererDef | CompoundComponentRendererInfo;

export interface Extension {
  namespace?: string;                                   // Default: "XMLUIExtensions"
  components?: ComponentExtension[];                    // Renderer defs for native or compound components
  themes?: ThemeDefinition[];                           // Custom theme definitions
  functions?: Record<string, (...args: any[]) => any>; // Global functions available in expressions
  themeNamespacePrefix?: string;                        // PascalCase prefix for theme-variable namespacing (plan #02)
}
```

All fields are optional. Minimal extension: `export default { components: [myRenderer] };`

### `themeNamespacePrefix` (Wave 0, plan #02)

Extension packages **must** declare a PascalCase `themeNamespacePrefix` so the CSS variables they produce are unambiguously scoped:

```
--xmlui-backgroundColor-Animations_Button
                          ↑ prefix     ↑ component name
```

Core components leave this field `undefined` (no prefix, no `_` separator). Canonical prefixes for first-party packages are listed in [`components-core/themevars/prefix-registry.ts`](../../xmlui/src/components-core/themevars/prefix-registry.ts) — e.g. `xmlui-animations` → `Animations`, `xmlui-pdf` → `Pdf`, `xmlui-tiptap-editor` → `Tiptap`. Third-party packages must pick a prefix that does not collide with that table.

The build-time analyzer rule `theming-missing-prefix` (plan #13 / plan #02 Phase 1) flags variables in extension packages that omit the prefix once `strictBuildValidation` is enabled.

---

## ContributesDefinition (App-Level)

**File:** `xmlui/src/components/ComponentProvider.tsx`

Similar to Extension but for app-specific, non-packaged contributions. No namespace concept.
Supports `behaviors` (not available in `Extension`).

```ts
export type ContributesDefinition = {
  components?: ComponentRendererDef[];
  compoundComponents?: CompoundComponentDef[];
  themes?: ThemeDefinition[];
  behaviors?: Behavior[];           // ← Only here, not in Extension
};
```

| | `Extension` | `ContributesDefinition` |
|---|---|---|
| Source | npm package | App's own entry point |
| Namespace | Configurable | `#app-ns` (fixed) |
| Behaviors | ✗ | ✓ |
| Runtime registration | ✓ (standalone) | ✗ (build time only) |

---

## StandaloneExtensionManager

**File:** `xmlui/src/components-core/StandaloneExtensionManager.ts`

```ts
class StandaloneExtensionManager {
  registeredExtensions: Extension[] = [];
  subscriptions: Set<ExtensionRegisteredCallbackFn>;

  registerExtension(ext: Extension | Extension[]): void
  subscribeToRegistrations(cb: (ext: Extension) => void): void  // Fires immediately for already-registered
  unSubscribeFromRegistrations(cb: (ext: Extension) => void): void
}
```

**Key behavior:** `subscribeToRegistrations()` fires immediately for all already-registered
extensions and then for each new one. This means order of registration doesn't matter — a
subscriber that arrives late still processes all prior extensions.

---

## Component Namespace Pools

**Three pools in ComponentProvider:**

| Constant | Value | Contents |
|---|---|---|
| `CORE_NS` | `"#xmlui-core-ns"` | All built-in XMLUI framework components |
| `APP_NS` | `"#app-ns"` | App-specific component contributions |
| `EXTENSIONS_NS` | `"XMLUIExtensions"` | Default namespace for extension packages |

**Lookup order** for an unnamespaced component like `<MyComp>`:
1. Core namespace
2. App namespace
3. Extensions namespace (and any other registered extension namespaces)

**Namespaced lookup** for `<MyNS.MyComp>`:
- Resolves directly to the pool for `MyNS`.

**Registered full name:** `"${namespace}.${type}"` (e.g., `"XMLUIExtensions.Animation"`)

---

## extensionRegistered Callback

When `StandaloneExtensionManager` fires for a new extension, `ComponentProvider` processes it:

```ts
private extensionRegistered = (extension: Extension) => {
  extension.components?.forEach((c) => {
    if ("type" in c) {
      // Native component renderer def
      this.registerComponentRenderer(c, extension.namespace);
    } else if ("compoundComponentDef" in c) {
      // User-defined compound component
      this.registerCompoundComponentRenderer(c, extension.namespace);
    }
  });
};
```

Theme vars and default theme vars from component metadata are merged into `themeVars` and
`defaultThemeVars` sets during registration.

---

## Global Functions Merging

Extension `functions` are merged into `globalVars` during app initialization in `StandaloneApp`:

```ts
extensionManager?.registeredExtensions?.forEach((ext) => {
  if (ext.functions) {
    Object.keys(ext.functions).forEach((key) => {
      if (!(key in parsedGlobals)) {
        parsedGlobals[key] = ext.functions![key];  // No override — first wins
      }
    });
  }
});
```

- Function names that collide with existing global vars are silently ignored (first wins).
- Functions become callable in any XMLUI expression: `formatCurrency(value)`.

---

## Extension Registration: Standalone vs Vite Mode

### Standalone Mode

The UMD build of the extension auto-registers via injected footer code:

```js
// Auto-injected by xmlui build-lib in UMD output footer
if (typeof window.xmlui !== "undefined") {
  window.xmlui.standalone.registerExtension(
    window['xmlui-animations'].default || window['xmlui-animations']
  );
}
```

App loads extension UMDs via `<script>` tags in `index.html` before the runtime:

```html
<script src="./xmlui/xmlui-animations.js"></script>
<script src="./xmlui/xmlui-runtime.js"></script>
```

### Vite Mode

Extensions are imported directly in `extensions.ts` and bundled at compile time:

```ts
// website/extensions.ts
import search from "xmlui-search";
import charts from "xmlui-recharts";
export default [search, charts];
```

The extensions array is imported by the app entry point and passed to `ComponentProvider`
via `contributes.components` — no `StandaloneExtensionManager` involved.

---

## Package Structure Conventions

```
xmlui-myextension/
├── src/
│   ├── index.tsx           ← exports default Extension object
│   ├── MyComponent.tsx     ← metadata + wrapComponent (two-file pattern)
│   ├── MyComponentNative.tsx
│   └── MyComponent.spec.ts
├── demo/                   ← optional demo app (XMLUI markup files)
├── meta/                   ← build metadata outputs
├── dist/                   ← build outputs (UMD + ESM)
├── package.json
└── index.ts                ← demo entry point (for xmlui start)
```

### package.json Fields

```json
{
  "name": "xmlui-myextension",
  "type": "module",
  "main": "./dist/xmlui-myextension.js",
  "module": "./dist/xmlui-myextension.mjs",
  "exports": {
    ".": {
      "import": "./dist/xmlui-myextension.mjs",
      "require": "./dist/xmlui-myextension.js"
    },
    "./*.css": {
      "import": "./dist/*.css",
      "require": "./dist/*.css"
    }
  },
  "scripts": {
    "build:extension": "xmlui build-lib",
    "build-watch": "xmlui build-lib --watch",
    "build:meta": "xmlui build-lib --mode=metadata",
    "start": "xmlui start",
    "build:demo": "xmlui build"
  },
  "devDependencies": { "xmlui": "*" }
}
```

---

## Build System (xmlui build-lib)

**File:** `xmlui/src/nodejs/bin/build-lib.ts`

### Outputs

| File | Format | Purpose |
|---|---|---|
| `dist/xmlui-myext.js` | UMD | Standalone runtime loading; self-registers via footer |
| `dist/xmlui-myext.mjs` | ES module | Vite app bundling; tree-shakeable |
| `dist/xmlui-myext-metadata.js` | Metadata | Language server / IDE tooling |

### Externals

react, react-dom, xmlui (and react/jsx-runtime) are treated as externals — not bundled.
Third-party dependencies (e.g., `@react-spring/web`) ARE bundled.

### UMD Footer Injection

Every UMD build gets a footer that calls `window.xmlui.standalone.registerExtension()` if
the XMLUI runtime is already loaded. This is automatically injected by `build-lib.ts` — no
manual setup needed.

---

## Minimal Extension Example

### src/MyWidget.tsx

```ts
import { wrapComponent, createMetadata } from "xmlui";
import { MyWidgetNative, defaultProps } from "./MyWidgetNative";

const COMP = "MyWidget";

export const MyWidgetMd = createMetadata({
  description: "A custom widget component.",
  props: {
    label: { description: "Display label." },
    count: { description: "Current count.", defaultValue: defaultProps.count },
  },
  events: {
    clicked: { description: "Fired when widget is clicked." },
  },
});

export const myWidgetRenderer = wrapComponent(COMP, MyWidgetNative, MyWidgetMd, {
  events: { clicked: "onClick" },
  numbers: ["count"],
});
```

### src/index.tsx

```ts
import { myWidgetRenderer } from "./MyWidget";

export default {
  namespace: "XMLUIExtensions",
  components: [myWidgetRenderer],
};
```

### Usage in markup

```xml
<MyWidget label="Hello" count="{42}" clicked="handleClick()" />
```

---

## Compound Component Extensions

Extensions can also package user-defined (compound) components:

```ts
import type { Extension } from "xmlui";

const myUDC: CompoundComponentRendererInfo = {
  compoundComponentDef: { name: "MyCard", component: { /* parsed .xmlui AST */ }, api: [] },
};

export default {
  namespace: "XMLUIExtensions",
  components: [myUDC],
} satisfies Extension;
```

---

## Key Files

| File | Role |
|---|---|
| `xmlui/src/abstractions/ExtensionDefs.ts` | `Extension` interface definition |
| `xmlui/src/components-core/StandaloneExtensionManager.ts` | Runtime extension registration pub/sub |
| `xmlui/src/components/ComponentProvider.tsx` | Registry assembly; namespace pools; `extensionRegistered` callback |
| `xmlui/src/components-core/StandaloneApp.tsx` | Global function merging; standalone app bootstrap |
| `xmlui/src/nodejs/bin/build-lib.ts` | Extension build tool; UMD footer injection |
| `packages/xmlui-animations/src/index.tsx` | Reference extension implementation |
| `packages/xmlui-pdf/src/index.tsx` | Minimal extension example (1 component) |
| `website/extensions.ts` | Vite-mode extension registration example |

---

## Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|---|---|---|
| Using a custom namespace different from `"XMLUIExtensions"` without documenting it | Users must qualify all component names (`MyNS.MyComp`) | Use `"XMLUIExtensions"` unless namespace isolation is intentional |
| Bundling react/react-dom/xmlui into the extension | Causes duplicate React instances; hooks may fail | List them as `peerDependencies`; they are externals in `build-lib` |
| Overriding a core component name from an extension | Extension lookup order is last; core always wins | Use unique component names; never shadow `Text`, `Button`, etc. |
| Registering behaviors in an `Extension` object | `Extension` doesn't support `behaviors`; silently ignored | Use `ContributesDefinition` in the app entry for custom behaviors |
| Calling `registerExtension()` after the app is rendered (late registration) | Components that rendered before registration won't re-render | Register all extensions before calling `startApp()` / before first render |
| Exporting named exports instead of a default export | UMD footer uses `.default` — named-only export breaks auto-registration | Always export the Extension as `export default` |
