# Expression Evaluation & Scripting

## Architecture Overview

XMLUI has its own scripting language — a **restricted JavaScript subset** with custom semantics. The pipeline has three stages:

1. **Parse** — XML attribute string → `AttributeValueParser` → literal + expression segments → `Parser` → AST
2. **Evaluate** — AST → `eval-tree-sync` (binding expressions) or `eval-tree-async` (event handlers/code-behind) → result
3. **Track** — `visitors.ts` → `collectVariableDependencies()` → dependency list for reactive re-evaluation

## Lexical Scoping and Dependency Optimization

The framework tracks dependencies in binding expressions using an AST crawler (`collectVariableDependencies()`).

To optimize performance and prevent redundant re-renders (where changing irrelevant parent context variables triggers a re-eval), the framework employs a **Lexical Scoping Optimizer** (`xmlui/src/components-core/optimization/computedUses.ts`).

1. **Strict Dependency Tracking**:
   - During AST parsing, the optimizer scans all `$`-prefixed variables (e.g. `$checked`, `$itemIndex`, `$newValue`).
   - If a variable is **not** explicitly declared by the component exposing the template or event handler, it is aggressively stripped from the component's `uses` (dependencies list).
   - This ensures that a component re-renders _only_ when variables relevant to its own scope change, ignoring noise from higher up the component tree.
2. **Metadata Contract**:
   - The engine relies entirely on component metadata to know what is legitimately injected.
   - A component declares variables exposed to its templates via `childInjectedVars: ["$var1"]` at the root level of its `createMetadata()` definition.
   - It declares variables exposed to specific event handlers via `injectedVars: ["$var2"]` inside the event's descriptor (`events: { click: { injectedVars: [...] } }`).

3. **Runtime Validation (Approach 1)**:
   - Because React prop-delegation can mask static analysis (e.g. `Checkbox` delegating to `Toggle`), the optimizer uses **Runtime Validation**.
   - In `(import.meta.env.DEV)` mode ONLY, whenever `wrapComponent` or `ComponentAdapter` injects `contextVars` for a template or action, it intercepts them via `validateInjectedVars.ts`.
   - If a script injects a `$` variable into the runtime scope that is NOT listed in the metadata, a console warning (`[XMLUI Lexical Scoping]`) is thrown. This protects developers from accidental non-reactive holes when creating new components.

4. **The Exception**:
   - `$context` is globally available and bypasses the lexical scoping optimizer entirely.

## Two Evaluation Tracks

| Track     | Entry point                                      | Used for                                             | Promise handling                                                                        |
| --------- | ------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Sync**  | `evalBindingExpression()`, `evalBinding()`       | Attribute bindings (`value="{expr}"`), reactive vars | Throws `"Promises (async function calls) are not allowed in binding expressions."`      |
| **Async** | `evalBindingAsync()`, `executeArrowExpression()` | Event handlers (`onClick`), code-behind execution    | Resolves via `completePromise()` — recursively awaits nested promises in arrays/objects |

Both tracks set `defaultToOptionalMemberAccess: true` by default.

## Compiled Script Source Maps

The JavaScript compiler targets (`components-core/script-compiler`) carry source metadata on every
`CompiledScriptArtifact`: `sourceId`, optional `sourceUrl`, `displayName`, `sources`,
`sourceRange`, generated `js`, and generated-offset mappings. The source-map builder converts those
intermediate mappings into Source Map v3.

`xmluiConfig.compileScripts` is the preferred public switch for JavaScript-compiled XMLUI scripts.
It enables supported binding expression and event-handler compilation. The older
`compileBindings` and `compileEventHandlers` keys are still accepted as compatibility aliases when a
caller needs to opt a target in or out independently.

`xmluiConfig.compiledScriptSourceMaps` controls runtime debug comments for compiled scripts. In
Vite dev server mode, source maps default to `"external"` whenever script compilation is enabled,
unless config explicitly sets `compiledScriptSourceMaps: false`.

- `"external"` — preferred for Vite dev server. Generated `new Function(...)` bodies receive
  `sourceURL` and an external `sourceMappingURL` that points at the `/@xmlui-source/...` endpoint.
