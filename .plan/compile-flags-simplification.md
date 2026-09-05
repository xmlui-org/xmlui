# Plan — one switch for script compilation, one for its diagnostics

> **Status: implemented** on this branch. `compileScripts` and `reportCompileFallbacks`
> are the only compilation keys; the four listed under "What goes away" are removed and
> report their replacement when seen. Full unit suite green (11,293 tests); targeted E2E
> green in both modes. The full E2E run is the maintainer's to make.

## Why

Script compilation is configured today through five keys that read from three different
places and are consulted at eight different call sites:

| Key | Where it is read | What it controls |
| --- | --- | --- |
| `compileScripts` | app description, `xmlui.config.json`, plugin options, eval options | umbrella switch |
| `compileBindings` | eval options, parse-binding options, plugin options | binding path only |
| `compileEventHandlers` | parser options, code-behind options, eval options, plugin options | handler/declaration path only |
| `compiledScriptSourceMaps` | app description, plugin options, eval options, code-behind options | source-map payload |
| `logCompiledEventHandlerSource` | parser options, plugin options | prints generated JS |

Every bug in issues #3876 and #3879 was a variation of the same failure: one call site
read one of these keys and another read a different one. That is not a bug class worth
defending against one site at a time — the surface itself is the defect.

**Target: two public flags, read from the same two places, threaded as a single boolean
through every layer.**

## The two flags

### 1. `compileScripts: boolean` (default `false`)

One switch, everything compilable compiles: binding expressions, event handlers, inline
`<script>` functions, `.xmlui.xs` code-behind, `Globals.xs`, imported `.xs` helpers, and
inline component `codeBehind`. No per-path override exists any more.

Where compilation happens is an implementation detail the app author does not configure:

- **Build time** (`xmlui start`, `xmlui build`): handlers, code-behind, and script
  declarations are compiled into the emitted modules.
- **First use in the browser**: binding expressions, plus anything the build did not
  pre-compile. Prop values are stored as raw strings and parsed lazily in the browser, so
  bindings have no build-time artifact to carry — see "Out of scope" for what changing
  that would take.

### 2. `reportCompileFallbacks: boolean` (default `false`)

When `true`, every script block that could not be compiled is reported with a diagnostic
code, the construct that stopped compilation, and its source position — at build time in
the CLI output, and at runtime in the browser console plus the Inspector trace.

When `false` (the default), the per-block detail is silent but the **summary is not**:
the build and the startup banner still report how many artifacts were produced and how
many fell back, and point at the flag for detail. Silence about a fallback is what made
these bugs expensive; noise about every fallback on every build is what makes people turn
reporting off.

Shape of a reported fallback:

```
[xmlui] compile-unsupported-node: /src/Globals.xs#function-roleHint
        await expression at line 4, column 12 — falling back to interpretation
```

### Diagnostic codes

A `CompileDiagnosticCode` union, in the house style of `ConcurrencyCode`,
`FormDiagnosticCode`, and `A11yCode`:

| Code | Meaning |
| --- | --- |
| `compile-unsupported-node` | the compiler met a construct it cannot emit (`await`, an `async` arrow, …) |
| `compile-unserializable-literal` | a literal (e.g. a regular expression) that cannot be carried into an interpreted arrow |
| `compile-runtime-fallback` | a compiled artifact threw `UnsupportedCompiledScriptNodeError` at runtime and the interpreter took over |
| `compile-source-unavailable` | the block could not be compiled because its source or AST was unusable |

Each carries `severity`, `message`, `construct`, `sourceId`, and `line`/`column` where
known. Runtime entries ride the existing `pushXsLog` channel under a new `"compile"`
kind, so the Inspector picks them up like every other diagnostic family.

## What goes away

| Removed key | Replacement |
| --- | --- |
| `compileBindings` | `compileScripts` (no per-path control) |
| `compileEventHandlers` | `compileScripts` (no per-path control) |
| `compiledScriptSourceMaps` | automatic: source maps on under `xmlui start`, off in builds |
| `logCompiledEventHandlerSource` | `xsVerbose` already emits a `debug-source` trace per artifact |
| `XMLUI_COMPILE_BINDINGS`, `XMLUI_COMPILE_EVENT_HANDLERS` (test env) | `XMLUI_COMPILE_SCRIPTS` |

Removed keys are not silently ignored: when one appears in an app description or in
`xmlui.config.json`, the CLI and the runtime emit a single, specific notice naming the
replacement. That is cheaper to live with than a compatibility branch that keeps the
two-name split alive inside the engine, which is exactly what produced these bugs.

## Configuration sources

Both flags read from the same places, with the same precedence — unchanged from the
current merge order, and now applied to both flags identically:

```
xmlui.config.json (top level)  >  xmluiConfig  >  appGlobals
```

- **App description** (`src/config.ts` in Vite mode, `config.json` in standalone mode):
  under `xmluiConfig` or `appGlobals`. Both keys work in both records.
