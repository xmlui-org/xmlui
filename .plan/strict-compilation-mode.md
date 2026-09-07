# Strict compilation: no silent interpretation

## Goal

When `compileScripts` is on, **everything** runs compiled. If any script would reach the
interpreter, the system fails loudly with enough detail to find the construct and fix it,
instead of quietly falling back.

The interpreter stays. It remains the fallback for `compileScripts: false`, the reference
implementation for parity tests, and the executor for paths that have no compiled target
yet. (Retiring it is a separate, later question — see `.plan/retire-the-interpreter.md`,
now deferred.)

## Why today's diagnostics cannot deliver this

There are **three** ways a script ends up interpreted, and the existing machinery only
sees the first:

| | How it happens | Reported today |
|---|---|---|
| **A. Explicit fallback** | the compiler threw `UnsupportedCompiledScriptNodeError`; the caller caught it and interpreted | yes — `compiledUnsupported` + a `compile-*` diagnostic |
| **B. Silent interpretation** | the compiled path *chose* to interpret: `runtime.arrow(...)` lazy arrows, and everything routed through the sync statement queue, which has no compiled target | **nothing at all** |
| **C. Never attempted** | `compileScripts` never reached the evaluation context — a hand-built `options` literal, or none | **nothing at all** |

Escalating today's `severity: "warn"` to `"error"` would only cover A. An app could then
report "0 fallbacks" while running mostly interpreted — the same failure shape as the
original bug report, where a build announced 835 compiled artifacts for an app that
executed none of them.

B and C are also where the audit found the real problems: `runCodeSync` (every `Table`
`rowDisabledPredicate`, per row, per render), lazy arrows in value position, and five
wiring gaps.

## The invariant

> With `compileScripts: true` and `strictCompilation: true`, **entering the interpreter is
> itself the error** — whatever the reason.

One rule, enforced at the interpreter's own entry points, catches A, B and C uniformly.
It needs no knowledge of *why* the interpreter was reached, which is exactly what makes it
proof against the next unknown category.

`strictCompilation` joins the established `strict*` family in `xmluiConfig`
(`strictConcurrency`, `strictDomSandbox`, `strictForms`, …) and follows its
`severity = strict ? "error" : "warn"` idiom.

### The tripwire

Guard the four doors into interpretation:

| Door | File |
|---|---|
| `evalBindingExpressionTree` | `script-runner/eval-tree-sync.ts:197` |
| `processStatementQueue` | `script-runner/process-statement-sync.ts` |
| `processStatementQueueAsync` | `script-runner/process-statement-async.ts` |
| `createArrowFunction` / `createArrowFunctionAsync` | `eval-tree-sync.ts:692`, `eval-tree-async.ts:682` |

Each checks a module-level boolean and throws `StrictCompilationViolationError` when set.
A module-level flag, not a context lookup: these are the hottest paths in the framework
and the check must cost one property read.

Note the flag cannot come from `evalContext.options` — category C is *precisely* the case
where those options are missing. It is set once from the resolved config (see
`script-compiler/build-settings.ts`, which already handles the `xmlui.config.json`-to-
browser route) and read globally.

## What must be true before strict mode can pass

Strict mode is a forcing function: switch it on today and a real app fails immediately.
That is the point — but the list has to be closable, so it is enumerated up front. From
the audit of 2026-09-07:

**Blockers — no compiled path exists**

1. **The synchronous statement queue has no compiled target.** `processStatementQueue`
   serves `event-handlers.ts:912` (`runCodeSync`), `eval-tree-sync.ts:784` (arrow bodies)
   and `RestApiProxy.ts:575`. Everything behind `getOrCreateSyncCallbackFn` — `Table`
   `rowDisabledPredicate`/`rowUnselectablePredicate`, `List` `groupBy`, `Slider`
   `valueFormat`, every sync callback prop — is interpreted, per row, per render. This is
   the single largest piece of work and gates strict mode entirely.
2. **Lazy arrows.** An arrow in value position (object literal, array literal, ternary
   branch, member assignment) emits `runtime.arrow(...)`: the AST is serialized into the
   bundle and interpreted on every call. `{ onOk: () => save() }` is the common shape.

**Compiler gaps — construct falls back**

