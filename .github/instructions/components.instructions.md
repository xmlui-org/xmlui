---
applyTo: "xmlui/src/components/**"
---

# XMLUI Component Development Rules

These rules apply whenever editing files in `xmlui/src/components/`.

## File layout

```
ComponentName/
├── ComponentName.tsx          # Metadata + renderer — source of truth for the API
├── ComponentNameNative.tsx    # React implementation
└── ComponentName.module.scss  # Styles and theme variables (visual components only)
```

**Never create `index.ts` files in component folders.**

## Metadata lives in `ComponentName.tsx`

- All props, events, APIs, and theme variables are declared in `ComponentName.tsx` using `createMetadata`.
- `ComponentNameNative.tsx` contains only the React implementation — no metadata.
- When you need to understand a component's API, read `ComponentName.tsx` first.

## `defaultProps` are defined in the native component

`defaultProps` are exported from `ComponentNameNative.tsx` and imported into `ComponentName.tsx` for use in metadata `defaultValue` fields. The renderer does **not** apply defaults — the native component handles them via destructuring defaults.

## Registration

New components must be registered in `ComponentProvider.tsx`:
```typescript
import { componentNameComponentRenderer } from "./ComponentName/ComponentName";
this.registerCoreComponent(componentNameComponentRenderer);
```

## Key prohibitions

- Do NOT use `useImperativeHandle` — use `registerComponentApi` instead.
- Do NOT set `displayName` on components.
- Do NOT create `index.ts` files.
- Do NOT edit `package.json` unless explicitly asked.
- Do NOT create files in `docs/content/components/` — those are auto-generated.

## Prompt files for common tasks

- **New component**: use `.github/prompts/create-component.prompt.md`
- **Extend a component**: use `.github/prompts/extend-component.prompt.md`

## Running tests

Always run commands from the workspace root (`/Users/dotneteer/source/xmlui`):
```bash
npx playwright test ComponentName.spec.ts --reporter=line   # E2E
npm run test:unit -- ComponentName                          # unit tests
```
