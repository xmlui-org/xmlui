# Retire the AST interpreter: make compiled mode the only mode

> **Status: deferred (2026-09-07).** The decision is to keep the interpreter and instead
> make compiled mode strict — any interpretation under `compileScripts` becomes an error
> rather than a silent fallback. See `.plan/strict-compilation-mode.md`, which supersedes
> this plan for now.
>
> Most of the work below is a prerequisite for strict mode anyway: closing the compiler
> gaps, building the sync-statement target, and compiling value-position arrows natively
> are Phases 1-3 there. What is deferred is only the deletion — Phases 4-5 here, plus the
> conformance-golden capture that deletion would require. If retirement is revived, the
> footprint map and the six re-entry points below remain accurate.

## Goal

Run every XMLScript path through the JavaScript compiler, then delete the tree-walking
interpreter from `xmlui/src/components-core/script-runner/`.

## Why this is not simply "delete the interpreter"

The interpreter is doing four distinct jobs today. Each has to be replaced or retired
separately, and three of them are invisible if you only look at the switch:

1. **It is the executor** for paths the compiler has no target for at all — most
   importantly the *synchronous statement queue* (`process-statement-sync.ts`, 972 lines).
2. **It is the safety net.** Every construct the compiler cannot emit falls back to it.
   Delete it and each of those becomes a hard runtime error.
3. **It is re-entered by compiled code.** `runtime.arrow(...)` serializes an arrow's AST
   into the emitted bundle and hands it back to the interpreter on every call. Compiled
   code depends on the interpreter existing.
4. **It is the specification.** XMLScript has no written semantics; the interpreter *is*
   the definition, and the compiler is checked against it. Removing it means the compiler
   becomes the spec, so a conformance suite has to exist first.

Job 4 is the one that decides the sequencing. The parity tests we have are hand-written
case lists (22 cases in `event-async-parity.test.ts`, ~20 in `binding-sync.test.ts`), and
a real correctness bug walked straight through them — see §1.1. Build the oracle before
trusting the thing it is meant to check.

## Verified starting state (2026-09-07)

Measured by executing both compilers against the real sources, not by reading them.

### Correctness

- **Regex literals in bindings silently miscompile.** `binding-sync.ts` `literalToJs`
  ends in `JSON.stringify(value)` with no `canSerializeLiteral` guard; `event-async.ts:1670`
  has one. `JSON.stringify(/ /g) === "{}"`.

  | binding | interpreted | compiled |
  |---|---|---|
  | `text.replace(/ /g, '-')` | `"a-b-c"` | `"a b c"` |
  | `text.split(/,\s*/)` | `["a","b","c"]` | `["a, b, c"]` |
  | `/^a/.test(text)` | `true` | `undefined` |

  No error, no diagnostic, no fallback marker. Turning compilation on changes results.

- **The binding path has no fallback catch.** Not in `evalBinding`
  (`eval-tree-sync.ts:136`), not in `evaluateCompiledBinding`
  (`binding-sync-executor.ts:36`). An unsupported construct is an app-breaking error, not
  a slow path. `rows.map(({ id }) => id)` — a very common idiom — throws
  `UnsupportedCompiledScriptNodeError`. The event path *does* catch and fall back
  (`event-handlers.ts:670`).

- Reported but **not reproduced**: `delete obj.prop` being a no-op in compiled handlers.
  It behaved identically in both modes under test. Re-check before acting on it.

### Performance

`compileScripts: true` is not uniformly a win. Same function, same input, same result,
called from a binding, 1000 rows:

| declaration body | interpreted | compiled |
|---|---|---|
| loops + `if` | 4.93 ms | **9.59 ms** (1.9× slower) |
| array methods | 4.90 ms | 1.38 ms (3.6× faster) |

Cause: there is no compiled target for the sync statement queue, so control flow stays
interpreted while every leaf expression now pays compile/cache-lookup overhead. Removing
the interpreter without building that target makes the slow case permanent.

