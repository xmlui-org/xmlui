---
applyTo: "packages/**"
---

# XMLUI Extension Package Rules

These rules apply whenever editing files in `packages/`.

## Reference documentation

| Topic | AI Doc |
|-------|--------|
| Extension interface & registration | `.ai/xmlui/extension-packages.md` |
| Build configuration | `.ai/xmlui/build-system.md` |
| Component architecture | `.ai/xmlui/component-architecture.md` |
| Theming | `.ai/xmlui/theming-styling.md` |
| Testing | `.ai/xmlui/testing-conventions.md` |

Verified rules: `guidelines.md` at the repo root (Topics 14, 21, 22).

## Key conventions

- Extension packages live in `packages/xmlui-<name>/`
- Use `workspace:*` for the `xmlui` dependency
- Components follow the same two-file pattern as core components
- Register components in the extension's `Extension` object, NOT in `ComponentProvider.tsx`
- Build with `xmlui build-lib` (or `npm run build -w packages/xmlui-<name>`)

## Key prohibitions

- Do NOT import from `xmlui/src/` directly — use the public API
- Do NOT modify `xmlui/src/components/ComponentProvider.tsx`
- Do NOT create `index.ts` files in component folders
- Do NOT edit `package.json` unless explicitly asked

## Prompt files

- **New component in existing package**: use `#create-extension-component`
- **New extension package**: use `#create-extension-package`
