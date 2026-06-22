# XMLUI Browser Debug Source Map Plan

Status: Stages 1-7 implemented  
Primary priority: show original `.xmlui` source files in browser DevTools  
Secondary priority: basic breakpoints and stepping for bindings and event handlers  
Tertiary priority: built-in debugging helpers without browser extensions

## Scope

This plan adds development-time source-map support for XMLUI compiled modules.
The goal is that a developer running the Vite dev server can open browser
DevTools and see the original `.xmlui` files, then gradually gain useful
breakpoint and stepping behavior for compiled binding expressions and event
handlers.

The first target is the current Vite/module compiler path:

- `xmlui/src/vite-plugin/xmluiPlugin.ts`
- `xmlui/src/compiler/compileXmluiModule.ts`
- `xmlui/src/compiler/codegen/module.ts`
- `xmlui/src/compiler/codegen/runtimeDocument.ts`
- `xmlui/src/compiler/codegen/script.ts`

The current Vite transform returns:

```ts
{
  code: compileXmluiModule(...),
  map: { mappings: "" },
}
```

That empty map is the immediate reason browser DevTools cannot display or map
compiled XMLUI sources meaningfully.

## Non-Goals

- Do not require a Chrome/Firefox extension.
- Do not replace browser DevTools.
- Do not build a full XMLUI debugger UI in this plan.
- Do not make production builds depend on source maps unless explicitly enabled.
- Do not block the first source-display milestone on perfect statement-level
  mappings.

## Compatibility Sources

Current rewrite code:

- `xmlui/src/vite-plugin/xmluiPlugin.ts` returns an empty source map.
- `xmlui/src/compiler/codegen/emitter.ts` emits JavaScript values and functions
  as strings.
- `xmlui/src/compiler/codegen/script.ts` emits binding and event JavaScript from
  XMLUI script IR.
- Parser and IR nodes already carry source spans, so source-map generation can
  reuse existing span metadata instead of re-parsing source text.

Original XMLUI behavior does not appear to provide browser-debug source maps for
XMLUI script fragments as the compatibility contract. This is a new developer
experience feature, so the plan should preserve runtime semantics while adding
debug metadata only in development/compiler output.

## Proposed Architecture

### 1. Compiler Result Shape

Change the module compiler from returning only a string to returning generated
code plus optional source-map metadata.

Suggested types:

```ts
type CompileXmluiModuleResult = {
  code: string;
  map?: RawSourceMap;
};

type CompileXmluiModuleOptions = {
  id: string;
  source: string;
  extensions?: Iterable<Extension>;
  sourcemap?: boolean | "display" | "debug";
};
```

Keep a compatibility wrapper or overload if many call sites still expect a
plain string:

```ts
compileXmluiModuleCode(options): string
compileXmluiModule(options): CompileXmluiModuleResult
```

The Vite plugin should return:

```ts
const compiled = compileXmluiModule({ id, source, extensions, sourcemap: true });
return { code: compiled.code, map: compiled.map ?? null };
```

### 2. Source Map Levels

Implement source-map support in three useful levels.

#### Level A: Source Display

Goal: DevTools Sources panel shows the original `.xmlui` file with content.

Requirements:

- Source map lists the real `.xmlui` file path as a source.
- Source map includes `sourcesContent` with the original file content.
- Generated Vite module has a stable virtual identity such as
  `Main.xmlui?xmlui-module`.
- No perfect mappings required yet.

This is likely enough for DevTools to make the source visible, even before
breakpoints work reliably.

#### Level B: Coarse Debug Mapping

Goal: breakpoints in event handler attributes and expression bindings land near
the generated function code.

Map these source ranges:

- expression binding body inside `{...}`;
- text interpolation expression inside `{...}`;
- event handler attribute value;
- method handler attribute or child body.

Generated mapping can initially point from the first generated line of the
compiled function body to the source span start of the corresponding XMLUI
script fragment.

This should make call stacks and breakpoint jumps much less disorienting.

#### Level C: Statement And Expression Mapping

Goal: stepping through an event handler follows original XMLUI statements.

Map generated statement chunks to original script spans:

- variable declarations;
- assignments and updates;
- `if` tests and branches;
- `while` tests and bodies;
- calls such as `delay`, `emitEvent`, `navigate`, and extension functions.

This requires replacing many string concatenations in `script.ts` with a
source-aware code writer.

## Source-Aware Emission

Introduce a small code writer that tracks generated offsets and accepts optional
source spans.

