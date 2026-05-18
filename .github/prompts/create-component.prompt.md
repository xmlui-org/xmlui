---
agent: agent
description: Implement a new XMLUI component end-to-end
---

# Implement a New XMLUI Component

## Before starting

1. Clarify with the user: the component name, props, events, and design notes if not already specified.
2. Read `guidelines.md` at the repo root — focus on rules from Topics 4, 5, 7, 9, 23, 24.
3. Read these reference files (load only what applies):
   - `.ai/xmlui/component-architecture.md` — two-file pattern, metadata, renderer, native (always)
   - `.ai/xmlui/wrapcomponent.md` — wrapComponent config API (always for wrapped components)
   - `.ai/xmlui/theming-styling.md` — theming system (visual components only)
   - `.ai/xmlui/behaviors.md` — behavior system (if component interacts with forms, labels, validation)
   - `.ai/xmlui/testing-conventions.md` — testing patterns (when tests are requested)
   - `.ai/xmlui/accessibility.md` — accessibility checklist (always for interactive components)
4. Find a comparable existing component and read its `ComponentName.tsx` and `ComponentNameNative.tsx` as a concrete example.

## Implementation steps

Work through these in order. After each step verify there are no TypeScript errors before moving on.

### Step 1 — Create the folder and metadata

Create `xmlui/src/components/ComponentName/ComponentName.tsx`:
- Define `const COMP = "ComponentName"`
- Import `createMetadata` and relevant helpers
- Import `styles` from the SCSS module (even if it doesn't exist yet — it will by step 5)
- Export `ComponentNameMd` using `createMetadata`
- Fill in all props, events, apis, and contextVars from the task requirements
- Reference `defaultProps.propName` for `defaultValue` fields (the native component defines `defaultProps`)

### Step 2 — Create the renderer stub

In the same file (`ComponentName.tsx`), add `createComponentRenderer`:
- Map each prop with the appropriate `extractValue.*` method
- Wire events with `lookupEventHandler`
- Pass `state`, `updateState`, `registerComponentApi` if the component holds state
- Always pass `style={layoutCss}` to the native component
- This will not compile until the native component exists — that is fine

### Step 3 — Create the native component

Create `xmlui/src/components/ComponentName/ComponentNameNative.tsx`:
- Export `defaultProps` object — this is referenced by the metadata in step 1
- Use `forwardRef` and a typed `Props` interface
- Do not use `useImperativeHandle`; use `registerComponentApi` for imperative APIs
- Accept `updateState` and `registerComponentApi` as props and pass them through correctly
- Keep the implementation minimal to make the code compile; refine in step 6

### Step 4 — Register the component

In `xmlui/src/components/ComponentProvider.tsx`:
- Import the renderer: `import { componentNameComponentRenderer } from "./ComponentName/ComponentName";`
- Register it: `this.registerCoreComponent(componentNameComponentRenderer);`

Verify the project still compiles (check for TypeScript errors in the Problems pane).

### Step 5 — Add SCSS module (visual components only)

Create `xmlui/src/components/ComponentName/ComponentName.module.scss`:
- Use the SCSS boilerplate from `.ai/xmlui/component-architecture.md` (SCSS section)
- Declare all theme variables referenced in the task requirements
- Add `defaultThemeVars` in the metadata for each variable

### Step 6 — Complete the implementation

- Finish the native component's render logic, event handlers, and imperative API
- Wire the parts pattern if applicable (see `.ai/xmlui/theming-styling.md`)
- Implement state management if needed (see `.ai/xmlui/component-architecture.md`)

### Step 7 — Add a changeset (if user-facing)

Check `AGENTS.md` → Changesets. If this component is part of the public API:
- Create `.changeset/<unique-name>.md` with `"xmlui": patch` and a description.
- Verify: `npx changeset status` at the workspace root.

### Step 8 — Tests (only when explicitly requested)

- E2E: follow `.ai/xmlui/testing-conventions.md`; run from workspace root
- Unit: follow `.ai/xmlui/testing-conventions.md` (unit section); use `npm run test:unit` in `xmlui/`
- Add a `test.describe("Accessibility")` block to verify ARIA attributes (see `.ai/xmlui/accessibility.md`)

## Absolute rules

- Never create `index.ts` files
- Never edit `package.json`
- Never create files in `docs/content/components/` (auto-generated)
- Metadata goes in `ComponentName.tsx`, not `ComponentNameNative.tsx`
