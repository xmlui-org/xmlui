---
agent: agent
description: Extend an existing XMLUI component with new props, events, theme variables, or behavior
---

# Extend an Existing XMLUI Component

## Before starting

1. Read `feature.md` at the repo root — it describes what is being added and why.
2. Read the existing component's files:
   - `xmlui/src/components/ComponentName/ComponentName.tsx` — metadata and renderer (source of truth for the API)
   - `xmlui/src/components/ComponentName/ComponentNameNative.tsx` — React implementation
   - `xmlui/src/components/ComponentName/ComponentName.module.scss` — theme variables (if visual)
3. Read only the sub-files relevant to what you are adding:
   - `.ai/xmlui/components/metadata.md` — adding props/events/apis/contextVars
   - `.ai/xmlui/components/styling.md` — adding theme variables
   - `.ai/xmlui/components/parts.md` — adding parts
   - `.ai/xmlui/components/state.md` — adding stateful behavior
4. Find the component's existing E2E tests (`ComponentName.spec.ts` in the same folder) to understand current test coverage.

## Implementation steps

### Step 1 — Update metadata (`ComponentName.tsx`)

Add the new props, events, or APIs to `createMetadata`:
- For new props: add entry with `description`, `valueType`, `availableValues` (if enum), `defaultValue`
- For new events: use `d(...)`, `dClick`, etc.
- For new APIs: add to `apis` with `description` and `signature`
- For new theme variables: add to `defaultThemeVars` and declare in the SCSS module

### Step 2 — Update the renderer (`ComponentName.tsx`)

In `createComponentRenderer`, thread the new props/events to the native component:
- New prop: `newProp={extractValue.asOptionalString(node.props.newProp)}`
- New event: `onNewEvent={lookupEventHandler("newEvent")}`
- Do not apply defaults in the renderer — the native component's `defaultProps` handles them

### Step 3 — Update `defaultProps` and the native component

In `ComponentNameNative.tsx`:
- Add the new prop to `defaultProps` if it has a default value
- Add the prop to the `Props` interface
- Destructure it from props with its default: `newProp = defaultProps.newProp`
- Implement the behavior

### Step 4 — Update SCSS (if adding theme variables)

In `ComponentName.module.scss`:
- Declare new variables with `createThemeVar("property-ComponentName")`
- Use them in CSS rules

### Step 5 — Check for regressions

Run existing E2E tests for the component:
```bash
npx playwright test ComponentName.spec.ts --reporter=line
```
All existing tests must still pass.

### Step 6 — Add tests (only when explicitly requested)

Add new tests to `ComponentName.spec.ts` for the new behavior. Follow `.ai/xmlui/testing/e2e.md`.

### Step 7 — Add a changeset (if user-facing)

If the extension changes the public API (new prop, new event, new method, changed behavior):
- Create `.changeset/<unique-name>.md` with `"xmlui": patch`
- Verify: `npx changeset status` at workspace root

## Key warnings

- **Metadata is in `ComponentName.tsx`, not `ComponentNameNative.tsx`** — always read and edit the right file.
- **Do not change existing prop names, event names, or default values** without explicit instruction — that is a breaking change.
- **Do not remove or reorder` defaultProps` entries** — other components may depend on them.
- **Never create `index.ts` files.**