```ts
type GeneratedChunk = {
  text: string;
  source?: {
    sourceId: string;
    start: number;
    end: number;
  };
};

class SourceMappedWriter {
  append(text: string): void;
  appendMapped(text: string, source: SourceSpan): void;
  toString(): string;
  mappings(): GeneratedMapping[];
}
```

The writer should track generated line and column while appending text. It
should store enough mapping data to produce a v3 source map.

Implementation choices:

- Prefer a tiny internal writer for generated-position tracking.
- Use an existing source-map generator only if it is already available through
  the current toolchain, or document a new dependency in this plan before adding
  it.
- If no generator dependency is chosen initially, start with a small mapping
  encoder module covered by tests.

Recommended staged approach:

1. Source map builder for one source file and simple mappings.
2. Integrate builder with module emission.
3. Replace script codegen string returns with source-aware chunks.
4. Expand mapping coverage statement by statement.

## Mapping The XMLUI Source File

Use the real `id` passed to the Vite transform as the source-map source.

For browser readability, prefer a stable source name:

```text
/absolute/path/to/Main.xmlui
```

or, if Chrome grouping is noisy:

```text
xmlui-source:///src/Main.xmlui
```

The first implementation should use the real file path because it requires no
extra virtual-file protocol support and Vite already knows that path.

Set:

```json
{
  "version": 3,
  "file": "Main.xmlui?xmlui-module",
  "sources": ["/absolute/path/to/Main.xmlui"],
  "sourcesContent": ["<App>...</App>"],
  "names": [],
  "mappings": "..."
}
```

## Codegen Changes

### Module Codegen

Current `emitXmluiModule` returns one string. Add a source-map capable variant:

```ts
emitXmluiModuleWithSourceMap({
  compilerIr,
  imports,
  source,
  sourceId,
  runtimeSpecifier,
}): { code: string; map: RawSourceMap }
```

The old `emitXmluiModule` can delegate to it and return only `.code`.

### Runtime Document Codegen

`emitRuntimeDocumentFromIr` currently embeds `compiledSource` strings and raw JS
function expressions inside the generated object.

For source maps, emitted raw JS functions need mapping hooks:

- expression `evaluate` function body maps to expression source span;
- event `execute` function body maps to event handler source span;
- later, individual statements map to their statement spans.

This likely means `generateExpressionFunction` and
`generateEventHandlerFunction` should return mapping metadata in addition to
`body` and `functionSource`.

Suggested shape:

```ts
type GeneratedFunctionSource = {
  body: string;
  functionSource: string;
  mappings: GeneratedMapping[];
};
```

The module emitter then offsets function-local mappings by the generated module
position where the raw JS function is emitted.

### Script Codegen

Start by mapping whole functions:

- expression function maps `return ...` to the expression span;
- event function maps all event body code to the handler source span.

Then migrate statement emitters:

- `emitVariableDeclaration(statement)` maps the declaration line to
  `statement.span`;
- `emitEventExpression(expression)` maps writes and calls to `expression.span`;
- `emitIfStatement` maps the `if (...)` line to `statement.test.span`;
- `emitWhileStatement` maps the `while (...)` line to `statement.test.span`;
- generated yield helper calls should remain unmapped or map to the surrounding
  statement only when that improves stepping.

Keep generated scaffolding unmapped:

- shared yield helper;
- `let __xmluiResult`;
- `const __xmluiYieldState`;
- loop checkpoint counters;
- `return __xmluiResult`.

This helps DevTools prefer original XMLUI lines instead of stopping on compiler
machinery.

## Browser Debugging UX

### Display Source Files

Milestone 1 success looks like this:

- Start `npm run dev`.
- Open a page using `Main.xmlui`.
- Open DevTools Sources.
- See `Main.xmlui` with original XMLUI markup.
- The file content should match the source file on disk.

No browser extension should be needed.

### Basic Breakpoints

Milestone 2 success:

- Set a breakpoint on an event handler source line.
- Click the corresponding XMLUI component.
- Browser pauses in generated JavaScript, with the original XMLUI source
  visible in the call frame when possible.
- Call stack function names identify the XMLUI event or binding.

To improve call stacks, consider emitting named functions:

```js
const __xmlui_event_Main_xmlui_12_84 = async (ctx) => { ... };
```

Then place that function reference in the runtime document instead of emitting
large anonymous inline functions directly in object literals.

### Debugger-Friendly Function Names

Generated function names should include:

- source filename stem;
- component name or generated node id when available;
- event or binding name;
- source span start/end.

Example:

```text
xmlui_event_Main_click_460_755
xmlui_expr_Main_text_120_133
```

These names should be stable enough for debugging but not part of the public
runtime API.