### Silent interpreted paths

An arrow in *value* position — object literal, array literal, ternary branch, member
assignment — emits `runtime.arrow(...)`: the whole AST is `JSON.stringify`-ed into the
bundle and interpreted on every call. `{ onOk: () => save() }` is the common shape.
Nothing reports it: no `compiledUnsupported`, no diagnostic, and it counts as a compiled
artifact. Measured cost: **2895 chars of generated JS for a 30-char source**, against 332
for the same arrow in argument position, which compiles natively.

### Wiring gaps still dropping the switch

| Site | Evaluates | Heat |
|---|---|---|
| `container/event-handlers.ts:889` (`runCodeSync`) | context literal has no `options` key at all — `Table` `rowDisabledPredicate`, `List` `groupBy`, `Slider` `valueFormat`, every sync callback prop | per row, per render |
| `rendering/ComponentWrapper.tsx:329,365` | `extractParam` without `appContext` | every prop of every node on re-render |
| `loader/PageableLoader.tsx:355` | page selectors | twice per page fetch |
| `interception/Backend.ts:120-155` | every emulated-backend handler and helper | per API request |
| `RestApiProxy.ts:566` | arrow-valued request params | per request/chunk |

`Backend.ts` is the only genuinely blocked one — it can run in a worker with no React
context, so it needs the `script-compiler/build-settings.ts` route. The rest have
`appContext` in scope already.

Note that a hand-built context is not merely missing the flag: `eval-tree-sync.ts:201`
stamps it with a default `options` object, so the omission is invisible downstream.

### Known compiler gaps

Common enough to matter:

| Construct | binding-sync | event-async |
|---|---|---|
| destructured arrow param `({a}) => a` | **hard error** | OK |
| rest arrow param `(...a) => a` | **hard error** | OK |
| destructured/rest param on a named `function` | fallback | fallback |
| regex literal | **miscompiles** | fallback |
| `await` | fallback | fallback |
| async arrow | fallback | fallback |
| destructuring assignment `[a,b] = pair` | fallback | fallback |
| object getter/setter `{ get a() {} }` | fallback | fallback |
| non-`let` for-init | fallback | fallback |

`await` is a special case: the parser accepts it and the interpreter runs it, so it is
valid XMLScript, but neither target compiles it. The engine auto-awaits anyway, so it is
redundant — but writing it silently costs the whole handler its compilation.

### Corpus reality check

The repo's own 114 `.xmlui`/`.xs` files contain **zero** regex literals, **zero** `await`,
and **zero** destructured arrow params. That is why the regex bug survived. The in-repo
corpus cannot serve as the conformance suite; it has to be synthesized.

Available raw material: 311 `xmlui` code fences across 46 doc pages, 118 component
`.spec.ts` e2e files, and the existing `npm run test:e2e` / `test:e2e:compiled-scripts`
split, which is already a whole-app differential harness.

### Footprint

`xmlui/src/components-core/script-runner/` is **8,174 lines across 20 files** — but only
about half is interpreter. The split matters more than the total: anything misfiled as
deletable is a broken build.

**(a) Pure interpreter — deletable outright (~4,390 lines)**

| File | Lines | Carve-out to watch |
|---|---|---|
| `eval-tree-sync.ts` | 795 | `evalBinding` (:122) is today the *only* entry into compiled bindings (:146) — see Phase 5.2 |
| `eval-tree-async.ts` | 823 | :774-791 runs a declaration's `#function-` artifact — a fast path that disappears with it |
| `process-statement-sync.ts` | 972 | needs the Phase 3 target first |
| `process-statement-async.ts` | 971 | |
| `process-statement-common.ts` | 242 | `ensureMainThread` (:193) and `innermostBlockScope` (:32) are used by the shared `visitors.ts:50` — keep both |
| `statement-queue.ts` | 108 | the `QueueInfo` type (:74) is used by `utils/statementUtils.ts:307` — keep it |
| `simplify-expression.ts` | 447 | **already dead** — verified zero importers repo-wide outside its own test. Deletable today, independently of this plan |
| `abstractions/scripting/LoopScope.ts` | 20 | |
| `abstractions/scripting/TryScopeExp.ts` | 14 | |

