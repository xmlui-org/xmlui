# Compile script declarations with event-handler compilation

## Goal

When event-handler compilation is enabled, XMLUI should also compile executable script declarations that can run from event-handler code:

- inline `<script>...</script>` declarations inside `.xmlui` files;
- `.xmlui.xs` code-behind files for `Main.xmlui` and component files;
- inline component `codeBehind="..."` files;
- app-wide `Globals.xs` functions;
- supported imported module functions used by those declarations.

The feature should preserve interpreted fallback for unsupported AST nodes and preserve the existing split between sync binding expressions and async/event-style executable code. Global variables from `Globals.xs` should continue to use the binding-expression path, and should only compile when binding compilation is enabled through `compileBindings` or the umbrella `compileScripts` switch.

## Current behavior

- Markup event attributes are parsed in `xmlui/src/parsers/xmlui-parser/transform.ts` and, when `compileEventHandlers` is enabled, receive a `ParsedEventValue.compiled` artifact.
- Runtime event execution in `xmlui/src/components-core/container/event-handlers.ts` uses that parse-time artifact when available, or compiles/falls back around raw statements.
- Code-behind and inline `<script>` declarations are collected by `collectCodeBehindFromSource()` / `collectCodeBehindFromSourceWithImports()` in `xmlui/src/parsers/scripting/code-behind-collect.ts`.
- Collected code-behind functions are currently stored as arrow-expression AST objects in `CollectedDeclarations.functions`; they do not carry compiled artifacts.
- `Globals.xs` is resolved in `StandaloneApp.tsx`. Its variables are converted into root `globalVars` binding strings; its functions flow as callable global functions.
- The Vite plugin already passes `compileEventHandlers` into markup parsing and already registers compiled artifact source maps recursively, but code-behind declarations have no artifacts to register.

## Design decisions

- Treat code-behind functions and `Globals.xs` functions as event/executable scripts, controlled by `compileEventHandlers` and by `compileScripts` through the existing alias logic.
- Keep `compileEventHandlers: false` as a hard opt-out, even when `compileScripts: true`.
- Do not compile global `var` declarations under `compileEventHandlers` alone. Those are binding expressions, not handlers. They remain governed by `compileBindings` / `compileScripts`.
- Store declaration-level compilation metadata on the existing arrow-expression declaration object, rather than inventing a parallel function table.
- Use compile-time artifacts wherever the parser/Vite plugin has source context; keep runtime fallback for dynamically supplied/test-only declarations.
- Preserve module import validation and interpreted execution behavior for unsupported nodes.

## Step 1: Add a declaration artifact shape

Extend the collected declaration model so code-behind functions can carry event-async compilation metadata.

Implementation notes:

- Add optional fields to the arrow-style `CodeDeclaration` shape, or introduce a typed wrapper used by `CollectedDeclarations.functions`:
  - `compiled?: CompiledScriptArtifact`
  - `compiledUnsupported?: boolean`
  - `source?: string`
  - `sourceId?: string`
  - `sourceRange?: { start: number; end: number; ... }`
- Keep existing markers: `ARROW_EXPR_MARK` for executable functions and `PARSED_MARK_PROP` for parsed `var` declarations.
- Ensure `removeCodeBehindTokensFromTree()` does not delete the metadata required by source maps. It may still remove parser tokens from AST nodes when production/debug stripping requires it.

Tests:

- Unit test `collectCodeBehindFromSource()` still returns the same `vars` and `functions` shape by default.
- Unit test declaration metadata survives JSON serialization through `dataToEsm()`.
- Unit test token removal keeps `compiled`, `sourceId`, and source-map metadata intact.

## Step 2: Compile functions during code-behind collection

Add compiler options to `collectCodeBehindFromSource()` and `collectCodeBehindFromSourceWithImports()`.

Implementation notes:

- Accept an options object such as:
  - `compileEventHandlers?: boolean`
  - `compiledScriptSourceMaps?: CompiledScriptSourceMapMode`
  - `sourceIdPrefix?: string`
  - `sourceUrl?: string`
  - `sourceText?: string`
  - `sources?: CompiledScriptSource[]`
