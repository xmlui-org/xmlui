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

## Reference documentation

Before making significant changes, read the relevant AI docs in `.ai/xmlui/`:

| Topic | AI Doc |
|-------|--------|
| Component architecture | `.ai/xmlui/component-architecture.md` |
| wrapComponent API | `.ai/xmlui/wrapcomponent.md` |
| Theming & SCSS | `.ai/xmlui/theming-styling.md` |
| Behaviors | `.ai/xmlui/behaviors.md` |
| Forms | `.ai/xmlui/form-infrastructure.md` |
| Testing | `.ai/xmlui/testing-conventions.md` |
| Accessibility | `.ai/xmlui/accessibility.md` |
| Option components | `.ai/xmlui/option-components.md` |

Verified rules: `guidelines.md` at the repo root (Topics 4, 5, 7, 9, 12, 23, 24).

## Prompt files for common tasks

- **New component**: use `#create-component`
- **Extend a component**: use `#extend-component`
- **Fix a bug**: use `#fix-bug`
- **QA review**: use `#qa-review`
- **Add E2E tests**: use `#add-e2e-tests`
- **Write docs**: use `#write-component-docs`

## Running tests

Always run commands from the workspace root (`/Users/dotneteer/source/xmlui`):
```bash
npx playwright test ComponentName.spec.ts --reporter=line   # E2E
npm run test:unit -- ComponentName                          # unit tests
```
