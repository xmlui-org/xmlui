---
agent: agent
description: Refactor an XMLUI component to keep defaultProps in a pure defaults file
---

# Refactor Component Defaults

Refactor `$componentName$` so its `defaultProps` live in a pure
`ComponentName.defaults.ts` file imported by both the XMLUI metadata/renderer file and
the React implementation file.

The goal is to keep `build:xmlui-metadata` from pulling React implementation modules
through `defaultProps` imports, while preserving the component's public API, runtime
behavior, metadata defaults, and tests.

## Before starting

1. Clarify with the user: the component name and whether only that component is in scope.
2. Read `guidelines.md` at the repo root — focus on Topics 4, 5, 7, 23.
3. Read the component architecture docs:
   - `.ai/xmlui/component-architecture.md`
   - `.ai/xmlui/wrapcomponent.md` if the component uses `wrapComponent`
   - `.ai/xmlui/testing-conventions.md`
4. Read the affected component files:
   - `xmlui/src/components/ComponentName/ComponentName.tsx`
   - `xmlui/src/components/ComponentName/ComponentNameReact.tsx`
   - `xmlui/src/components/ComponentName/ComponentNameNative.tsx` if the component still uses the legacy filename
   - `xmlui/src/components/ComponentName/ComponentName.spec.ts` if present

## Refactor steps

### Step 1 — Locate current defaults

Find the current `defaultProps` declaration and every import/use of it.

Common current pattern:
```typescript
// ComponentName.tsx
import { ComponentName, defaultProps } from "./ComponentNameReact";

// ComponentNameReact.tsx
export const defaultProps = {
  ...
};
```

Also check whether another component imports this component's defaults. If so, update
those imports to the new defaults file too.

### Step 2 — Create `ComponentName.defaults.ts`

Create `xmlui/src/components/ComponentName/ComponentName.defaults.ts`.

Move only serializable/static default values into this file:
```typescript
export const defaultProps = {
  enabled: true,
  orientation: "horizontal",
} as const;
```

If the old declaration had a useful explicit type, preserve it with type-only imports:
```typescript
import type { SomePropType } from "../abstractions";

export const defaultProps: {
  mode: SomePropType;
  enabled: boolean;
} = {
  mode: "default",
  enabled: true,
};
```

Rules for the defaults file:
- Keep it pure: no React imports, no JSX, no SCSS/CSS imports, no hooks.
- Prefer `import type` for types.
- Do not import from `ComponentName.tsx` or `ComponentNameReact.tsx`.
- Do not include derived values that require runtime services, theme lookup, DOM access, or hooks.

### Step 3 — Update the metadata/renderer file

In `ComponentName.tsx`, import defaults from the pure defaults file:
```typescript
import { defaultProps } from "./ComponentName.defaults";
import { ComponentName } from "./ComponentNameReact";
```

Do not import `defaultProps` from the React implementation file.

Keep all existing `defaultValue: defaultProps.someProp` metadata entries unchanged
except for the import source.

If the renderer also uses `defaultProps`, keep those references unchanged except for
the import source.

### Step 4 — Update the React implementation file

In `ComponentNameReact.tsx` or `ComponentNameNative.tsx`, import defaults from the
pure defaults file:
```typescript
import { defaultProps } from "./ComponentName.defaults";
```

Remove the old in-file `export const defaultProps = ...` declaration.

Keep destructuring defaults and fallback checks unchanged:
```typescript
function ComponentName({ enabled = defaultProps.enabled }: Props) {
  ...
}
```

If tests or other components need the defaults, they should now import them from
`ComponentName.defaults.ts`.

### Step 5 — Check for circular imports

Verify the new import graph has no cycle caused by defaults:
```text
ComponentName.defaults.ts
  -> no imports from ComponentName.tsx
  -> no imports from ComponentNameReact.tsx / ComponentNameNative.tsx
```

The desired shape is:
```text
ComponentName.tsx        -> ComponentName.defaults.ts
ComponentNameReact.tsx   -> ComponentName.defaults.ts
ComponentName.tsx        -> ComponentNameReact.tsx
```

### Step 6 — Verify metadata output

Run:
```bash
npm run build:xmlui-metadata -w xmlui
```

Then spot-check that the component's metadata defaults are preserved. If useful, load
`xmlui/dist/metadata/xmlui-metadata.cjs` in Node and inspect the component entry.

Also run:
```bash
npm run check:metadata-purity -w xmlui
```

Note: this guard checks the existing purity boundary. It may not catch every React
implementation leak from component metadata, so also inspect the import changes
directly.

### Step 7 — Verify component behavior

Run the affected component's tests if present:
```bash
npx playwright test ComponentName.spec.ts --reporter=line
```

If no component spec exists, run a relevant unit test or type check:
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

## Key warnings

- Do not change any default values.
- Do not rename props, events, APIs, or theme variables.
- Do not move renderer logic into the defaults file.
- Do not add React, SCSS/CSS, DOM, theme, or framework runtime imports to the defaults file.
- Do not create an import cycle between the defaults file and component implementation files.
- Do not add a changeset for this refactor unless the public API or runtime behavior changes.