- When enabled, compile each `function name(...) { ... }` body with `compileEventAsyncStatements()`.
- Use a stable source id, for example `/src/Main.xmlui.xs#function-add`.
- Preserve unsupported-node fallback by setting `compiledUnsupported: true` and collecting a warning instead of failing the transform.
- Imported functions included in `parsedModule.functions` should be compiled with the source identity of their defining module, not the importing module.

Tests:

- Unit test a simple code-behind function has `compiled.target === "event-async"` when enabled.
- Unit test default collection does not compile.
- Unit test unsupported function syntax marks `compiledUnsupported` and still returns an executable interpreted declaration.
- Unit test imported functions get distinct source ids and source texts.

## Step 3: Execute compiled declaration functions

Teach arrow-expression execution to use an attached compiled artifact when event-handler compilation is active.

Implementation notes:

- Update the async function-call path in `eval-tree-async.ts` / `executeArrowExpression()` so an arrow expression with `compiled` can execute through `executeCompiledEventAsyncArtifact()`.
- Keep the current interpreted path when:
  - `evalContext.options.compileEventHandlers` is not true;
  - the declaration has no artifact;
  - `compiledUnsupported` is true;
  - compiled execution throws `UnsupportedCompiledScriptNodeError`.
- Ensure the compiled declaration gets the same local context, closure context, argument binding, `$this`, `$cancel`, implicit context, and statement-completed hooks as interpreted execution.
- Avoid double scheduling. A function called from an already scheduled event handler should execute inside the current handler invocation, not enqueue a nested top-level event.

Tests:

- Unit parity test: an event handler calls a compiled code-behind function and mutates state identically to interpreted mode.
- Unit parity test: compiled code-behind function calls another compiled code-behind function.
- Unit parity test: compiled code-behind function reads closure/global values and receives parameters correctly.
- Unit test fallback: unsupported compiled declaration is interpreted and still returns the expected value.
- Unit test statement boundaries: state written in statement N inside the function is visible to statement N+1, matching the existing event-handler contract.

## Step 4: Wire Vite `.xmlui` inline `<script>` collection

Pass the new collection options from `xmlui/src/nodejs/vite-xmlui-plugin.ts` when extracting inline `<script>` content from `.xmlui` files.

Implementation notes:

- Use the already-normalized `.xmlui` file id as the source root.
- Give inline script declarations source ids such as `/src/Main.xmlui#script-function-save`.
- Use the full `.xmlui` source as the debug source, with source ranges pointing into the `<script>` body.
- Ensure the cleaned markup and parsed component output are unchanged except for function metadata.

Tests:

- Vite plugin test: inline `<script>` function compiles when `compileEventHandlers: true`.
- Vite plugin test: inline `<script>` function compiles when `compileScripts: true`.
- Vite plugin test: `compileScripts: true, compileEventHandlers: false` leaves inline script functions uncompiled.
- Vite plugin test: inline script compiled artifact is registered in debug sources when source maps are enabled.

## Step 5: Wire `.xmlui.xs` and inline component code-behind

Pass the new collection options for standalone `.xmlui.xs` files and for inline component `codeBehind="..."` resolution.

Implementation notes:

- In the `.xmlui.xs` / `.xm` transform branch, compile declarations while collecting the code-behind module.
- In `resolveInlineComponentCodeBehind()`, use the resolved code-behind path as the source id root.
- Preserve the current merge order between markup vars and code-behind vars/functions.
- Preserve module parsing warnings and critical-error behavior exactly.

Tests:

- Vite plugin test: `Main.xmlui.xs` exports compiled functions when enabled.
- Vite plugin test: component code-behind functions compile and are merged into the component definition.
- Vite plugin test: inline component `codeBehind="Inline.xs"` functions compile and keep source ids relative to the actual resolved file.
- Regression test: duplicate/invalid module warnings still surface as before.

## Step 6: Wire `Globals.xs` functions

Compile `Globals.xs` functions in both prebuilt Vite runtime and runtime-fetched standalone paths.

Implementation notes:

- Vite path: the `.xs` transform should already compile `Globals.xs` once Step 5 is complete.
- Standalone fetch path: when `StandaloneApp.tsx` fetches and parses `Globals.xs` at runtime, call collection with options derived from `xmluiConfig` / `appGlobals`.
- Keep `Globals.xs` variables as global binding expressions. They may carry compiled binding artifacts later through the binding path, but that is not part of event-handler compilation.
- Ensure global functions inserted by `transformMainXsToGlobalTags()` retain their compiled metadata.