3. `binding-sync`: destructured and rest arrow params (`({a}) => a` — very common; today a
   *hard error* already, since the binding path has no catch). Port from
   `event-async.ts:2200-2220`.
4. Both targets: destructured/rest params on named `function` declarations.
5. Both targets: object getters/setters, non-`let` for-init. (Destructuring assignment was
   listed here and is **not** a gap — the interpreter rejects it too, so it is a language
   boundary. Corrected in Phase 1.3.)
6. `async` arrows. (`await` was listed here and is **not** a gap either: the interpreter
   rejects it outright with "XMLUI does not support the await operator". Nothing to
   compile, and nothing to reject at parse time beyond what the language already does —
   though the parser accepting what the interpreter refuses is its own small wart.)

**Wiring gaps — category C**

7. `event-handlers.ts:889` (`runCodeSync`, no `options` key at all — also drops
   `allowConsole` and `strictDomSandbox`), `ComponentWrapper.tsx:329,365`,
   `PageableLoader.tsx:355`, `Backend.ts:120-155`, `RestApiProxy.ts:566`.

**Deliberate exclusions that will trip the wire**

8. `event-handlers.ts:636` skips compilation for `mockExecute` handlers, with no stated
   reason. Either justify it and add it to a narrow, documented allowlist, or remove it.

**Not a fallback, but must be fixed first**

9. **The regex miscompile.** `binding-sync.ts` `literalToJs` lacks the
   `canSerializeLiteral` guard that `event-async.ts:1670` has, so `JSON.stringify(/ /g)`
   yields `"{}"` and `text.replace(/ /g,'-')` silently returns `"a b c"`. Strict mode
   **cannot catch this** — it is not a fallback, it is a wrong answer. Fix it before
   strict mode, or strict mode will pass on an app that is computing the wrong thing.

## What the error has to say

Today's best output identifies the block but not the code or the cure:

```
compile-unsupported-node: /src/Globals.xs#function-roleHint
        await expression at line 4, column 12 — falling back to interpretation
```

Three things are missing. **The source text** — the position is there but not the line it
points at. **The fix** — "not supported by the compiler" does not tell an author what to
write instead. **The owner** — `Main.xmlui#event-690` names a file and an internal counter
(`transform.ts:1516`, `parseId`), not the component or the prop, so on a large file it
does not narrow anything.

Target shape:

```
[xmlui] Strict compilation: this script cannot be compiled.

  /src/components/TestCases/TestCaseList.xmlui:17:24
  Button onClick   (source id: /src/components/TestCases/TestCaseList.xmlui#event-690)

   17 |   const rows = await loadCases(suiteId);
      |                      ^^^^^ await expression

  await is not part of XMLScript: XMLUI already awaits async calls for you.
  Remove the `await` keyword — the value is the same either way.

  compile-unsupported-node · strictCompilation is on, so this is an error rather than a
  fallback to interpreted execution. Set "strictCompilation": false in xmlui.config.json
  to downgrade it to a warning.
```

Everything needed is already in hand at the point of failure: `sourceText` is passed to the
compile options (`transform.ts:1522`), and `UnsupportedCompiledScriptNodeError` carries
`nodeType`, `nodeTypeName` and `sourceRange` (`errors.ts:6-23`). The work is formatting
plus two additions: a per-construct fix hint, and enriching `sourceId` with the owning
component and prop.

For a **category B or C** violation there is no `UnsupportedCompiledScriptNodeError` to
read, so the message is shaped from the tripwire instead: which door was entered, the
`sourceId`/`nodeId` if the AST carries one, and a JS stack. Those messages should say
plainly that the construct *could* compile but this call site never asked — a different
problem with a different fix, and worth distinguishing in the text.

## Phases

### Phase 1 — Make compiled mode honest before making it strict

1.1 ~~Fix the regex miscompile (§9).~~ **Done.** Both targets render patterns as
`new RegExp(source, flags)` — direct emission and the serialized AST the lazy-arrow paths
embed — so a pattern is no longer a wrong answer in bindings, and no longer a fallback
cause in handlers. Also fixed the interpreter bug it exposed: the AST holds one `RegExp`
per literal, so `g`/`y` patterns carried `lastIndex` across evaluations. See
`script-compiler/literals.ts` and `tests/…/script-compiler/regex-literals.test.ts`.