**(b) Shared — the compiler already depends on these; must survive**

`sync-runtime.ts` (253) is the trap: despite living in `script-runner/`, it *is* the
compiler's sync runtime. `script-compiler/runtime.ts:13` and `event-runtime.ts:21` import
`readSyncIdentifier`, `readSyncMember`, `callSyncFunction`, `applySyncAssignment`,
`applySyncPrePost`, `deleteSyncTarget`, `notifySyncFunctionCallUpdate` and
`assertSyncResult` from it; its only interpreter consumer is `eval-tree-sync.ts:72`.

Also surviving: `bannedMembers.ts` (296), `bannedFunctions.ts` (82), `asyncProxy.ts` (243),
`BindingTreeEvaluationContext.ts` (202), `ScriptingSourceTree.ts` (610),
`ParameterParser.ts` (227), `AttributeValueParser.ts` (142), `eval-options.ts` (98),
`eval-trace.ts` (22), `visitors.ts` (712), `LogicalThread.ts` (41), `BlockScope.ts` (17),
and `udc-sandbox/` (878).

**`eval-tree-common.ts` (929) must be SPLIT, not kept.** Only these are reachable from
compiled code — verified by import graph, each with 1-4 external consumers:
`handleMemberBan` (:58), `isPromise` (:108), `completePromise` (:113),
`checkUdcCapability` (:183), `getIdentifierScope` (:208), `obtainClosures` (:695),
`getAllowedNewConstructor` (:773). Roughly **260 lines survive, ~670 go** — the
`eval*Core` family, `createClosureEvalContext`, `createArrowWorkingThread` and friends
have no consumer outside the two `eval-tree-*` files.

Realistic deletion target: **≈5,050 lines.**

**(c) Interpreter-only today, needs a compiled equivalent first**

1. `processStatementQueue` — no sync-statement target exists. Two production callers:
   `event-handlers.ts:912` (`runCodeSync`) and `RestApiProxy.ts:575`.
2. `executeArrowExpression` / `executeArrowExpressionSync` — the load-bearing re-entries.
3. `hoistFunctionDeclarations` (`process-statement-common.ts:210`) — the compiled path
   relies on native JS hoisting instead; verify parity before dropping.
4. `evalBinding` as dispatcher — external callers must be repointed at
   `evaluateCompiledBinding`: `StandaloneApp.tsx:1383, :2482, :2588`,
   `utils/extractParam.ts:70, :87`, `state/variable-resolution.ts:123`,
   `APICall/APICallReact.tsx:168, :205`.

### The six compiled → interpreter re-entries

While any of these exist, the interpreter cannot be deleted however good the compiler gets.

| # | Site | Interpreter fn | Condition |
|---|---|---|---|
| 1 | `script-compiler/runtime.ts:83` | `executeArrowExpressionSync` via `compiledArrowInvoker` | compiled binding calls a lazy arrow object |
| 2 | `script-compiler/runtime.ts:95` | same | lazy arrow passed as an argument to a host function |
| 3 | `eval-tree-sync.ts:138-147` | installs the invoker | **the wiring that makes 1 and 2 work** — delete this file and `runtime.ts` loses its arrow invoker |
| 4 | `script-compiler/event-runtime.ts:337` | `executeArrowExpression` | compiled handler calls a lazy arrow directly |
| 5 | `script-compiler/event-runtime.ts:348` | `executeArrowExpression` | lazy arrow passed as a callback from compiled event code |
| 6 | `container/event-handlers.ts:672→686` | `processStatementQueueAsync` | compiled handler rejects at runtime → full interpretation |