Tests:

- Unit/React test: with `compileEventHandlers: true`, an event handler calls a `Globals.xs` function and the function artifact is used.
- Unit/React test: `compileScripts: true` also compiles `Globals.xs` functions.
- Unit/React test: `compileScripts: true, compileEventHandlers: false` does not compile `Globals.xs` functions.
- Regression test: `Globals.xs` variables still reevaluate through global binding semantics and are not gated by event-handler compilation alone.

## Step 7: Extend source-map and debug-source coverage

Make sure newly compiled declaration artifacts participate in the existing compiled-script source-map system.

Implementation notes:

- Reuse `collectCompiledArtifacts()` in the Vite plugin; after Steps 1-6 it should find declaration artifacts recursively.
- Verify `createDebugSource()` receives the full `.xmlui`, `.xmlui.xs`, `.xs`, and imported `.xm` source texts.
- Ensure source ranges for inline `<script>` functions point to the body in the original `.xmlui` file, not offset zero in the extracted script string.
- Keep source text out of Inspector traces unless the existing debug-source path explicitly includes generated body text.

Tests:

- Unit test external source maps include original `.xs` and imported module sources.
- Unit test inline `<script>` source ranges map to the correct line/column in a multiline `.xmlui` file.
- Existing `script-compiler/source-map.test.ts` and `bin/vite-plugin-import.test.ts` coverage should be expanded rather than duplicated.

## Step 8: Add end-to-end parity tests

Add focused E2E coverage that proves users see the same behavior with compilation on and off.

Test matrix:

- inline `.xmlui` `<script>` function called from `onClick`;
- `Main.xmlui.xs` function called from `onClick`;
- component `.xmlui.xs` function called from inside that component;
- inline component `codeBehind` function;
- `Globals.xs` function called from a component event handler;
- imported helper function transitively called from any of the above.

Assertions:

- Run each scenario once with compilation disabled and once with `compileEventHandlers` enabled.
- Capture user-visible state with `testState` / rendered text and assert equality.
- Include one async function-call case, one state-mutation case, one parameter/return-value case, and one imported alias case.
- Add one negative/fallback case with unsupported compilation that still succeeds through the interpreter and emits a warning.

## Step 9: Add configuration and documentation cleanup

Clarify the public switches and internal behavior.

Implementation notes:

- Update `.ai/xmlui/expression-eval.md` and `.ai/xmlui/build-system.md`.
- Update `StandaloneAppDescription.appGlobals` comments if behavior changes in `StandaloneApp.tsx`.
- Document that `compileEventHandlers` now includes executable script declarations, not only event attributes.
- Document that global `var` declarations remain binding expressions and require binding compilation.
- Add a changeset because this changes framework-visible behavior.

Tests:

- Existing `script-runner/eval-options.test.ts` should be updated if any option helper is added for script declarations.
- Run `npx changeset status` after adding the changeset.

## Suggested verification sequence

Run focused tests after each step:

1. `npm run test:unit -w xmlui -- parsers/scripting/code-behind-collect.test.ts`
2. `npm run test:unit -w xmlui -- components-core/compiled-events/event-async-arrow-and-codebehind.test.ts`
3. `npm run test:unit -w xmlui -- bin/vite-plugin-import.test.ts`
4. `npm run test:unit -w xmlui -- components-core/script-runner/eval-options.test.ts`
5. targeted Playwright spec for compiled declaration parity

Before finishing the feature, run:

- the full compiled-events unit test group;
- Vite plugin import/source-map tests;
- the new E2E parity spec;
- `npx changeset status`.

## Risks and guardrails

- Code-behind functions can be called from binding expressions too. Compiled declaration execution must only activate in the async/event path; sync binding evaluation should keep its current behavior unless binding compilation explicitly grows declaration support later.
- Source identity for imported modules must use the defining source file. Otherwise DevTools and warning locations will become misleading.
- The compiled path must preserve XMLUI's cooperative statement boundary semantics. This is more important than raw JavaScript speed.
- Runtime-fetched standalone apps may not have Vite source-map infrastructure. They should still compile declarations when configured, but external source maps should gracefully degrade to the existing runtime fallback.
- Keep interpreted fallback at every stage so enabling compilation never turns an unsupported-but-valid app into a hard failure.