Note for §9 and Phase 3: regular expressions are now off the fallback list entirely, and
`compile-unserializable-literal` has no remaining producer — nothing the parser builds can
reach it. The code stays as a guard, but strict mode should not expect to see that code.

1.2 ~~Close the five wiring gaps (§7).~~ **Done, with one correction to this plan.**

`ComponentWrapper` (×2), `PageableLoader` and `RestApiProxy` now derive their options from
the shared helpers. Three of them pass *options only, no app context*: they resolve loader
references and page selectors, and widening identifier resolution would change which
expressions resolve — a behaviour change smuggled into a wiring fix. `Backend.ts` takes
the build-settings route as planned; the known limit is that an app declaring
`compileScripts` only in its app description, never in `xmlui.config.json`, still gets an
interpreted mock backend, because nothing publishes that value to context-free call sites.

**`runCodeSync` is deliberately left uncompiled.** Wiring the switch there was assumed to
be a pure win. It is not: the sync statement queue has no compiled target, so enabling it
compiles the leaf expressions while control flow stays interpreted, and for the shapes
this call site actually serves that is a loss —

| shape | interpreted | compiled | |
|---|---|---|---|
| simple predicate | 2.46 µs | 3.29 µs | 1.34× slower |
| member chain | 2.25 µs | 3.26 µs | 1.44× slower |
| with a branch | 2.57 µs | 4.32 µs | 1.68× slower |
| array method | 6.08 µs | 4.39 µs | 1.39× faster |

Small expressions pay the artifact cache lookup without earning it back, and this runs per
row per render (`Table` `rowDisabledPredicate`, `List` `groupBy`, `Slider` `valueFormat`).
The *semantic* half of the gap is fixed — the context now carries `strictDomSandbox`,
`allowConsole` and the config-driven `defaultToOptionalMemberAccess`, so a sync callback no
longer slips the DOM sandbox that async handlers enforce — but `compileScripts` stays
`false` there until Phase 3.3 lands the `statement-sync` target, with the measurement
recorded at the call site.

Note this costs the tripwire nothing: `runCodeSync` enters `processStatementQueue`, so
Phase 2 will flag it either way.

1.3 ~~Extend the differential corpus…~~ **Done.**
`tests/components-core/script-compiler/conformance/` — 54 cases, executed by both paths,
comparing return value *and* resulting local context. Coverage is derived by walking each
parsed tree, so the corpus cannot drift from what it claims to cover, and is asserted
against two axes:

- **node type**, read from `ScriptingNodeTypes.ts` rather than restated, with an excuse
  list for types unreachable by construction — itself guarded, so it cannot become a
  dumping ground;
- **literal value kind**, because node-type coverage is *blind to the regex bug*. A
  pattern is a `T_LITERAL`, indistinguishable from a string to a walk over node types;
  deleting the regex case loses no node-type coverage at all. Verified both ways: removing
  it fails the value-kind axis and nothing else.

That blindness is the main lesson for Phase 3.1's inventory — grammar coverage is not
value coverage, and the bug that started this work lived in the gap between them.

**Three findings corrected the gap list.** `await`, destructuring assignment and `void`
are rejected by the *interpreter* too — they are language boundaries, not compiler gaps.
Earlier audits (and §3-6 of this plan) filed the first two as fallbacks, which overstated
the work. The real remaining list is four items: destructured arrow param, rest arrow
param, async arrow, destructured named-function param.

Separately: `var` parses as `T_VAR_STATEMENT`, then both paths discard it — the
declaration binds nothing and the compiled output omits it, so `var a = 1; return a;`
yields `undefined`. The two agree, so it is not a compilation bug, but it is a language
wart now pinned by a corpus case.

*Exit:* compiled and interpreted agree everywhere compilation is attempted. **Met.**

### Phase 2 — Build the tripwire and the diagnostic

2.1 ~~`StrictCompilationViolationError` plus the four entry-point guards.~~ **Done.**
`script-compiler/strict-compilation.ts` holds the flag and the error; the four doors are
guarded in `eval-tree-sync` (the interpreted branch of `evalBinding`, and the sync arrow
factory), `process-statement-sync`, `process-statement-async`, and the async arrow factory.
`strictCompilation` travels the same route as `compileScripts` — `xmlui.config.json` to app
define to runtime — and is armed from both config merge points, so a context-free call site
is covered like any binding. It is inert without `compileScripts`, and the config loader
says so rather than ignoring the combination.