- `"inline"` — fallback mode for runtime environments without a dev-server source endpoint.
- `false` — no debug source-map comments are emitted.
- unset — dev server compiled-event mode defaults to `"external"`; other modes stay off unless
  explicitly enabled.

When `xsVerbose` and `compiledScriptSourceMaps` are both enabled, the compiled executors emit one
deduplicated `kind:"debug-source"` Inspector trace event per artifact/range. The event contains
metadata only (source URL, original file, target, range, artifact ID, sourcemap mode), not full source
text.

## Reactive Cycle Detection

Reactive bindings are also inspected as a graph. `collectComponentDefGraph()`
registers one node for each user `var`, code-behind function, and
DataSource/APICall loader, then uses `collectVariableDependencies()` to add
edges for identifiers that resolve in the same component scope. `findCycles()`
runs Tarjan strongly-connected-components detection and formats each cycle with
`formatCycle()`.

The detector is visible in three places:

- Runtime: `AppContent` runs the analyzer once after mount, emits
  `kind:"reactive-cycle"` trace entries, and dedupes with `cycleHash()`.
  `App.appGlobals.strictReactiveGraph` defaults to `true`; set it to `false`
  for warn-only migration mode.
- Language server: `reactive-cycle-diagnostic.ts` emits `Warning` or
  `Information` diagnostics with `code:"reactive-cycle"`, stable
  `data.cycleId`, and `relatedInformation` for every cycle member whose parser
  range is known.
- Vite: `reactiveCycles: "off" | "warn" | "strict"` checks each XMLUI file
  during `transform` and runs an aggregate `buildEnd` pass over all parsed
  roots.

## Differences from JavaScript

### 1. Optional Chaining Is Default

All member access, computed member access, and function invocations use optional chaining semantics by default. `obj.prop` behaves like `obj?.prop`; `obj[key]` behaves like `obj?.[key]`; `fn()` behaves like `fn?.()`.

- Controlled by `evalContext.options.defaultToOptionalMemberAccess` (default: `true`)
- Source: `evalMemberAccessCore()`, `evalCalculatedMemberAccessCore()`, and function invocation in both sync/async evaluators
- Consequence: `null.foo` returns `undefined` instead of throwing `TypeError`
- The explicit `?.` operator in source code is redundant but harmless — it sets `expr.opt = true` which is OR'd with the default

### 2. Banned globalThis Functions

18+ functions on `globalThis` are blocked at runtime via `isBannedFunction()`:

| Banned function                                                                     | Help text                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `eval`                                                                              | —                                          |
| `setTimeout`                                                                        | `"Use 'delay'"`                            |
| `setInterval`                                                                       | —                                          |
| `setImmediate`                                                                      | —                                          |
| `clearTimeout`                                                                      | —                                          |
| `clearInterval`                                                                     | —                                          |
| `clearImmediate`                                                                    | —                                          |
| `requestAnimationFrame`                                                             | —                                          |
| `cancelAnimationFrame`                                                              | —                                          |
| `requestIdleCallback`                                                               | —                                          |
| `cancelIdleCallback`                                                                | —                                          |
| `queueMicrotask`                                                                    | —                                          |
| `Function` (constructor)                                                            | `"Dynamic code execution is not allowed."` |
| `WebAssembly.compile` / `instantiate` / `compileStreaming` / `instantiateStreaming` | `"WebAssembly execution is not allowed."`  |
| `WebAssembly.Module` / `WebAssembly.Instance` constructors                          | —                                          |

Error: `"Function {name} is not allowed to call. {help}"`

Source: `bannedFunctions.ts`. The `debugger` statement is rejected at parse time (W046).

### 2a. Banned Member Access (DOM Sandbox)

A second guard, `isBannedMember(receiver, key)` in `bannedMembers.ts`, runs on every identifier read, member read, computed-member access, and assignment via `eval-tree-common.ts` (`evalIdentifier`, `evalMemberAccessCore`, `evalCalculatedMemberAccessCore`, `evalAssignmentCore`). Denylists cover ~99 entries:

- **Globals** (47): `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `indexedDB`, `caches`, `cookieStore`, `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `Worker`, `SharedWorker`, `MessageChannel`, `BroadcastChannel`, `Atomics`, `SharedArrayBuffer`, `crypto`, `console`, `MutationObserver`, `ResizeObserver`, `IntersectionObserver`, `PerformanceObserver`, `Notification`, `PushManager`, etc.
- **`document.*`** (21): `body`, `head`, `documentElement`, `cookie`, `domain`, `title` setter, `write`, `writeln`, `execCommand`, `createElement`, `querySelector`, `getElementById`, etc.
- **`navigator.*`** (13): `clipboard`, `geolocation`, `mediaDevices`, `permissions`, `serviceWorker`, `sendBeacon`, `bluetooth`, `usb`, `serial`, `hid`, `credentials`, `locks`, `share`.
- **DOM-mutation setters** (18) on `Element`/`Node`: `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `appendChild`, `insertBefore`, `replaceChild`, `removeChild`, `replaceWith`, `before`, `after`, `prepend`, `append`, `setAttribute`, `removeAttribute`, etc.

**Modes** (controlled by `App.appGlobals.strictDomSandbox`, default `false`):

- `false` — emits a `sandbox:warn` trace entry but allows the access.
- `true` — throws `BannedApiError`.

**Sanctioned replacements** wired into the global expression scope:

| Banned API                                            | Replacement                                                                                           |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `console.*`                                           | `Log.debug` / `Log.info` / `Log.warn` / `Log.error`                                                   |
| `crypto.getRandomValues`                              | `App.randomBytes(n)`                                                                                  |
| `performance.now` / `mark` / `measure`                | `App.now()` / `App.mark(name)` / `App.measure(...)`                                                   |
| `fetch` / `XMLHttpRequest`                            | `App.fetch(url, init?)` (CSRF, `appGlobals.allowedOrigins` allowlist, `app:fetch` trace)              |
| `WebSocket` / `EventSource`                           | `<WebSocket>` / `<EventSource>` components                                                            |
| `navigator.userAgent`, `platform`, `connection`, etc. | `App.environment` (curated, fingerprint-safe)                                                         |
| `navigator.clipboard.writeText`                       | `Clipboard.copy(text)`                                                                                |
| `window.open`, `window.location.href = …`             | `navigate(to, { target: "_blank" \| "_self" })` (`_blank` uses `noopener,noreferrer`)                 |
| Raw global mutable state                              | `AppState` with `App.appGlobals.appStateKeys` schema (undeclared bucket throws `AppStateSchemaError`) |

See `dev-docs/plans/managed-react.md` Appendix A and `dev-docs/plans/17-dom-api-hardening.md` for the full plan and rollout history.

### 3. `new` Operator — Only 4 Constructors Allowed

| Constructor     | Allowed                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| `String`        | Yes                                                                                    |
| `Date`          | Yes                                                                                    |
| `Blob`          | Yes                                                                                    |
| `Error`         | Yes                                                                                    |
| Everything else | **No** — throws `"XMLUI does not support the new operator with constructor '{name}'."` |

Source: `allowedNewConstructors` in `eval-tree-common.ts`
**Future:** This whitelist will be extended in future releases to support additional safe constructors.

### 4. `async`/`await` — Parsed but Rejected at Runtime

| Construct                          | Parser                                        | Runtime                                                         |
| ---------------------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `async function name() {}`         | Parsed → `T_ASYNC_FUNCTION_DECLARATION`       | Throws: `"XMLUI does not support async function declarations."` |
| `async () => {}` / `async x => {}` | Parsed → `ArrowExpression` with `async: true` | Throws: `"XMLUI does not support async arrow functions."`       |
| `await expr`                       | Parsed → `T_AWAIT_EXPRESSION`                 | Throws: `"XMLUI does not support the await operator."`          |

The parser accepts `async` syntax (allowing future support), but the evaluator rejects it unconditionally.

### 5. Array Methods — Async Proxy Migration

In the **async** evaluator only, 8 array methods are transparently replaced with async-aware proxies:

| Method                      | Async proxy behavior                                     |
| --------------------------- | -------------------------------------------------------- |
| `Array.prototype.filter`    | `Promise.all(arr.map(predicate))` then filter by results |
| `Array.prototype.map`       | Sequential `await predicate(item, i, arr)`               |
| `Array.prototype.forEach`   | Sequential `await predicate(item, i, arr)`               |
| `Array.prototype.every`     | `Promise.all(arr.map(callback))` then check all          |
| `Array.prototype.some`      | `Promise.all(arr.map(predicate))` then check any         |
| `Array.prototype.find`      | `Promise.all(arr.map(predicate))` then find first        |
| `Array.prototype.findIndex` | `Promise.all(arr.map(predicate))` then find first index  |
| `Array.prototype.flatMap`   | `Promise.all(arr.map(predicate))` then flatMap results   |

Proxy activation: `getAsyncProxy(fn, origArgs, context)` in `asyncProxy.ts`. Called during function invocation in `eval-tree-async.ts` only. The sync evaluator does NOT use proxies.

Key detail: `filter`, `every`, `some`, `find`, `findIndex`, `flatMap` evaluate all predicates in parallel (`Promise.all`). `map` and `forEach` evaluate **sequentially**.

### 6. Sync Binding: Promises Are Errors

In the **sync** evaluator, after every function invocation:

```typescript
if (isPromise(funcResult)) {
  throw new Error("Promises (async function calls) are not allowed in binding expressions.");
}
```

This means any function that returns a Promise (e.g., `fetch()`, any async operation) cannot be called in attribute bindings.

### 7. `var` Declarations — Reactive, Main-Thread Only

`var` in XMLUI has completely different semantics from JavaScript:

- **Reactive**: `var x = expr` creates a reactive variable that re-evaluates when dependencies change
- **Main thread only**: throws `"'var' declarations are not allowed within functions"` if used inside a function body
- **Mandatory initialization**: `var x;` is not allowed — an initializer expression is required
- **`$` prefix banned**: `var $x = 1` throws error W031
- **Destructuring expanded**: `var {a, b: c} = obj` is expanded by the parser into `var __destr_N = obj; var a = __destr_N.a; var c = __destr_N.b`

`let` and `const` work as block-scoped declarations (like JavaScript) and are NOT reactive.

### 8. Execution Timeout

| Track | Timeout               | Configurable?                                          |
| ----- | --------------------- | ------------------------------------------------------ |
| Sync  | 1000ms default        | Yes — `appGlobals.syncExecutionTimeout` (milliseconds) |
| Async | `evalContext.timeout` | Yes                                                    |

The sync timeout can be configured via [`appGlobals.syncExecutionTimeout`](/docs/app-globals#syncExecutionTimeout) in the app configuration. If not set, defaults to 1000ms.

Error: `"Sync evaluation timeout exceeded {N} milliseconds"`

### 9. Statement Execution Model — Queue-Based

Unlike JavaScript's call-stack model, XMLUI uses a **statement queue** with labels:

- Statements are enqueued as `StatementQueueItem` objects with unique labels
- Loop iterations re-queue the loop body using guard flags
- `break`/`continue` use `clearToLabel()` to unwind the queue
- `try`/`catch`/`finally` is a 5-phase state machine with `exitType` tracking
- Function calls create child threads (not stack frames)

### 10. Import System — Named Imports Only

| Syntax                               | Supported                       |
| ------------------------------------ | ------------------------------- |
| `import { a, b as c } from "module"` | **Yes**                         |
| `import foo from "module"`           | **No** — no default imports     |
| `import * as m from "module"`        | **No** — no namespace imports   |
| `import "module"`                    | **No** — no side-effect imports |
| `export function ...`                | **No** — no exports             |

Imported modules can **only contain**:

- Function declarations
- Import statements (transitive)

No variable declarations, no expression statements, no control flow at module level. Validated by `ModuleValidator`.

Imports must appear at top of file (error W040).

Circular imports detected by `CircularDependencyDetector` (error W041).

### 11. Unsupported JavaScript Features

| Feature                                             | Status                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `class`, `extends`, `super`                         | Not in lexer/parser                                          |
| `function*`, `yield`, `yield*` (generators)         | Not in lexer/parser                                          |
| `void` operator                                     | Not in lexer/parser                                          |
| `with` statement                                    | Not in lexer/parser                                          |
| `debugger` statement                                | Not in lexer/parser                                          |
| Labeled statements (`label:`)                       | Not in parser (only `case:` labels)                          |
| Getter/setter in object literals                    | Not in parser                                                |
| `dynamic import()`                                  | Not in parser                                                |
| `for await...of`                                    | Not in parser                                                |
| Destructuring in function parameters                | Partial — only in arrow function args via expansion          |
| `export`                                            | Not in parser                                                |
| Private fields (`#field`)                           | Not in lexer/parser                                          |
| Nullish coalescing assignment on nested expressions | Supported at operator level but untested on complex patterns |