## Built-In Debug Helpers Without Browser Extensions

Add XMLUI script helpers that work in development without user-installed browser
extensions.

Candidate helpers:

```xml
<Button onClick="debugBreak(); count++" />
<Button onClick="debugLog('count', count)" />
<Button onClick="debugTrace('before update')" />
```

Compiler/runtime behavior:

- `debugBreak()` compiles to `debugger; undefined` in development.
- `debugLog(...args)` compiles to `console.log(...args); undefined` or routes
  through `ctx.debug?.log`.
- `debugTrace(label?)` compiles to `console.trace(label); undefined` or routes
  through `ctx.debug?.trace`.
- Production behavior should be decided explicitly:
  - keep helpers as console/debugger behavior;
  - strip them;
  - or compile them to no-ops.

Recommended first implementation:

- Recognize these names as built-in XMLUI script calls in the compiler.
- Add them without requiring extension registration.
- Gate `debugBreak` behind development mode when the compiler knows mode.
- Add diagnostics if a debug helper is used in a context where it will be
  stripped or unavailable.

Avoid naming the helper `debugger()` because `debugger` is a JavaScript keyword
and may complicate parsing. Prefer `debugBreak()`.

## Staged Implementation

### Stage 1: Source Display Source Map `[implemented]`

- Add a source-map result type to `compileXmluiModule`.
- Change `xmluiPlugin.transform` to return the compiler map instead of
  `{ mappings: "" }`.
- Generate a v3 source map containing:
  - one source entry for the `.xmlui` file;
  - `sourcesContent`;
  - a stable `file` value.
- Add tests proving the map includes the source path and exact source content.
- Manually verify DevTools Sources shows the `.xmlui` file.

Implementation notes:

- `compileXmluiModuleWithSourceMap` now returns `{ code, map }`.
- `compileXmluiModule` remains as the compatibility string-returning wrapper.
- The Vite XMLUI plugin now returns the generated source map.
- Stage 1 emits line-level source-display mappings and embeds
  `sourcesContent`; later stages replace the coarse line mappings with
  expression and statement mappings.
- Stage 1 uses `xmlui-source://...` source URLs so Chrome has a stable,
  recognizable source-map source for original XMLUI files.
- Manual dev-server probe confirmed transformed XMLUI modules include an inline
  `sourceMappingURL` with the original `.xmlui` source content.

### Stage 2: Coarse Function Mappings `[implemented]`

- Add mapping metadata to `generateExpressionFunction` and
  `generateEventHandlerFunction`.
- Map each generated function body start to the source span of the original
  binding or event handler.
- Add source-map tests that decode mappings and verify generated positions map
  to the expected source offsets.
- Verify a breakpoint on a handler attribute can pause when the event runs.

Implementation notes:

- `generateExpressionFunction` and `generateEventHandlerFunction` now return
  function-local source mapping metadata in addition to source text.
- The module compiler locates each emitted function in the generated module and
  offsets those function-local mappings into the module source map.
- Expression functions map the generated `return ...` line to the original
  XMLUI expression span.

### Stage 3: Statement-Level Event Handler Mappings `[implemented]`

- Replace event statement codegen with source-aware chunks.
- Map assignments, declarations, calls, `if`, and `while` tests to their
  original script spans.
- Keep compiler-generated yield and loop-checkpoint scaffolding unmapped.
- Add regression tests for a multi-line event handler:
  - `let sum = 0`;
  - `while (...)`;
  - `sum += i`;
  - state write such as `result = sum`.
- Verify stepping through the benchmark handler lands on meaningful XMLUI
  source lines.

Implementation notes:

- Event mappings currently use practical statement anchors rather than a full
  source-aware writer for every generated token.
- Variable declarations, expression statements, `if` tests, and `while` tests
  are mapped to their XMLUI script spans.
- Compiler-generated yield state, yield checkpoints, loop checkpoint counters,
  result temporaries, and return scaffolding stay unmapped so DevTools favors
  user-authored source.
- This is good enough for meaningful browser anchoring; exact column-level
  stepping remains a later refinement.

### Stage 4: Expression And Text Binding Mappings `[implemented]`

- Map prop/local/global expression functions to their expression spans.
- Map text interpolation expressions to the span inside `{...}`.
- Add tests for text like:

```xml
<Text>{count + 1}</Text>
```

- Verify DevTools call stacks point to XMLUI source for expression evaluation.

Implementation notes:

- Prop/local/global expression bindings are collected by walking the compiler
  IR bindings.
- Text interpolation expression functions are collected from text segment IR.
- The source map uses those expression spans when mapping generated expression
  `evaluate` functions.