Plus one in reverse: `eval-tree-async.ts:774-791`, where the *interpreter* runs a
declaration's compiled artifact.

### Thread model

Generated JS uses **native JS scoping** for locals — `emitVarDeclaration`
(`event-async.ts:959`) writes real `let`/`const`, `emitBlockStatement` (:1055) writes
literal braces, loops emit native `let` and native `break`/`continue`, and `artifact.ts:126`
builds `new Function("runtime","evalContext","thread", body)` that "closes over nothing".

But `thread` is still threaded through every runtime call, because `getIdentifierScope`
(`eval-tree-common.ts:208`) walks `thread.blocks` → `thread.closures` → `thread.parent`
before falling back to `localContext`. And `setBlockReturnValue` (`event-runtime.ts:246`)
parks the handler's return value on `thread.blocks[last].returnValue`, which
`event-handlers.ts:913` reads back.

So `LogicalThread`/`BlockScope`, `getIdentifierScope`, `obtainClosures` and
`setBlockReturnValue` are (b) — but *only* because lazy arrows exist and the return-value
convention is thread-based. The allocation machinery — `createClosureEvalContext`,
`createLayeredScope`, `createArrowWorkingThread`, `removeArrowWorkingThread`, and the
block/loop push-pop discipline — is used solely by the two arrow factories, so it is (a).

**This resolves the sequencing question: kill lazy arrows first.** Make arrows always emit
native JS and move the return-value convention off `thread.blocks`, and the whole
thread/closure allocation layer collapses on its own.

### Test surface

**~42-44 test files and ~1,040-1,080 cases** exercise the interpreted path, out of 281
test files — ~15% of files but a much larger share of assertions.

| Location | Files | Cases | Interpreter-specific |
|---|---|---|---|
| `tests/components-core/scripts-runner/` | 31 | 695 | 25 files / ~609 cases |
| `tests/parsers/scripting/` | 48 | 1,015 | 17 files / ~430 cases; the other 31 are lexer/parser tests and survive |
| `script-compiler/event-async-parity.test.ts` | 1 | ~21 | pure parity harness — convert to goldens |
| `compiled-events/`, `compiled-sync/` | 12 | 131+ | compiled-only — survive |

Two levers: `tests/components-core/scripts-runner/` and `tests/parsers/scripting/` are
**largely duplicates** (`process-statement.test.ts` is 84-85 cases in both), so retarget one
copy at the compiled path and delete the other — roughly halving the work. Both share a
`test-helpers.ts` whose `createEvalContext` hand-builds `mainThread`; that helper is the
single seam to change.

The 31 `compileScripts: false` occurrences are concentrated in config-plumbing tests
(`nodejs/xmlui-plugin-options.test.ts`, `script-runner/eval-options.test.ts`); those change
meaning rather than disappearing.

## Design decisions

1. **The interpreter is the oracle until the day it is deleted.** Every phase before
   Phase 5 keeps it runnable, and CI runs both paths differentially.
2. **No behaviour changes smuggled in.** Where compiled and interpreted disagree, the
   interpreter wins by default and the compiler is fixed to match — except where the
   interpreter is provably wrong, which needs an explicit, recorded decision.
3. **Fallbacks must reach zero before the net is removed**, and be *proven* zero in the
   field, not just in CI.
4. **Shrink the language before growing the compiler** where a construct is redundant.
   `await` is the clear case: the engine auto-awaits, so it can be rejected at parse time
   with a fix-it rather than compiled.
5. **Perf is a gate, not an outcome.** No phase lands that regresses a benchmark.

## Phases

Each phase is independently shippable and leaves the framework working.

---

### Phase 0 — Make compiled mode trustworthy

Nothing else is safe until compiled mode is correct where it already claims to work.

