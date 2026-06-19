# XMLUI Component Transfer Conventions

Phase 5 transfers components from the original XMLUI source tree into
source-adjacent component folders in this workspace.

## Folder Shape

Use the old component folder as the compatibility template:

```text
xmlui/src/components/<ComponentName>/
  <ComponentName>.tsx
  <ComponentName>.renderer.tsx
  <ComponentName>.metadata.ts
  <ComponentName>.defaults.ts
  <ComponentName>.md
  __tests__/
    <ComponentName>.spec.ts
    transferred/
      <ComponentName>.original.spec.ts
  index.ts
```

The exact filenames may follow the original component when that improves
traceability. The required categories are implementation, renderer adapter,
metadata, defaults/styles when applicable, docs, transferred tests, runnable
tests, and local helpers.

## Transferred Tests

Keep archival copies or direct source references for old tests under:

```text
xmlui/src/components/<ComponentName>/__tests__/transferred/
```

Runnable tests should live beside the component when possible. Browser-level
ports may live in the shared E2E harness, but the component closure note must
link them.

## Runtime Registry

The runtime imports component modules from `xmlui/src/components`. Central
runtime files may orchestrate rendering, but component behavior should move
behind component modules before the component is marked `closed`.

Existing experimental renderers that still point at
`xmlui/src/runtime/rendering/builtins.tsx` have status `partial-centralized`.
They are scaffolding, not closed component transfers.
