# Code Generation Old Architecture Notes

Date: 2026-06-18

## Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/vite-xmlui-plugin.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/viteConfig.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/start.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/build.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/utils/extractParam.ts`
- Current rewrite files:
  - `xmlui/src/compiler/compileXmluiModule.ts`
  - `xmlui/src/compiler/scriptSemantics.ts`
  - `xmlui/src/runtime/index.tsx`

## Compatibility Lessons

- The old Vite plugin treats `.xmlui` files as module inputs and emits JavaScript
  modules. The generated module boundary is part of the developer contract.
- The old `start` and `build` commands both obtain the XMLUI Vite config and run
  Vite with the XMLUI transform installed, so code generation must stay usable
  in both dev-server and production-build command paths.
- Old transform output uses a data-oriented module shape through `dataToEsm`,
  including the parsed component tree, original source, code-behind data, file
  ID, and warnings.
- Build-time diagnostics are surfaced from the transform through Vite warnings
  or errors. The rewrite should preserve that behavior even while replacing the
  internal representation.
- The old pipeline performs additional build-time checks after parsing:
  analyzer diagnostics, reactive-cycle checks, accessibility linting, and
  type-contract verification. These are outside the initial code-generation
  slice but must remain planned compatibility targets.
- The old hot path depends heavily on interpreted/extracted expressions and
  runtime state plumbing. For the rewrite, expression and event code should be
  emitted as JavaScript functions that call explicit context methods.
- `extractParam` is the old compatibility reference for resolving
  expression-valued props, loader/action parameters, responsive conditions, and
  other runtime values. The initial rewrite should not reproduce its interpreter
  shape, but future compatibility work must preserve its user-visible result
  semantics.

## Simplification For Current Experiment

- Keep the Vite `.xmlui` transform boundary.
- Generate JavaScript functions for expressions and event handlers from
  Compiler IR instead of re-compiling semantic script IR at runtime.
- Do not generate rendering code in the compiler. XMLUI node rendering remains a
  runtime responsibility and belongs to the later rendering-pipeline work.
- Start with the existing counter subset: `App`, `H1`, `Button`, text,
  component references, props, locals, globals, and `count++`.
- Do not implement old code-behind modules, metadata analyzers, accessibility
  linting, type-contract checks, or reactive-cycle build checks in this slice.
