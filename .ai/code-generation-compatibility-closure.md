# Code Generation Compatibility Closure

Date: 2026-06-18

## Implemented Compatibility

- `.xmlui` files still compile through the Vite module boundary.
- App modules still import sibling component modules.
- Parser, semantic, and Compiler IR diagnostics still fail module generation.
- Generated modules keep XMLUI nodes as structural runtime-rendered data.
- Only XMLUI expressions and event handlers are generated as JavaScript
  functions.
- Generated expression functions use explicit context methods:
  `ctx.readLocal`, `ctx.readGlobal`, and `ctx.props`.
- Generated event functions use explicit writes:
  `ctx.writeLocal` and `ctx.writeGlobal`.
- Generated runtime descriptors now carry source/debug metadata such as
  `sourceId`, `filename`, `irId`, `source`, `scopeId`, and `generatedName`.
- The local counter, repeated component counters, and global/shadowed counter
  examples run in Vite dev-server mode.

## Deliberate Omissions

- No rendering code generation.
- No generated React components, DOM instructions, render functions, or
  render-node factories.
- No code-behind `.xs` modules.
- No old analyzer, accessibility, type-contract, or reactive-cycle Vite passes.
- No full source-map emission yet; source spans and generated names are carried
  as metadata for the next iteration.
- No standalone loader, production artifact optimization, or SSG codegen in this
  slice.

## Next Natural Experiment

The next work should move into the runtime state model and rendering pipeline:
use the generated dependency metadata to reduce unnecessary recomputation and
make invalidation explicit without moving rendering responsibilities into the
compiler.
