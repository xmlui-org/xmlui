---
applyTo: "xmlui/src/components-core/**"
---

# XMLUI Core Framework Rules

These rules apply whenever editing files in `xmlui/src/components-core/`.

## Architecture docs by subsystem

Before editing any subsystem, read its corresponding doc:

| Subsystem | Path | Doc |
|---|---|---|
| Rendering pipeline | `rendering/` | `xmlui/dev-docs/standalone-app.md` |
| State / containers | `containers/` | `xmlui/dev-docs/containers.md` |
| Theming / CSS | `theming/` | `xmlui/dev-docs/theming-styling.md` |
| Parts | `parts/` | `.ai/xmlui/components/parts.md` |
| Form infrastructure | `form*/` | `xmlui/dev-docs/form-infrastructure.md` |
| User-defined components | `ud-components/` | `xmlui/dev-docs/ud-components.md` |

## Refactoring

Use `.github/prompts/refactor-core.prompt.md` to plan and execute refactors. Record the plan in `feature.md` at the repo root.

## Testing

Core changes require unit tests in `xmlui/tests/` mirroring the source path:
```
xmlui/src/components-core/rendering/ComponentAdapter.tsx
xmlui/tests/components-core/rendering/ComponentAdapter.test.tsx
```

Run from workspace root:
```bash
npm run test:unit -w xmlui
```

## Key prohibitions

- Do NOT make breaking changes to the public renderer API without explicit instruction.
- Do NOT edit `package.json` unless explicitly asked.
- Never run all E2E tests without user confirmation (~10 minutes).