### 12. Supported But Uncommon Features

| Feature                                | Notes                                               |
| -------------------------------------- | --------------------------------------------------- | ------------------------------ | --------- |
| Regex literals `/pattern/flags`        | Parsed via `@eslint-community/regexpp`              |
| Template literals `` `text ${expr}` `` | Fully supported                                     |
| BigInt literals                        | Auto-detected for values outside safe integer range |
| `for...in`                             | Uses `Object.keys()` enumeration                    |
| `for...of`                             | Requires `Symbol.iterator`                          |
| `typeof`                               | Standard semantics                                  |
| `delete`                               | Works on object properties via scope tracking       |
| `in` operator                          | Standard semantics (`prop in obj`)                  |
| `instanceof` operator                  | Standard semantics (`obj instanceof Constructor`)   |
| Computed property names                | `{ [expr]: value }` — expression evaluated as key   |
| Optional catch binding                 | `try { } catch { }` — catch variable is optional    |
| Bitwise operators                      | All supported: `&`, `                               | `, `^`, `~`, `<<`, `>>`, `>>>` |
| All compound assignments               | Including `&&=`, `                                  |                                | =`, `??=` |
| Exponentiation `**`                    | Supported                                           |
| Null coalescing `??`                   | Supported                                           |

## Identifier Resolution Order