Hot-path cost, measured A/B on member access with the guard removed and restored: median
1187 ns present against 1144 ns absent, ranges 1179-1284 and 1121-1232. The ranges overlap,
so the cost sits at the edge of what the harness resolves — consistent with one function
call returning a module boolean, which is what the plan required.

2.2 The error formatter: snippet with caret, owner, fix hint, code, and the escape hatch.
Add a `fix?: string` field to `CompileDiagnostic` and a per-construct hint table keyed by
node type — `await`, async arrow, regex literal, destructured param, getter/setter,
destructuring assignment each get a concrete rewrite.

2.3 Enrich `sourceId`. Carry the component name and prop/event name alongside the
`#event-N` counter from `transform.ts:1516`, so a violation names `Button onClick` and not
just an ordinal.

2.4 Build-time enforcement: with strict on, the Vite plugin fails the build and prints
**every** violation, sorted by file — not the first one. An author fixing twenty
constructs should not need twenty build cycles.

*Exit:* strict mode can be switched on and produces an accurate, complete, actionable list.

### Phase 3 — Use the list, then close it

3.1 Run strict mode over the docs corpus, all 118 component e2e specs, and the test apps.
Publish the resulting violation inventory — this is the real "what does not compile"
answer, replacing the audit's estimates with counts.

3.2 Close the compiler gaps (§3-6), highest frequency first. Each lands with corpus cases.

3.3 Build the `statement-sync` compiler target (§1) and wire the three call sites,
including `options: createEventEvalOptions(appContext)` on `runCodeSync`. Perf gate: the
statement-heavy benchmark currently runs **1.9× slower** compiled than interpreted
(4.93 → 9.59 ms over 1000 rows) precisely because control flow stays interpreted; that must
reach parity or better.

3.4 Compile value-position arrows natively (§2), removing the `runtime.arrow` path and the
serialized-AST payload — measured at 2895 chars of generated JS for a 30-char source,
against 332 for the same arrow in argument position.

3.5 Resolve `mockExecute` (§8).

*Exit:* the framework's own corpus passes strict mode with zero violations.

### Phase 4 — Make it the default for compiled apps

4.1 Default `strictCompilation` to `true` whenever `compileScripts` is on, keeping the
explicit opt-out.

4.2 One release with it on and reporting loudly, to surface constructs no corpus predicted.
The in-repo corpus demonstrably lacked the constructs that broke; CI evidence alone is not
sufficient grounds to call this done.

## Config surface

| Key | Default | Meaning |
|---|---|---|
| `compileScripts` | `false` | compile bindings, handlers and declarations |
| `strictCompilation` | `false` → `true` in Phase 4 | any interpretation under `compileScripts` is an error |
| `reportCompileFallbacks` | `false` | per-block detail when not strict; unchanged |

Strict mode without `compileScripts` is meaningless and should be rejected at config load
with a clear message, in the same place the removed-key notices are emitted
(`xmluiPluginOptions.ts`, `script-inventory.ts`).

## Risks

- **The tripwire sits in the hottest paths in the framework.** A module-level boolean read
  is the only acceptable cost; anything context-dependent will show up in render
  benchmarks. Measure before and after.
- **Phase 3.3 is a second full compiler target.** `event-async.ts` is 2,612 lines; the sync
  target should be smaller, but it is not a cleanup task.
- **Strict mode is unusable until Phase 3 completes.** Shipping the flag earlier is still
  worthwhile — it is how the violation inventory gets built — but it must be documented as
  a diagnostic tool, not a production setting, until then.
- **Turning a fallback into an error converts silent slowness into a hard failure.** That
  is the intent, but it means an app that upgrades and flips the flag can break at runtime
  on a code path its tests never hit. Phase 2.4's build-time enforcement is what keeps
  most of that at build time; runtime violations should stay possible only for constructs
  the build cannot see.

## Evidence

The gap list, the performance figures and the codegen sizes come from the audit of
2026-09-07, produced by executing the real compilers and interpreter: generated-JS
inspection for arrow emission, interpreted-vs-compiled value comparison for regex and
destructuring, artifact poisoning to determine which executor runs a declaration function,
and warmed micro-benchmarks over 1000-2000 row inputs.
