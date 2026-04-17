---
agent: agent
description: Create a new XMLUI extension package with component(s)
---

# Create a New Extension Package

## Before starting

1. Read `feature.md` at the repo root — it describes the package name, purpose, and initial components.
2. Read `guidelines.md` at the repo root — focus on rules from Topics 14, 21, 22, 23.
3. Read these reference files:
   - `.ai/xmlui/extension-packages.md` — extension interface, registration, build config (always)
   - `.ai/xmlui/build-system.md` — `xmlui build-lib` and extension build patterns (always)
   - `.ai/xmlui/monorepo-structure.md` — workspace config, package categories (always)
   - `.ai/xmlui/component-architecture.md` — two-file pattern (always)
   - `.ai/xmlui/components/metadata.md` — metadata API (always)
   - `.ai/xmlui/testing-conventions.md` — testing patterns (always)
4. Study an existing extension package (e.g., `packages/xmlui-hello-world/`) as a structural reference.

## Implementation steps

### Step 1 — Create the package folder

```
packages/xmlui-<name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           ← extension entry point
│   └── components/        ← component folders go here
└── README.md
```

### Step 2 — Set up `package.json`

Key fields:
```json
{
  "name": "xmlui-<name>",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "xmlui build-lib",
    "dev": "xmlui build-lib --watch"
  },
  "dependencies": {
    "xmlui": "workspace:*"
  }
}
```

### Step 3 — Create the extension entry point

In `src/index.ts`:
```typescript
import type { Extension } from "xmlui";
// import component renderers here

const extension: Extension = {
  namespace: "<name>",
  components: [
    // componentRenderers go here
  ],
  themes: {},
  functions: {},
};

export default extension;
```

### Step 4 — Create component(s)

Follow the same two-file pattern as core components. See `.ai/xmlui/component-architecture.md`.
For each component:
- `src/components/ComponentName/ComponentName.tsx` — metadata + renderer
- `src/components/ComponentName/ComponentNameNative.tsx` — React implementation
- `src/components/ComponentName/ComponentName.module.scss` — styles (if visual)

Register each renderer in the extension's `components` array.

### Step 5 — Register in the workspace

Run from monorepo root:
```bash
npm install
```

This picks up the new workspace via npm workspaces (the `packages/` directory is a workspace root).

### Step 6 — Build and verify

```bash
npm run build -w packages/xmlui-<name>
```

### Step 7 — Add E2E tests (when requested)

- Create `src/components/ComponentName/ComponentName.spec.ts`
- Follow `.ai/xmlui/testing-conventions.md`
- Include `test.describe("Accessibility")` for interactive components

### Step 8 — Add to docs (when requested)

1. Add package name to `xmlui/scripts/generate-docs/extensions-config.json` → `includeByName`
2. Create description files in `website/content/docs/extensions/<package-name>/`
3. Run `npm run generate-all-docs -w xmlui`

See `.ai/xmlui/doc-generation.md` for the full pipeline.

### Step 9 — Add a changeset

Create `.changeset/<unique-name>.md`:
```yaml
---
"xmlui-<name>": patch
---
Initial release of xmlui-<name> extension package
```
Verify: `npx changeset status`

## Commands

```bash
# Install workspace dependencies (after creating package.json)
npm install

# Build the extension
npm run build -w packages/xmlui-<name>

# Run tests
npx playwright test packages/xmlui-<name>/ --reporter=line

# Type-check
npx tsc --noEmit -p packages/xmlui-<name>/tsconfig.json

# Generate docs (if applicable)
npm run generate-all-docs -w xmlui
```

## Absolute rules

- Package name must start with `xmlui-`
- Use `workspace:*` for the `xmlui` dependency
- Never create `index.ts` files in component folders
- Extension components are registered in the extension object, NOT in core `ComponentProvider.tsx`