When evaluating an identifier:

1. **Block scopes** — innermost to outermost in current thread
2. **Closure scopes** — captured scopes from enclosing arrow functions
3. **Parent thread** — repeat steps 1-2 in parent thread
4. **localContext** — the container's reactive state object
5. **appContext** — global functions, Actions namespace, utilities
6. **globalThis** — browser/Node.js globals

Source: `getIdentifierScope()` in `eval-tree-common.ts`

## Binding Expression Parsing (AttributeValueParser)

Attribute values are split into literal and expression segments:

```
"Hello {name}, you have {count} items"
→ [
    { literal: "Hello " },
    { expr: <AST for "name"> },
    { literal: ", you have " },
    { expr: <AST for "count"> },
    { literal: " items" }
  ]
```

- `\{` escapes to a literal `{`
- Each `ParsedPropertyValue` gets a unique `parseId` for caching
- Pure expressions (single `{expr}` with no surrounding text) return the raw value; mixed segments are string-concatenated

## Dependency Collection

`collectVariableDependencies(program)` in `visitors.ts`:

- Walks the AST recursively
- Tracks block-scoped variables (excluded from dependencies)
- Returns list of non-local variable names the expression depends on
- Member access chains (`obj.prop.nested`) tracked as `"obj.prop.nested"` strings
- Computed access with literal keys tracked as `"obj['key']"` strings
- Arrow function parameters are block-scoped (excluded)
- Used by the container to know which state changes trigger re-evaluation

## Code-Behind Scripts

`.xmlui.xs` files beside `.xmlui` files:

- Collected by `collectCodeBehindFromSource()` / `collectCodeBehindFromSourceWithImports()`
- Only `var` declarations and `function` declarations allowed at top level
- `var` → reactive variables; `function` → arrow expressions compiled into container scope
- Imported functions from other `.xs` files are converted to arrow expressions
- Functions and vars merged into the container's `localContext` at runtime

