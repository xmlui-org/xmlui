# Conventions: Creating XMLUI Components

This is the index. For detailed reference, read the focused sub-files listed below — load only what you need for the current task.

## Sub-files

| Topic | File | When to read |
|---|---|---|
| Metadata API | [conv-component-metadata.md](./conv-component-metadata.md) | Always — every component has metadata |
| Renderer | [conv-component-renderer.md](./conv-component-renderer.md) | Always — every component has a renderer |
| Native component pattern | [conv-component-native.md](./conv-component-native.md) | Always for complex components; skip for trivial single-file components |
| SCSS & theme variables | [conv-component-styling.md](./conv-component-styling.md) | Visual components only |
| Parts pattern | [conv-component-parts.md](./conv-component-parts.md) | Components with multiple stylable sub-elements |
| State management | [conv-component-state.md](./conv-component-state.md) | Components that hold or expose state |
| E2E testing | [conv-e2e-testing.md](./conv-e2e-testing.md) | When creating or updating E2E tests |
| Unit testing | [conv-unit-testing.md](./conv-unit-testing.md) | When creating or updating unit tests |

## Quick Rules

❌ **Never create:**
- `index.ts` files in component folders
- Example files
- Entries in `package.json`

✅ **Create only when explicitly requested:**
- E2E tests
- Documentation (`.md`) files

## File Structure for Every Component

```
xmlui/src/components/ComponentName/
├── ComponentName.tsx          # Metadata + renderer (required)
├── ComponentNameNative.tsx    # React implementation (required for complex components)
└── ComponentName.module.scss  # SCSS styles (visual components only)
```

## Implementation Order

1. Define metadata (`createMetadata`) in `ComponentName.tsx`
2. Create the renderer stub with `createComponentRenderer` (won't build until step 3)
3. Create the native component with `forwardRef` and `defaultProps` in `ComponentNameNative.tsx`
4. Register in `ComponentProvider.tsx` (`this.registerCoreComponent(...)`)
5. Add SCSS module with theme variables (visual components)
6. Complete implementation and wire up events / APIs
7. Run E2E and unit tests (only when requested)

## Registration

```typescript
// ComponentProvider.tsx
import { componentNameComponentRenderer } from "./ComponentName/ComponentName";
// ...
this.registerCoreComponent(componentNameComponentRenderer);
```
