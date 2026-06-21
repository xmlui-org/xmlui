# XMLUI Component Transfer Conventions

Phase 5 transfers components from the original XMLUI source tree into
source-adjacent component folders in this workspace.

## Folder Shape

Use the old component folder as the compatibility template:

```text
xmlui/src/components/<ComponentName>/
  <ComponentName>.tsx
  <ComponentName>React.tsx
  <ComponentName>.defaults.ts
  <ComponentName>.module.scss
  <ComponentName>.md
  <ComponentName>.spec.tsx
  <ComponentName>-style.spec.ts
  index.ts
```

The exact filenames may follow the original component when that improves
traceability. The required categories are implementation, React implementation,
metadata in the component entry file, defaults/styles when applicable, docs,
runnable unit tests, runnable E2E/visual tests, and local helpers.

`xmlui/src/components` should contain component folders only. Shared component
infrastructure belongs under `xmlui/src/component-core`, including metadata,
behaviors, registries, transfer inventory, and future component-wide helpers.

## Transferred Tests

Port old component tests directly beside the migrated component files, following
the old project pattern:

```text
xmlui/src/components/<ComponentName>/<ComponentName>.spec.tsx
xmlui/src/components/<ComponentName>/<ComponentName>-style.spec.ts
```

Do not create `__tests__` folders for migrated component tests. If a test cannot
yet be ported literally, record the old source file and the reason in the
component closure note, then add a colocated compatibility test that covers the
implemented slice.

## Runtime Registry

The runtime registry and transfer inventory live in `xmlui/src/component-core`.
Component behavior should move behind component folders before the component is
marked `closed`.

Existing experimental renderers that still point at
`xmlui/src/runtime/rendering/builtins.tsx` have status `partial-centralized`.
They are scaffolding, not closed component transfers.