Special files:

- `Globals.xs` — declarations become global (visible everywhere)
- `Main.xmlui.xs` — local to Main component
- `ComponentName.xmlui.xs` — local to that component

## Expression Simplification

`simplify-expression.ts` performs constant folding before evaluation:

- Arithmetic: `2 + 3` → `5`
- Identity: `0 + x` → `x`, `x * 1` → `x`
- Dead code removal on constant conditions
- Applied iteratively until no more changes

## Key Files

| File                                                            | Purpose                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `components-core/script-runner/AttributeValueParser.ts`         | Splits attribute strings into literal + expression segments                              |
| `components-core/script-runner/eval-tree-sync.ts`               | Sync expression evaluator (binding expressions)                                          |
| `components-core/script-runner/eval-tree-async.ts`              | Async expression evaluator (event handlers)                                              |
| `components-core/script-runner/eval-tree-common.ts`             | Shared logic: identifier resolution, member access, unary/binary ops, `new` restrictions |
| `components-core/script-runner/process-statement-sync.ts`       | Sync statement processor (queue-based)                                                   |
| `components-core/script-runner/process-statement-async.ts`      | Async statement processor                                                                |
| `components-core/script-runner/process-statement-common.ts`     | Shared statement logic                                                                   |
| `components-core/script-runner/bannedFunctions.ts`              | 18+ banned globalThis functions + `BannedApiError`                                       |
| `components-core/script-runner/bannedMembers.ts`                | Property-access guard `isBannedMember` (~99 denylist entries)                            |
| `components-core/script-runner/asyncProxy.ts`                   | 8 array method async proxies                                                             |
| `components-core/script-runner/visitors.ts`                     | Dependency collection for reactivity                                                     |
| `components-core/script-runner/simplify-expression.ts`          | Constant folding / expression optimization                                               |
| `components-core/script-runner/statement-queue.ts`              | Queue-based control flow infrastructure                                                  |
| `components-core/script-runner/BindingTreeEvaluationContext.ts` | Evaluation context type + factory                                                        |
| `components-core/script-runner/ScriptingSourceTree.ts`          | AST node type definitions                                                                |
| `parsers/scripting/Parser.ts`                                   | Source → AST parser (~3500 lines)                                                        |
| `parsers/scripting/Lexer.ts`                                    | Source → token stream                                                                    |
| `parsers/scripting/TokenType.ts`                                | Token type enum (all operators, keywords)                                                |
| `parsers/scripting/ModuleValidator.ts`                          | Imported module restriction enforcement                                                  |
| `parsers/scripting/ModuleLoader.ts`                             | Module loading with caching                                                              |
| `parsers/scripting/code-behind-collect.ts`                      | Code-behind script collection                                                            |

## Anti-Patterns

| Anti-pattern                                                  | Problem                                                        | Fix                                                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Calling `fetch()` in attribute binding `value="{fetch(url)}"` | Returns Promise → sync evaluator throws                        | Use `DataSource` component or event handler                                            |
| Using `setTimeout()` in event handlers                        | Banned function → runtime error                                | Use the `delay()` global function                                                      |
| `new Array(5)` or `new Map()`                                 | Unsupported constructor → runtime error                        | Use `[...Array(5)]` or plain objects                                                   |
| `async function handler() {}` in code-behind                  | Parsed but throws at runtime                                   | Use regular functions; the async track handles promises from called APIs automatically |
| `var x = 0` inside a function body                            | Throws `"'var' declarations are not allowed within functions"` | Use `let` or `const` inside functions                                                  |
| Declaring `var $count = 0`                                    | `$` prefix banned in declarations                              | Use `var count = 0` (no `$` prefix)                                                    |
| Expecting `null.foo` to throw                                 | Default optional chaining returns `undefined`                  | Use `::` to access raw globalThis if strict null checks needed                         |
| `import foo from "module"`                                    | Default imports not supported                                  | Use `import { foo } from "module"`                                                     |
