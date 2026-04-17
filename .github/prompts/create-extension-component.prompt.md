---
agent: agent
description: Build a new XMLUI component inside an extension package
---

# Create a Component in an Extension Package

## Before starting

1. Read `feature.md` at the repo root — it describes the component to build (name, props, events, target package).
2. Read `guidelines.md` at the repo root — focus on rules from Topics 4, 5, 7, 14, 23, 24.
3. Read these reference files:
   - `.ai/xmlui/extension-packages.md` — extension interface, registration, build config (always)
   - `.ai/xmlui/component-architecture.md` — two-file pattern, metadata, renderer, native (always)
   - `.ai/xmlui/wrapcomponent.md` — wrapComponent config API (always for wrapped components)
   - `.ai/xmlui/theming-styling.md` — theming system (visual components only)
   - `.ai/xmlui/testing-conventions.md` — testing patterns (when tests are requested)
   - `.ai/xmlui/accessibility.md` — accessibility checklist (interactive components)
4. Find the target package in `packages/xmlui-<name>/` and study its existing structure.
5. Find a comparable component in either the target package or in `xmlui/src/components/` as a reference.

## Implementation steps

### Step 1 — Verify the extension package exists

Check `packages/xmlui-<name>/`:
- `package.json` exists with `xmlui` as a dependency
- `src/` folder exists with the extension entry point
- The extension is registered (exports an `Extension` object)

If the package does not exist, use `#create-extension-package` instead.

### Step 2 — Create the component folder

Create `packages/xmlui-<name>/src/components/ComponentName/`:
- `ComponentName.tsx` — metadata + renderer
- `ComponentNameNative.tsx` — React implementation
- `ComponentName.module.scss` — styles (visual components only)

Follow the same two-file pattern as core components (`.ai/xmlui/component-architecture.md`).

### Step 3 — Register the component in the extension

In the extension entry point (typically `src/index.ts` or `src/extension.ts`):
- Import the renderer
- Add it to the `components` array in the `Extension` object

### Step 4 — Complete the implementation

- Fill in metadata, renderer, and native component following the core conventions
- Wire theme variables if visual
- Add parts if the component has styled sub-elements

### Step 5 — Build and verify

```bash
npm run build -w packages/xmlui-<name>
```

Check for TypeScript errors. If the component should appear in docs, update `extensions-config.json`.

### Step 6 — Add tests (when requested)

- E2E tests go in `packages/xmlui-<name>/src/components/ComponentName/ComponentName.spec.ts`
- Follow `.ai/xmlui/testing-conventions.md`
- Include accessibility tests for interactive components

### Step 7 — Add a changeset

Create `.changeset/<unique-name>.md` with the package name and `patch`:
```yaml
---
"xmlui-<name>": patch
---
Add ComponentName component
```
Verify: `npx changeset status`

## Commands

```bash
# Build the extension package
npm run build -w packages/xmlui-<name>

# Run E2E tests for the component
npx playwright test packages/xmlui-<name>/src/components/ComponentName/ComponentName.spec.ts --reporter=line

# Type-check
npx tsc --noEmit -p packages/xmlui-<name>/tsconfig.json
```

## Absolute rules

- Follow the same two-file pattern as core components
- Register the component in the extension's `Extension` object, NOT in core `ComponentProvider.tsx`
- Never edit `xmlui/src/components/ComponentProvider.tsx` for extension components
- Never create `index.ts` files in component folders
