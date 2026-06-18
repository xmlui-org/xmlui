# Compiler IR: Old XMLUI Architecture Findings

Source baseline: `/Users/dotneteer/source/xmlui`

## Component Definition Shape

- The old shared component tree is centered on `ComponentDef` and
  `CompoundComponentDef` in
  `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ComponentDefs.ts`.
- `ComponentDef` is runtime-facing and broad: it includes `type`, `uid`, test
  IDs, `vars`, `globalVars`, `props`, `events`, `children`, `slots`, `when`,
  responsive conditions, loaders, functions, `uses`, `computedUses`,
  `computedGlobalUses`, debug source info, APIs, and context variables.
- `CompoundComponentDef` represents user-defined components with `name`,
  `component`, optional `api`, `vars`, namespaces, debug info, code-behind, and
  optional declared contract metadata.

## Dependency And Optimization Metadata

- `computedUses` and `computedGlobalUses` are stored directly on the component
  definition tree.
- Runtime containers use these fields to narrow parent state/global values and
  avoid unrelated re-renders.
- Reactive-cycle diagnostics and Vite build checks consume component-definition
  graphs instead of separate compiler artifacts.

## Tooling Consumers

- The old Vite plugin
  `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/vite-xmlui-plugin.ts`
  parses XMLUI files into component definitions, then runs static analysis,
  reactive-cycle detection, accessibility checks, and type-contract checks over
  those definitions.
- Language-server diagnostics also consume parsed component definitions for
  type contracts, accessibility, versioning, reactive cycles, hover, completion,
  and definition services.

## Rewrite Implications

- Keep one shared structural artifact for runtime, build tools, diagnostics,
  and editor features.
- Do not copy the old runtime-heavy `ComponentDef` as the new compiler IR.
- Model compiler facts explicitly: module identity, definition identity, node
  identity, lexical scopes, declarations, bindings, events, dependencies,
  writes, invalidations, source references, and diagnostics.
- Keep renderer descriptors, behavior metadata, loaders, slots, component APIs,
  theming, layout context, and metadata validation out of the first IR slice.