- Compiler tests cover event functions, expression bindings, and text
  interpolation functions contributing non-line-fallback mappings.

### Stage 5: Debugger-Friendly Function Names `[implemented]`

- Emit event and expression functions as named constants in generated modules.
- Preserve current runtime document shape by storing references to those named
  functions.
- Keep generated names stable and collision-free.
- Add tests proving generated names include source identity and do not collide
  across multiple handlers.

Implementation notes:

- Runtime expression and event functions now emit named function expressions
  using their existing `generatedName` metadata.
- Low-level generator calls remain anonymous unless a function name is provided,
  preserving simpler direct codegen behavior in tests and helper callers.
- Source-map collection uses the same generated names as runtime document
  emission so named functions still receive mappings.

### Stage 6: Built-In Debug Helpers `[implemented]`

- Add `debugBreak`, `debugLog`, and `debugTrace` as compiler-recognized built-in
  calls.
- Add runtime context hooks if routing through `ctx.debug` is preferred.
- Add tests for generated JavaScript:
  - `debugBreak()` emits `debugger;`;
  - `debugLog(...)` emits or invokes logging;
  - helpers require no extension registration.
- Add documentation/example app showing debug helpers in use.

Implementation notes:

- `debugBreak`, `debugLog`, and `debugTrace` are compiler-recognized built-in
  calls and do not require extension registration.
- `debugBreak()` emits a JavaScript `debugger;` statement when used as an event
  statement.
- `debugLog(...)` emits `console.log(...)` and returns `undefined`.
- `debugTrace(...)` emits `console.trace(...)` and returns `undefined`.
- The interpreter path mirrors the generated JavaScript behavior.
- The first implementation keeps these helpers available in generated output;
  production stripping remains a later compatibility/product decision if
  needed.

### Stage 7: Browser Verification Harness `[implemented]`

- Add a Playwright smoke test or documented manual check:
  - run dev server;
  - open an example app;
  - confirm source map files load;
  - confirm original `.xmlui` source appears in browser source-map metadata.
- Full DevTools breakpoint automation may be hard; use Chrome DevTools Protocol
  only if the test remains stable.

Implementation notes:

- Added a `debugHelpers` dev example at
  `xmlui/src/examples/debug-helpers/Main.xmlui`.
- The example updates visible state while exercising `debugLog`, `debugTrace`,
  and `debugBreak`.
- Compiler tests cover named generated functions, debug helper codegen, and the
  source-map column mapping for `onClick="count++"`.
- Browser breakpoint automation remains manual for now because DevTools UI
  behavior is the target surface and is more stable to inspect manually at this
  stage.

## Tests

Unit tests:

- `compileXmluiModule` returns `{ code, map }` when `sourcemap` is enabled.
- The map contains `sources` and `sourcesContent`.
- The map uses the real `.xmlui` source id.
- Generated code still executes as before.

Source-map tests:

- Decode generated mappings and verify selected generated positions map to
  expected source offsets.
- Test event handler mappings for declarations, calls, loops, and writes.
- Test expression binding mappings.
- Test text interpolation mappings.

Vite plugin tests:

- `.xmlui` transform returns a non-empty map in dev mode.
- Production mode can omit maps or emit them according to Vite config.

Browser/manual tests:

- DevTools Sources displays `Main.xmlui`.
- Breakpoint in handler source pauses when clicking a button.
- `debugBreak()` pauses without a browser extension.

## Risks And Open Questions

- Browser DevTools behavior differs between Chrome, Edge, Firefox, and Safari.
  Start with Chromium because it is easiest to automate and most common for Vite
  debugging.
- Attribute-level XMLUI event handlers are often single long strings. Good
  stepping may require formatting virtual source content or mapping to embedded
  script spans inside the original file.
- Generated helper code may create noisy stepping unless left unmapped.
- Expression bindings can run often during rendering; breakpoints in bindings
  may pause more frequently than users expect.
- Source maps with `sourcesContent` can expose source in development bundles.
  That is expected in dev mode but should be documented for production.
- Adding a source-map generator dependency may be useful, but should be weighed
  against the repo's dependency policy.
- Debug helper production behavior needs an explicit compatibility decision.

## Success Criteria

- Dev server returns non-empty source maps for `.xmlui` transforms.
- Browser DevTools can display original `.xmlui` source files.
- Basic event handler breakpoints can pause execution.
- Generated function names make call stacks recognizable.
- `debugBreak`, `debugLog`, and `debugTrace` work without installing a browser
  extension.
- Existing compiler, runtime, and build tests pass.