**0.1 Fix the regex miscompile.** Add the `canSerializeLiteral` guard to
`binding-sync.ts` `literalToJs` (mirror `event-async.ts:1670`, `:2546-2555`). Until
Phase 1 gives regex a real emission strategy, this converts a silent wrong answer into an
honest fallback.
*Verify:* the three table rows in §Correctness agree across both paths.

**0.2 Decide the binding-path fallback policy.** Today an unsupported node in a binding
throws. Either (a) add a catch mirroring `event-handlers.ts:670` so bindings fall back and
report like handlers do, or (b) keep it strict and accept that `compileScripts: true` can
crash an app. Recommend (a) for now — it makes the flag safe to enable, and Phase 4 turns
strictness back on deliberately once fallbacks are zero.
*Verify:* `rows.map(({id}) => id)` returns `[1,2]` with compilation on.

**0.3 Close the five wiring gaps** in §Wiring gaps. Four are one-liners with `appContext`
already in scope. `Backend.ts` needs the build-settings route.
*Verify:* a regression test per site, each confirmed to fail without the fix — the pattern
used in `binding-compilation-wiring.test.ts`.

**0.3b Delete `simplify-expression.ts`** (447 lines). Verified to have zero importers
repo-wide outside its own 39-case test. Unrelated to the interpreter question and safe
today — taking it now shrinks the surface everything else has to reason about.

**0.4 Build the differential conformance harness.** This is the load-bearing deliverable
of Phase 0.
- A single corpus of XMLScript snippets covering the whole language surface, organised by
  AST node type, with a coverage report keyed to `ScriptingSourceTree.ts` so gaps are
  visible.
- Each snippet runs through the interpreter and both compiler targets; values *and*
  resulting local context must agree.
- Seed it from the 311 doc fences and the existing hand-written parity cases, then fill
  every uncovered node type deliberately. The corpus must contain what the repo's own
  sources lack: regex, destructuring in every position, getters, generators, async shapes.
- Wire into CI as a required check.
*Verify:* the harness reproduces the regex and destructured-param bugs on a pre-0.1 tree.

**Exit:** compiled mode produces the same answers as interpreted mode everywhere it does
not fall back, and the harness can prove it.

---

### Phase 1 — Close the compiler feature gaps

Drive fallbacks to zero, one construct at a time, each with a corpus case.

**1.1** `binding-sync`: destructured and rest arrow parameters. Port the working
implementation from `event-async.ts:2200-2220`. Highest value — most common idiom.

**1.2** Both targets: destructured and rest parameters on named `function` declarations
(`getSimpleArgName`, `binding-sync.ts:736`, `event-async.ts:2457`). Note the current
asymmetry — arrows may destructure, named functions may not.

**1.3** Both targets: regex literals with a real emission strategy (emit a `RegExp`
constructor call rather than serializing the value), destructuring assignment
(`emitWriteExpression`), object getters/setters, non-`let` for-init.

