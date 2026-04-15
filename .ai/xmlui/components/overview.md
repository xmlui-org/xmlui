# Conventions: Creating XMLUI Components

This is the index. For detailed reference, read the focused sub-files listed below — load only what you need for the current task.

## Sub-files

| Topic | File | When to read |
|---|---|---|
| Metadata API | [metadata.md](./metadata.md) | Always — every component has metadata |
| Renderer | [renderer.md](./renderer.md) | Always — every component has a renderer |
| Native component pattern | [native.md](./native.md) | Always for complex components; skip for trivial single-file components |
| SCSS & theme variables | [styling.md](./styling.md) | Visual components only |
| Parts pattern | [parts.md](./parts.md) | Components with multiple stylable sub-elements |
| State management | [state.md](./state.md) | Components that hold or expose state |
| Behaviors | [behaviors.md](./behaviors.md) | Auto-attached cross-cutting behaviors (label, tooltip, animation, …) |
| XMLUI markup patterns | [../markup.md](../markup.md) | Writing XMLUI markup, variables, scoping, scripting |
| Data operations | [../data.md](../data.md) | DataSource, APICall, loader state, file ops |
| E2E testing | [e2e.md](../testing/e2e.md) | When creating or updating E2E tests |
| Unit testing | [unit.md](../testing/unit.md) | When creating or updating unit tests |

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