- **`xmlui.config.json`**: at the top level, or nested under `xmluiConfig` / `appGlobals`.
- The browser runtime reads the merged `xmluiConfig`-over-`appGlobals` view it already
  builds in `AppContent`.
- The build reads the app description through `loadXmluiPluginOptions()` — including the
  Vite module-runner path for descriptions that need `import.meta.glob`.

## Internal refactor

The public surface shrinks to two keys; the internals shrink to **one boolean plus one
diagnostics boolean**, carried unchanged through every layer:

| Module | Today | After |
| --- | --- | --- |
| `nodejs/bin/xmluiPluginOptions.ts` | 5 keys, alias resolution | 2 keys |
| `nodejs/vite-xmlui-plugin.ts` (`PluginOptions`) | 5 keys | 2 keys + internal `devServer` for source maps |
| `parsers/xmlui-parser/parser.ts` (`XmluiParserOptions`) | `compileEventHandlers`, `logCompiledEventHandlerSource` | `compileScripts`, `reportCompileFallbacks` |
| `parsers/scripting/code-behind-collect.ts` (`CodeBehindCollectionOptions`) | `compileEventHandlers`, `compiledScriptSourceMaps` | `compileScripts`, `sourceMaps` (internal) |
| `script-runner/BindingTreeEvaluationContext.ts` (`EvalTreeOptions`) | 4 keys | `compileScripts`, `sourceMaps` (internal) |
| `script-runner/ParameterParser.ts` (`ParseBindingOptions`) | `compileScripts`, `compileBindings` | `compileScripts` |
| `script-runner/eval-options.ts` | alias resolution for both paths | one read |
| `components-core/StandaloneApp.tsx`, `testing/fixtures.ts` | per-path options | one option |

`compiledScriptSourceMaps` survives as an **internal** option (`sourceMaps`), set by the
CLI for the dev server and by tests; it is no longer an app-facing key.

## Steps

Each step is independently reviewable and leaves the suite green.

1. **Diagnostics core.** `CompileDiagnosticCode`, the diagnostic record, the `"compile"`
   trace kind, and one reporter both the build and the runtime call. Unit tests for code
   selection and message formatting.
2. **Runtime flag plumbing.** `EvalTreeOptions`, `eval-options.ts`, `ParseBindingOptions`,
   `AttributeValueParser`, `eval-tree-sync` — single `compileScripts` read. Tests for
   bindings, handlers, and declarations all switching on the one flag.
3. **Parse/build flag plumbing.** `XmluiParserOptions`, `CodeBehindCollectionOptions`,
   `transform.ts`, `code-behind-collect.ts`, the Vite plugin, `xmluiPluginOptions.ts`,
   `viteConfig.ts`, `StandaloneApp.tsx`, `fixtures.ts`.
4. **Reporting.** Wire step 1 into both sides: gated per-block detail, ungated summary,
   `compiledUnsupportedReason` kept as the machine-readable field.
5. **Removed-key notices.** One-shot notice per removed key, in the CLI and at startup.
6. **Test-env collapse.** `compile-scripts-env.ts` and the two shim modules reduce to one
   env var.
7. **Docs.** `xmlui-config.md` (rewrite the compilation section around two flags),
   `app-globals.md` if it lists any of the removed keys, `.ai/xmlui/expression-eval.md`,
   `.ai/xmlui/build-system.md`, `standalone.ts` doc comments, changeset.

## Testing

- Unit tests per step; the full unit suite after each step (fast, ~25 s).
- Targeted Playwright specs only — `App.spec.ts`, `compiled-declaration-parity.spec.ts`,
  and the compiled-events specs.
- **The full E2E suite is run by the maintainer, not by me.** I will say when the branch
  is ready for that run and what to watch for.

## Risks

- **Test churn.** ~190 test references use the old key names. Mechanical, but large; it
  lands in step 2/3 and is reviewed as its own commit.
- **Apps that set only one path** (`compileEventHandlers: true` without `compileScripts`)
  change behaviour: they now compile bindings too. That is the intent of the merge, and
  the removed-key notice tells them.
- **`compiledScriptSourceMaps: false` as an escape hatch disappears.** Anyone who set it
  to work around a source-map problem loses the knob; builds no longer carry source maps
  at all, so the remaining exposure is the dev server only.

## Out of scope

- **Build-time compilation of binding expressions.** Prop values are parsed lazily in the
  browser today; pre-compiling them at build time means pre-parsing every prop into a
  `ParsedPropertyValue` at transform time (the `prepare-plan.md` work). Worth doing, much
  larger than this plan, and independent of the flag surface.
- Any change to what the compiler *can* compile — that was #3879.

## Decisions taken

1. **Diagnostics flag:** `reportCompileFallbacks`.
2. **Compilation flag:** `compileScripts` keeps its name.
3. **Removed keys:** removed outright, with a one-shot notice naming the replacement
   wherever one is seen. No dual-name branches survive inside the engine.
4. **Base branch:** `fix/3879-compiled-script-coverage` (PR #3879). If that PR does not
   merge, this branch rebases onto `main` and folds in the pieces it depends on.