**1.4 Language decisions**, recorded in the plan before implementation:
- `await` — recommend rejecting at parse time with a fix-it ("remove `await`; XMLUI awaits
  for you"), rather than compiling it. Zero occurrences in the repo corpus.
- `async` arrows — same question; the interpreter rejects them in most positions already.
- Anything the parser accepts but no one can execute should be removed from the grammar.

**1.5 Verify function-declaration hoisting parity.** The interpreter hoists explicitly
(`hoistFunctionDeclarations`, `process-statement-common.ts:210`); the compiled path relies
on native JS hoisting. Those are not obviously identical for declarations inside blocks
and branches. Add corpus cases before assuming they agree.

**Exit:** the conformance corpus compiles with zero fallbacks in both targets.

---

### Phase 2 — Remove compiled → interpreter re-entry

While these exist, the interpreter cannot be deleted no matter how good the compiler gets.

**2.1 Compile value-position arrows natively.** Replace `runtime.arrow(...)` with a real
JS closure. The hard part is closure capture: the lazy path captures `closureContext` via
`obtainClosures`; native emission must capture the same bindings with JS scoping.
`event-async.ts:2057-2062` already refuses the lazy path when an arrow closes over a
compiled local — that check becomes unnecessary once this works.
*Verify:* the 2895-char figure in §Silent interpreted paths drops to the same order as the
332-char native case; corpus parity holds for arrows stored in objects, arrays, ternaries
and member assignments.

**2.2 Delete `compiledArrowInvoker`** — re-entries 1-3 in the table above
(`runtime.ts:83`, `:95`, and the installer at `eval-tree-sync.ts:138-147`) — and the
event-side equivalents, re-entries 4-5 (`event-runtime.ts:337`, `:348`). Re-entry 6 is
Phase 4's business: it is the fallback net, removed only once fallbacks are proven zero.

**2.2b Move the return-value convention off the thread.** `setBlockReturnValue`
(`event-runtime.ts:246`) parks a handler's result on `thread.blocks[last].returnValue` and
`event-handlers.ts:913` reads it back. Until that becomes a plain return value, the block
machinery cannot go even after 2.1.

**2.3 Remove the `T_ARROW_EXPRESSION` exclusion** at `eval-tree-sync.ts:136`.

**2.4 Use the `#function-` artifact on the sync path.** `createArrowFunctionAsync`
(`eval-tree-async.ts:774-791`) executes a declaration's compiled artifact;
`createArrowFunction` (`eval-tree-sync.ts:692`) does not — verified by poisoning the
artifact and observing which value came back. Deliberate per
`.plan/compile-script-declarations.md:229`; revisit that decision here.

**Exit:** no generated code path re-enters the interpreter. `grep` for the interpreter's
exports from `script-compiler/` returns nothing.

---

### Phase 3 — Build the missing target: synchronous statements

The largest single piece of new work, and the one that removes the perf regression.

**3.1 New target `script-compiler/targets/statement-sync.ts`.** Same emission strategy as
`event-async`, minus `await`: `assertSyncResult` guards where the async target awaits.
Only three non-interpreter call sites need it — `event-handlers.ts:912` (`runCodeSync`),
`eval-tree-sync.ts:784` (arrow bodies), `RestApiProxy.ts:575`.

**3.2 Wire those three sites**, including `options: createEventEvalOptions(appContext)` on
`runCodeSync`, which today also drops `allowConsole` and `strictDomSandbox` — a semantic
divergence, not just a perf one.

**3.3 Perf gate.** The loops+`if` benchmark in §Performance must go from 1.9× slower to at
least parity with interpreted, and ideally match the array-method case. Add it as a
tracked benchmark alongside `measure:compiled-bindings` / `measure:compiled-events`.

**Exit:** `processStatementQueue` has no callers outside the interpreter itself.

---

### Phase 4 — Flip the default and prove it in the field

**4.1** Default `compileScripts` to `true`. Keep the opt-out for one release.

**4.2** Add a strict mode that turns any fallback into a build error, and make it the
default in CI. This is where 0.2's leniency is deliberately reversed.

**4.3** Soak. `reportCompileFallbacks` already exists; make one release report fallbacks
loudly so real apps surface constructs the corpus missed. **Do not proceed to Phase 5 on
CI evidence alone** — the repo corpus demonstrably lacked the constructs that broke.

**4.4** Remove the `compileScripts` switch, its plugin options, the app defines added in
PR #3893, and `script-compiler/build-settings.ts`.

**Exit:** no app can select interpreted mode; a full release cycle with zero reported
fallbacks.

---

### Phase 5 — Delete the interpreter

Mechanical once Phases 0-4 hold.

**5.1 Re-home shared helpers.** Move what the compiler runtime calls out of interpreter
files into a neutral module: `eval-tree-common.ts` helpers, `sync-runtime.ts` banned
checks and state-change notification, `bannedMembers.ts` / `bannedFunctions.ts`. Do this
as a pure move with no behaviour change, in its own commit, so the deletion diff stays
reviewable.

**5.2 Delete category (a)** — ~4,390 lines, plus the ~670 interpreter-only lines of
`eval-tree-common.ts`, for ≈5,050 total. Respect the four carve-outs named in §Footprint:
`ensureMainThread` and `innermostBlockScope` (used by `visitors.ts`), the `QueueInfo` type
(used by `statementUtils.ts`), and the surviving ~260 lines of `eval-tree-common.ts`.

Before deleting `eval-tree-sync.ts`, repoint the seven external `evalBinding` callers at
`evaluateCompiledBinding` (list in §Footprint (c)); `evalBinding` is currently the only
door into the compiled binding path, so removing it silently is the easiest way to break
everything at once.

`asyncProxy.ts` goes only if nothing can still hand a promise-returning callback to a host
array method — check after Phase 2, not before.

**5.3 Remove the fallback machinery**: `compiledUnsupported`,
`compiledUnsupportedReason`, `parseTimeCompilationUnsupported`
(`event-handlers.ts:265-276`), the `compile-runtime-fallback` diagnostic code, and the
`notAttempted` branch of `script-inventory.ts`. The build summary loses its "N fell back"
clause, and the kind counts added in PR #3893 become the whole story.

**5.4 Rewrite the test surface** — ~42-44 files, ~1,040-1,080 cases (§Footprint). Every
parity test loses its oracle, so the corpus harness switches from differential to
golden-value assertions. **Capture those goldens in Phase 0**, while the oracle still
exists; doing it here is too late.

Use the duplication lever: `tests/components-core/scripts-runner/` and
`tests/parsers/scripting/` are largely the same suite twice over. Retarget one at the
compiled runtime, delete the other, and change the shared `test-helpers.ts`
`createEvalContext` — that one helper is the seam for both.

**5.5 Delete the dead paths** found in the audit: `evaluateCompiledBindingExpressionSource`
(no production callers), the parse-time binding compilation in `ParameterParser` /
`AttributeValueParser` (`ParseBindingOptions.compileScripts` is never passed by any of the
three runtime callers), and `isCompiledEventDiagnosticEnabled`
(`event-async-executor.ts:14-17`, hard-wired `return false`).

---

## Exit criteria for the whole effort

1. Conformance corpus covers every node type in `ScriptingSourceTree.ts`, with a coverage
   report proving it.
2. Zero fallbacks across corpus, docs examples, and all 118 component e2e specs.
3. No benchmark regressed; the statement-heavy sync case at parity or better.
4. One full release with fallback reporting on and no field reports.
5. `xmlui/src/components-core/script-runner/` contains no evaluator.

## Risks

- **The corpus is the whole safety argument.** If it under-covers, bugs ship as hard
  errors instead of silent fallbacks. Coverage must be measured against the node-type
  universe, not counted in cases.
- **Closure capture in Phase 2.1** is the subtlest work. Native JS scoping and the
  interpreter's `closureContext` are not obviously equivalent for every capture shape.
- **Phase 3 is a second full compiler target.** `event-async.ts` is 2,612 lines; the sync
  target should be smaller, but budget accordingly.
- **Bundle size** may rise as more constructs compile natively, offset by removing the
  serialized ASTs from 2.1 and ~3,300 lines of interpreter. Track it with
  `measure:standalone-size` throughout.
- **`await` rejection is a breaking change** for any app that wrote it. Zero occurrences in
  this repo, but external apps are unmeasured — needs a deprecation window.

## Evidence

Findings in "Verified starting state" were produced by executing the real compilers and
interpreter (throwaway harnesses under the session scratchpad, nothing committed):
generated-JS inspection for arrow emission and codegen size; interpreted-vs-compiled value
comparison for regex and destructuring; artifact poisoning to determine which executor
runs a declaration function; and warmed micro-benchmarks over 1000-2000 row inputs for the
performance table.
