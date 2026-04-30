# XMLUI as "Managed React": A Broader Safety, Security, and Quality Assessment

> This document extends the original *[XMLUI as "Managed React": Security and Safety Assessment](https://gist.github.com/judell/95b66c29506e545b5c972e541f989a24)*
> by Jon Udell. It keeps the original analogy and the original security findings,
> then enlarges the scope to the kinds of guarantees that managed languages
> (Java, C#) and managed frameworks (.NET, the JVM ecosystem, ASP.NET Core,
> JavaFX/JSF) provide beyond memory safety and code injection — accessibility,
> type contracts, resource lifecycle, exception safety, concurrency, i18n,
> versioning, build-time validation, sandboxing, observability, and
> determinism.

---

## 1. The Analogy, Restated and Widened

Managed languages did not just eliminate `malloc`/`free`. They delivered a
*bundle* of structural guarantees that made whole classes of bugs disappear or
become observable:

- **Memory safety** — no use-after-free, no buffer overruns.
- **Type safety** — verified contracts at compile or load time (CLR verifier,
  JVM bytecode verifier).
- **Exception safety** — exceptions propagate predictably; `finally`/`using`/
  `try-with-resources` guarantee cleanup.
- **Resource lifecycle** — `IDisposable`, `AutoCloseable`, finalizers, GC.
- **Concurrency primitives** — `async`/`await`, `Task`, structured cancellation
  via `CancellationToken`.
- **Reflection + metadata** — components are introspectable and tool-friendly.
- **Sandboxing** — the original Java applet / .NET CAS model, and today the
  WASM / browser model.
- **Observability** — ETW, EventSource, JFR, structured logging.
- **Localization** — `ResourceManager`, `ResourceBundle`, `CultureInfo`.
- **Accessibility** — UI Automation, JavaFX a11y APIs, WPF AutomationPeer.
- **Determinism** — verified IL, ordered initialization, stable hashing.

XMLUI proposes the same bundle for the React component ecosystem. The first
report graded XMLUI on *security*. This report grades it on the *full bundle*,
because that is what a "managed framework" actually has to deliver.

---

## 2. Findings From the Original Report (Carried Forward)

These remain accurate where unchanged; rows updated by the
[DOM API hardening work](plans/dom-api-hardening.md) are flagged with
*(updated 2026-04)*.

| Property | Verdict | Evidence |
|---|---|---|
| No code injection via `eval()` | **Strong** *(updated 2026-04)* | Custom AST interpreter; `eval`, `Function`, timers, **and `WebAssembly.compile`/`instantiate` plus the `WebAssembly.Module` and `WebAssembly.Instance` constructors** banned in [bannedFunctions.ts](../src/components-core/script-runner/bannedFunctions.ts). The `debugger` statement is rejected at parse time (W046). |
| No timer-based attacks | **Strong** | `setTimeout`, `setInterval`, `setImmediate`, `requestAnimationFrame`, `requestIdleCallback`, `queueMicrotask` all banned |
| No XSS in default text rendering | **Strong** *(updated 2026-04)* | All values flow through React JSX escaping; `valueExtractor.asDisplayText()` does not interpolate HTML. **In addition, `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`createElement` and the full DOM-mutation surface are now blocked at the property-access guard in [bannedMembers.ts](../src/components-core/script-runner/bannedMembers.ts), so an expression cannot bypass React's escaping path.** |
| Centralized HTTP with CSRF | **Strong** *(updated 2026-04 — was Moderate)* | `RestApiProxy` adds XSRF + transaction headers. **Raw `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, and `navigator.sendBeacon` are now banned (Step 1.8); the sanctioned `App.fetch()` global delegates to `RestApiProxy`, honours `appGlobals.allowedOrigins`, and emits an `app:fetch` trace entry (Step 3.2). `<WebSocket>` and `<EventSource>` components provide managed lifecycle for streaming connections (Step 3.3).** |
| Fetch lifecycle management | **Strong** | React Query + `AbortController` cancels stale requests on key change / unmount |
| Observable by construction | **Strong** *(updated 2026-04)* | Inspector / `pushXsLog` capture every state change, navigation, and API call. **New trace kinds: `sandbox:warn`, `log:debug`/`info`/`warn`/`error`, `app:randomBytes`, `app:mark`/`measure`, `app:fetch`, `clipboard:copy`, `navigate`, `ws:connect`/`message`/`error`/`close`, `eventsource:*` — every Phase 1 ban produces an audit entry in warn mode, and every Phase 2/3 managed primitive emits its own kind.** |
| DOM API access | **Strong** *(updated 2026-04 — was Weak)* | A property-access guard (`isBannedMember`) in [eval-tree-common.ts](../src/components-core/script-runner/eval-tree-common.ts) is invoked on every identifier read, member read, member write, and computed-member access. The denylists in [bannedMembers.ts](../src/components-core/script-runner/bannedMembers.ts) cover **47 globals**, **21 `document` keys**, **13 `navigator` keys**, and **18 element-setter / mutation keys** — spanning DOM mutation, observers, concurrency primitives, storage, sensors, navigation, network constructors, crypto, performance, and `console`. Default mode (`strictDomSandbox: false`) emits `sandbox:warn` traces; opt-in `true` throws `BannedApiError`. Sanctioned replacements `Log.*`, `App.randomBytes`, `App.now`/`mark`/`measure`, `App.fetch`, `App.environment`, `Clipboard.copy`, `navigate({target:"_blank"})`, `<WebSocket>`/`<EventSource>` are wired into the global expression scope. |
| Network origin restrictions | **Available** *(updated 2026-04 — was Absent)* | `App.appGlobals.allowedOrigins: string[]` honoured by `App.fetch()`; cross-origin requests are rejected before reaching the network. Same-origin requests are always permitted. Streaming components honour the same allowlist. |
| Reactive cycle detection | **Absent** | No static cycle analysis on var ↔ DataSource graph |
| XSS protection in Markdown | **Absent** | `rehype-raw` passes raw HTML through; no DOMPurify |

The DOM API access row is the headline change: the verdict moved from **Weak**
to **Strong** through the full execution of the
[DOM API hardening plan](plans/dom-api-hardening.md). **As of 2026-04, every
step of Phases 1, 2, and 3 has shipped — Steps 0, 1.1–1.9, 2.1–2.6, 3.2,
3.3, and 3.4 are all implemented, tested, and wired into the global expression
scope.** The two original "unfinished business" items have closed: Step 2.1
adds `appStateKeys` schema validation to `AppState` (any undeclared bucket
throws `AppStateSchemaError`), and Step 2.3 hardens `navigate()` so
`target: "_blank"` is the only sanctioned way to open an external tab and
uses `window.open(href, "_blank", "noopener,noreferrer")` internally with a
`kind: "navigate"` trace entry.

---

## 3. New Dimension: Accessibility

A genuine managed UI framework treats accessibility the way the CLR treats
type safety: structurally, not aspirationally.

**What XMLUI provides today.** Components are built on semantic HTML primitives
([Button](../src/components/Button/), [Modal](../src/components/Modal/),
[Select](../src/components/Select/)) and follow the conventions documented in
`.ai/xmlui/accessibility.md`: aria-labels for icon-only triggers,
`aria-expanded` on disclosure widgets, focus traps in modals, Escape-to-dismiss,
arrow-key navigation in option lists. Every form input is paired with a `Label`
component that wires `htmlFor`/`id` automatically.

**What is missing for a "managed" claim.**

- **No build-time a11y verification.** Nothing prevents shipping an icon
  `Button` without `label` or `aria-label`. WPF's AutomationPeer and JavaFX's
  Accessible API enforce a name on every actionable node; XMLUI does not.
- **No automated contrast / hit-target validation.** Theme resolution is
  unconstrained — a custom theme can produce 1.2:1 text on background. .NET's
  high-contrast theming layer surfaces violations; XMLUI does not.
- **No automation tree.** A managed framework exposes a separate accessibility
  tree (UIA in Windows, AT-SPI on Linux). XMLUI inherits whatever accessibility
  surface the underlying React+DOM produces; there is no XMLUI-level automation
  ID mechanism beyond passing `testId`.
- **Keyboard policy is component-local.** Each component implements its own
  keymap. There is no central focus manager, no skip-link primitive, no
  documented modal-stack discipline.

**Verdict.** Accessibility is *documented and conventional*, not *enforced by
construction*. To match the original "managed" pitch, XMLUI would need a
parse-time linter ("interactive component without an accessible name"),
a theme-time contrast checker, and a small set of framework primitives
(`SkipLink`, `FocusScope`, `LiveRegion`) that components are required to
participate in.

---

## 4. New Dimension: Type Safety and Metadata Contracts

The CLR and JVM have *verified* type systems: invalid bytecode does not load.
ASP.NET Core model binding rejects malformed inputs at the request boundary
before user code runs.

**What XMLUI provides.** Every component declares metadata
([component-architecture.md](../../.ai/xmlui/component-architecture.md)):
prop names, `valueType` (`string`, `number`, `boolean`, `any`, `ComponentDef`),
optional `availableValues` enums, events, exposed methods, theme variables.
The [`ValueExtractor`](../src/components-core/rendering/ValueExtractor.ts)
performs deterministic coercion (`asString`, `asNumber`, `asOptionalBoolean`,
…). The TypeScript build catches mistakes inside the framework code.

**What is missing.**

- **No runtime contract enforcement.** A prop declared `valueType: "number"`
  receives a string at runtime without complaint; coercion is silent and
  permissive. Compare this to .NET model binding, which produces a
  `ModelStateError` instead of silently coercing `"abc"` to `0`.
- **No build-time prop checking.** The metadata is rich enough to verify a
  `.xmlui` document statically. The language server consumes it for
  completions but does not currently emit diagnostics for "unknown prop",
  "wrong value type", or "missing required prop".
- **TypeScript types do not flow into metadata.** The two systems are
  parallel, so a TS-side prop change can drift from the metadata until
  someone notices.

**Verdict.** XMLUI has the *raw material* of a verified component system —
machine-readable metadata and a single coercion chokepoint — but does not yet
spend it. Closing this gap would be the largest single safety improvement
after cycle detection.

---

## 5. New Dimension: Resource Lifecycle and Cleanup

`IDisposable`/`using` and `AutoCloseable`/`try-with-resources` give managed
languages structural cleanup. React provides the same shape via `useEffect`
return callbacks.

**What XMLUI provides.** Component teardown is automatic for everything that
goes through the framework:

- HTTP requests via [`RestApiProxy`](../src/components-core/RestApiProxy.ts)
  carry an `AbortController` and are cancelled on unmount or key change.
- The container's
  [`event-handler-cache`](../src/components-core/container/event-handler-cache.ts)
  evicts stale handlers when a UID unmounts.
- React Query manages query lifecycle for `DataSource`.
- `LoaderComponent` runs `onUnmount` callbacks for registered loaders.

**What is uneven.**

- **No user-level lifecycle hook.** User expressions cannot create timers
  (they are banned), so they also cannot register cleanup. This is safe but
  asymmetric: any long-lived side effect a user component needs must be
  expressed through a framework-provided component (e.g.
  [`WebSocket`](../src/components/WebSocket/WebSocketReact.tsx),
  [`EventSource`](../src/components/EventSource/EventSourceReact.tsx),
  `Timer`, `DataSource`) rather than written inline. The DOM-API hardening
  pass closed this gap for the most common long-lived resources by adding
  declarative wrappers whose `useEffect` teardown closes the underlying
  socket or stream on unmount; anything *outside* that vocabulary still
  forces a drop into a custom React component.
- **No finalizer-equivalent for state containers.** Containers are torn down
  by React unmount; there is no opportunity to "flush" pending writes to a
  store before disposal.

**Verdict.** Cleanup is strong for everything XMLUI itself owns, and the
managed vocabulary now covers WebSockets and Server-Sent Events alongside
HTTP, timers, and queries. The remaining gap is the absence of a generic,
sandbox-safe lifecycle primitive for user code — any side effect that does
not have a dedicated component still forces a drop into raw React.

---

## 6. New Dimension: Exception Safety and Error Propagation

.NET and the JVM define exception propagation precisely: stack unwinding,
`finally` ordering, `AggregateException`, `Throwable.getCause()`. ASP.NET
Core has middleware-level error handling and problem-details responses.

**What XMLUI provides.** A layered model:

- Every component is wrapped in
  [`ErrorBoundary`](../src/components-core/rendering/ErrorBoundary.tsx),
  which catches render-time exceptions and resets on navigation.
- Event-handler errors are caught in
  [`event-handlers.ts`](../src/components-core/container/event-handlers.ts),
  routed through `signError()` and surfaced as toasts.
- Loader errors dispatch a `LOADER_ERROR` action that becomes `$error` on the
  container, allowing markup to react declaratively.
- Parse and markup errors yield a full-page diagnostic with line/column
  information.

**What is missing.**

- **No structured error type.** Errors are `Error` instances or strings. There
  is no equivalent of `ProblemDetails` carrying code, category, retryability,
  or correlation ID.
- **No framework-level retry, fallback, or circuit-breaker.** A failed
  `DataSource` shows an `$error` and stops; the user must wire retry by hand.
  Polly-style policies (.NET) or Spring Retry (JVM) are not present.
- **Async errors in event handlers are swallowed by the toast pipeline** by
  default. There is no global `unhandledHandlerError` event for
  app-level telemetry hooks.
- **Error boundaries do not propagate metadata.** Only message + stack reach
  the trace; a thrown object's custom fields are dropped.

**Verdict.** Exception *containment* is strong (one bad component does not
crash the app). Exception *vocabulary* is thin compared to a managed
framework's standard error model.

---

## 7. New Dimension: Concurrency and Cancellation

`async`/`await` + `CancellationToken` is the .NET concurrency contract. The
JVM has `CompletableFuture` + structured concurrency in Java 21+. Both make
*cancellation observable* at every async boundary.

**What XMLUI provides.** Event handlers run through
`processStatementQueueAsync()`, which evaluates statements one at a time,
checkpointing state and yielding to the main thread every 100 statements.
Async array methods in
[`asyncProxy.ts`](../src/components-core/script-runner/asyncProxy.ts) use
`Promise.all` for parallel predicates and sequential `await` for `map`/
`forEach`. Sync expressions throw if they encounter a Promise — a real
guarantee that prevents accidental fire-and-forget in synchronous contexts.

**What is missing.**

- **No structured cancellation in user code.** `AbortController` exists
  internally for fetches but is not exposed to handlers. There is no
  `$cancellation` token an action can cooperatively check.
- **No deduplication of rapid event fires.** Click a button five times in
  300 ms and the handler runs five times in parallel. The framework offers
  no `singleFlight` or "in-flight guard" primitive.
- **No happens-before contract between handlers.** Two simultaneous handlers
  can interleave their state writes; the last write wins. .NET and Java
  document memory models; XMLUI does not.
- **No timeout policy.** A handler that awaits a hung promise pins the
  handler queue indefinitely.

**Verdict.** The async runtime is correct and predictable in isolation, but
it lacks the *cooperative cancellation* and *coordination* primitives that
make managed concurrency tractable in production.

---

## 8. New Dimension: Styling and Theming Sandbox

CSS-in-JS and CSS Modules are the modern equivalent of the .NET resource
system: scoped, named, and overridable through known channels.

**What XMLUI provides.** Every component imports a `.module.scss` file; class
names are mangled (`Button_component__a1b2c`). Theme values are CSS custom
properties (`--xmlui-*`) injected by
[`StyleProvider`](../src/components-core/theming/StyleContext.tsx). Themes
merge left-to-right with `$reference` resolution.

**What leaks.**

- **Inline `style` props are not scoped.** Layout props such as
  `paddingHorizontal` translate to inline styles; a sufficiently determined
  user can pass arbitrary CSS strings through these channels.
- **Theme values are not validated.** A theme variable typed semantically as a
  color can hold any string. There is no `Color`/`Length`/`Number` theme
  variable type system.
- **Themes can only override known variables.** This is safe but inflexible;
  there is no namespaced extension mechanism for third-party components.

**Verdict.** Styling is sandboxed by default but porous at the inline-style
boundary. Adding typed theme variables would close most of the gap.

---

## 9. New Dimension: Form Infrastructure as a Safety Surface

Forms are where most XSS, CSRF, and validation bugs originate in real
applications. .NET has model binding + DataAnnotations; Spring has JSR-380.

**What XMLUI provides.** A late-error validation model owned by
[`FormReact`](../src/components/Form/FormReact.tsx). Per-field interaction
flags (`isDirty`, `invalidToValid`, `afterFirstDirtyBlur`) are documented in
[form-infrastructure.md](../../.ai/xmlui/form-infrastructure.md). Form state
survives FormItem unmount and merges back without clobbering on remount.

**What is missing.**

- **No built-in validators.** Email, URL, length, range, pattern — all
  user-written. DataAnnotations gives `[EmailAddress]`, `[Range]`,
  `[StringLength]`; XMLUI has none of these as primitives.
- **No server-validation contract.** Map a 422 response to per-field errors
  by hand.
- **No automatic submission guard.** Spamming submit fires the handler N
  times.
- **No CSRF binding to forms.** XSRF tokens exist on `RestApiProxy`-routed
  requests, but Form/APICall integration does not surface this as a form
  property.

**Verdict.** Form *state* management is excellent. Form *validation* and
*submission discipline* lag a managed-framework baseline.

---

## 10. New Dimension: Routing and Input Validation at the URL Boundary

ASP.NET Core route constraints (`{id:int:min(1)}`) reject bad URLs before any
controller code runs. This is structural input validation.

**What XMLUI provides.** A React Router v6 wrapper with `willNavigate` /
`didNavigate` hooks and reactive `$routeParams`. Hash and Browser modes
selectable.

**What is missing.**

- **No type or constraint syntax on route segments.** `:id` is a string until
  the developer parses it.
- **`willNavigate` is bypassable.** Browser back/forward and direct URL
  entry skip the guard.
- **No URL canonicalization.** Trailing slashes, case, and query parameter
  ordering are user concerns.

**Verdict.** Routing is convenient but not defensive. A managed framework
would treat the URL as an untrusted boundary and demand a contract.

---

## 11. New Dimension: Internationalization and Localization

`CultureInfo`, `ResourceManager`, `IStringLocalizer` are the .NET baseline.
JavaFX/Swing have `ResourceBundle`. ICU MessageFormat handles plurals and
gender across the JVM and CLR.

**What XMLUI provides.** Locale-aware date and time formatting via
`Intl.DateTimeFormat` (`isLocale()`,
[`formatDatetimeToUserFriendly()`](../src/components-core/utils/misc.ts)).
TimeInput honours locale-specific separators.

**What is missing.**

- **No string externalization.** All component-emitted UI strings (validation
  messages, default placeholders, button labels in built-ins) are English
  literals.
- **No pluralization or gender support.**
- **No locale-aware sorting or collation helpers in expressions.**
- **No RTL support contract.** Components rely on CSS logical properties
  *if the author remembered*; there is no framework guarantee.
- **No currency formatting beyond decimal-place control.**

**Verdict.** XMLUI is effectively monolingual. Anything beyond date display
requires the developer to roll their own i18n layer. This is a substantial
gap for any framework that wants to be considered "managed" in the .NET / JVM
sense.

---

## 12. New Dimension: Versioning and Backward Compatibility

The CLR has assembly versioning, strong names, and binding redirects. Java
has module descriptors and JDK API stability promises. A managed framework
is expected to make breakage *visible*.

**What XMLUI provides.** Semantic versioning across the monorepo with
Changesets (`patch` by default per repository convention). Component metadata
supports `status: "deprecated"` and `deprecationMessage`. The CHANGELOG
records breaking changes.

**What is missing.**

- **Deprecation is metadata-only.** The language server does not warn on use
  of a deprecated component or prop.
- **No prop-level deprecation channel.** A prop disappears with the
  changelog as the only signal.
- **No API surface diff at build time.** Nothing equivalent to .NET's
  `Microsoft.DotNet.ApiCompat` or Java's `japicmp`.
- **`patch` for everything** — a convention that minimises noise but also
  obscures real semantic changes.

**Verdict.** The mechanism exists; the enforcement does not. A managed
framework would surface deprecation diagnostics in the editor and at parse
time.

---

## 13. New Dimension: Build-Time Validation and Tooling

`csc`/`javac` reject malformed programs before they run. Roslyn analyzers,
SpotBugs, ErrorProne, and ESLint extend this to project-specific rules.

**What XMLUI provides.** A language server
([language-server.md](../../.ai/xmlui/language-server.md)) with completions,
hover, definitions, folding, and formatting. Parse errors in `.xmlui`
markup or expressions are surfaced as LSP diagnostics with line/column.

**What is missing.**

- No type checking against component metadata at parse time.
- No "unknown component" diagnostic.
- No "unknown event" / "unknown method" diagnostic on `Component.event`
  bindings.
- No detection of obviously dead expressions or unused vars.
- No detection of the reactive cycles called out in the original report —
  the AST has the information; the analyzer does not run.

**Verdict.** The tooling spine (LSP, metadata, parser) is in place. The
analyzers are not.

---

## 14. New Dimension: Sandboxing of User-Defined Components

The applet-era CAS model is gone, but managed frameworks still draw trust
boundaries — `AssemblyLoadContext`, `ClassLoader` isolation, OSGi modules,
WASM sandbox, browser origin model.

**What XMLUI provides.** User-Defined Components (UDCs) are compound
components that compose existing components. They participate in the same
state container model as their host.

**What is missing.**

- **No isolation boundary.** A UDC sees the parent's full state, vars,
  globals, and exposed APIs through normal scoping.
- **No capability declaration.** A UDC cannot declare "I only need props
  X and Y" and have the framework enforce that.
- **No untrusted-component story.** If a UDC author is not the application
  author (third-party component pack), there is no manifest, no permission
  prompt, no scope restriction.

**Verdict.** UDCs are an extensibility mechanism, not a trust boundary.
Treating them as managed components in the .NET sense would require an
explicit prop/event contract surface enforced at instantiation.

---

## 15. New Dimension: Logging, Tracing, and Audit

ETW, EventSource, JFR, OpenTelemetry — managed platforms ship with
high-throughput, low-overhead, structured tracing.

**What XMLUI provides.** The Inspector / `pushXsLog` pipeline (covered in
the original report) is genuinely first-class. Every interaction, navigation,
API call, handler start/complete/error, and state diff lands in a circular
buffer. The Inspector overlay renders this for live debugging.

**What is missing for production audit use.**

- **Browser-only.** No server sink; no OTLP exporter; no integration with a
  centralised logging system.
- **No PII redaction.** Form values, API payloads, and headers are logged
  verbatim. A managed framework would treat at least password fields and
  Authorization headers as redactable by construction.
- **No sampling, no retention policy, no search index.** The buffer is
  in-memory and fixed size.
- **No correlation IDs across navigations or across DataSources.** Every
  entry is independent.

**Verdict.** The trace *substrate* is the strongest "managed" feature XMLUI
has. Turning it into an audit-grade system is largely a packaging exercise.

---

## 16. New Dimension: Determinism and Reproducibility

The CLR guarantees ordered class initialization and deterministic builds
(`/deterministic`). Java guarantees `final` field initialization happens-
before any read.

**What XMLUI provides.** Memoised value extraction with explicit dependency
tracking; stable JSON-keyed CSS class hashing; metadata-driven prop ordering.

**What is non-deterministic.**

- Async handler interleaving (no documented order between concurrent
  handlers).
- Floating-point in spacing tokens (`space-1_5` etc.) varies marginally
  across renderers.
- Object iteration order across engines is JS-spec-defined for string keys
  but not for symbol keys; XMLUI uses string keys throughout, so this is
  mostly safe in practice.

**Verdict.** Deterministic enough for visual reproducibility; not formally
guaranteed for concurrent state mutation.

---

## 17. Consolidated Scorecard

Combining the original report with the new dimensions:

| Dimension | Today | Path to "Managed" |
|---|---|---|
| Code injection (`eval`) | **Strong** | Keep banned list maintained; **`Function`, `WebAssembly.*`, and `debugger` now covered (2026-04)** |
| XSS (default rendering) | **Strong** | Sanitize Markdown; **DOM-mutation surface now banned at the property-access guard (2026-04)** |
| HTTP centralisation | **Strong** *(was Moderate)* | `App.fetch` Gate + `allowedOrigins` allowlist shipped 2026-04; raw `fetch`, `XHR`, `WebSocket`, `EventSource`, `sendBeacon` all banned. |
| Fetch lifecycle | **Strong** | — |
| Reactive cycle detection | **Absent** | Build a static AST analyzer |
| Observability | **Strong** | Add server sink + redaction; **trace kind union extended with sandbox/log/app/clipboard/navigate/ws/eventsource kinds (2026-04)** |
| DOM API isolation | **Strong** *(was Weak)* | Property-access guard + 99-entry denylist + sanctioned replacement globals + `App.fetch` Gate + `<WebSocket>`/`<EventSource>` components + `App.environment` shipped 2026-04. **Phase 1, 2, and 3 of the hardening plan are all complete.** |
| **Accessibility** | **Documented only** | Parse-time linter; framework focus / live-region primitives; theme contrast checker |
| **Type contracts** | **Metadata, not verified** | Parse-time prop validation against metadata |
| **Resource lifecycle** | **Strong for framework, asymmetric for user code** | Sandbox-safe lifecycle vocabulary for UDCs |
| **Exception model** | **Contained, not structured** | Structured error type; retry/fallback policies |
| **Concurrency / cancellation** | **Predictable, uncoordinated** | Cooperative cancellation token; in-flight guard primitive |
| **Theming sandbox** | **Mostly scoped** | Typed theme variables; restrict inline-style escape hatch |
| **Forms validation** | **State strong, validators absent** | Built-in validators, server-error mapping, submit guard |
| **Routing input** | **Convenient, undefended** | Route constraints, URL canonicalisation |
| **i18n** | **Dates only** | String externalisation, ICU plurals, RTL guarantees |
| **Versioning** | **Mechanism present, unenforced** | LSP deprecation diagnostics, prop-level deprecation |
| **Build-time validation** | **Parse only** | Metadata-driven type/identifier diagnostics |
| **UDC sandboxing** | **Absent** | Explicit prop/event contract for UDCs; capability scoping |
| **Audit logging** | **Browser only, unredacted** | OTLP exporter; PII redaction policy |
| **Determinism** | **Visual, not concurrent** | Document or constrain handler interleaving |

---

## 18. The Pitch, Refined Again

The original report's refined pitch stands, with three additions:

> XMLUI makes the React component ecosystem available as **managed components**:
>
> - Usable without writing React or CSS *(today)*
> - Observable and traceable by construction *(today)*
> - No code injection — custom interpreter with banned-function enforcement,
>   covering `eval`, `Function`, timers, `WebAssembly`, and `debugger` *(today, as of 2026-04)*
> - No XSS in standard rendering paths *(today, with Markdown caveat)*
> - **Sandboxed DOM surface — a 99-entry property-access denylist blocks
>   `window`/`document`/`navigator`/`localStorage`/`crypto`/`console` and the
>   DOM-mutation methods at every read, write, and call site, with sanctioned
>   replacements (`Log.*`, `App.randomBytes`, `App.now`/`mark`/`measure`,
>   `App.fetch` + `allowedOrigins`, `App.environment`, `Clipboard.copy`,
>   `navigate({target:"_blank"})` with forced `noopener,noreferrer`,
>   `<WebSocket>`/`<EventSource>` components, and `AppState` with
>   `appStateKeys` schema validation) for the legitimate use cases** *(today, as of 2026-04 — all of Phases 1, 2, and 3 of the hardening plan)*
> - Controlled network surface — raw `fetch`/`XHR`/`WebSocket` banned;
>   `App.fetch` enforces CSRF + origin allowlist *(today, as of 2026-04)*
> - **Verified component contracts — props and events checked against metadata at parse time** *(achievable; metadata exists)*
> - **Accessible by construction — interactive components without an accessible name fail to compile** *(achievable; small primitive set + linter)*
> - **Cooperative cancellation and structured errors in user code** *(achievable; runtime work)*
> - No infinite render loops — static cycle detection *(achievable, not yet implemented)*

The original report identified three gaps to close (`fetch`, cycles, Markdown
sanitization) for the security pitch. **Two of those three have shipped:
`fetch` is now gated through `App.fetch` with origin allowlist (2026-04);
Markdown sanitization remains the only original-report security gap still
open.** The broader managed pitch adds three more high-leverage gaps:
**metadata-driven parse-time prop validation**, **accessibility linting**, and
**structured cancellation tokens for user handlers**. None require new
architecture — each plugs into a substrate that already exists (metadata,
LSP, async statement queue).

---

## 19. Open Source vs. Commercial — Restated for the Wider Surface

The original report's split (safety in OSS, governance in commercial) extends
naturally:

**Open source — the safety contract**
- Banned functions, DOMPurify, parse-time prop validation, accessibility
  linter, structured error type, cooperative cancellation token, deprecation
  diagnostics in the LSP. These are table stakes for "managed".

**Commercial — the governance contract**
- Cycle detection at build time; origin allowlist enforcement; declarative
  RBAC; CWE/OWASP attestation; **WCAG attestation** (the a11y analogue);
  **i18n compliance reports** (locales covered, untranslated strings, RTL
  audit); audit-grade trace export with redaction policies; component-pack
  certification (the "wrapped components" line of business already
  identified).

The managed-framework analogy strengthens the commercial story: enterprises
do not pay for "no buffer overruns", but they do pay for *attestation* that
the codebase meets a contract — Section 508, WCAG 2.1 AA, GDPR-compatible
logging, FedRAMP-aligned audit. XMLUI's metadata + trace substrate is, again,
the natural hinge.

---

## 20. Closing

The original assessment graded XMLUI on the security half of the managed-
language bargain. That grade was, fairly, **strong with named gaps**.

**As of April 2026, the largest of those named gaps — DOM API isolation — is
closed end-to-end.** The script-runner sandbox now matches the rigor of the
existing timer ban: 99 denylist entries spanning DOM mutation, observers,
concurrency, storage, sensors, navigation, network constructors, and crypto
are checked at every member access; sanctioned replacements (`Log.*`,
`App.randomBytes`, `App.now`/`mark`/`measure`, `App.fetch` with origin
allowlist, `App.environment`, `Clipboard.copy`, `navigate({target:"_blank"})`
with forced `noopener,noreferrer`, `<WebSocket>`/`<EventSource>` components,
and `AppState` with `appStateKeys` schema validation) are wired into the global
expression scope; and every blocked or replaced access produces a structured
trace entry. **All of Phases 1, 2, and 3 of the
[DOM API hardening plan](plans/dom-api-hardening.md) are complete.** Of the
original report's three security gaps (`fetch`, cycles, Markdown), only the
Markdown sanitization gap remains.

Widening to the full bundle — accessibility, type contracts, lifecycle,
exception model, concurrency, theming sandbox, forms, routing, i18n,
versioning, build-time validation, UDC isolation, audit, determinism — the
verdict is consistent: XMLUI has the right *substrate* almost everywhere
(metadata, single coercion point, single HTTP chokepoint, async statement
queue, trace pipeline, CSS Modules, ErrorBoundary on every component) and
falls short almost everywhere on *enforcement*. It is a framework optimised
for safe behaviour by convention, not by construction — except now, on the
DOM-access dimension, where it is safe by construction.

The good news is that the substrate makes "by construction" reachable
without re-architecting. The same metadata that drives completions can drive
diagnostics. The same trace that drives the Inspector can drive an audit
exporter. The same `RestApiProxy` that adds CSRF tokens can enforce an
allowlist. The same async statement queue that already checkpoints state
can already plumb a cancellation token.

XMLUI is most of the way to "Managed React". What remains is to spend the
substrate.

---

## Appendix A. Hardening DOM API Access — A Concrete Ban List

> **✅ Status (2026-04, fully complete):** the entire hardening plan has shipped.
> See [`plans/dom-api-hardening.md`](plans/dom-api-hardening.md) for the
> executed step-by-step plan. **All of Phases 1, 2, and 3 are implemented and
> tested:**
>
> - **Phase 1 (Ban) — ✅ shipped:** Steps 0 + 1.1–1.9 — property-access guard
>   `isBannedMember` + `BannedApiError` + `sandboxWarnLogger` callback in
>   [bannedMembers.ts](../src/components-core/script-runner/bannedMembers.ts),
>   invoked from `evalIdentifier`, `evalMemberAccessCore`,
>   `evalCalculatedMemberAccessCore`, and `evalAssignmentCore` in
>   [eval-tree-common.ts](../src/components-core/script-runner/eval-tree-common.ts).
>   Covers Function/WebAssembly/debugger, DOM mutation, concurrency, storage,
>   sensors, navigation, network constructors, crypto/performance/console.
> - **Phase 2 (Replace) — ✅ shipped:** Steps 2.1–2.6 — `AppState` with
>   `appStateKeys` schema (`AppStateSchemaError` thrown on undeclared bucket
>   access); `Clipboard.copy`; `navigate({target:"_blank"})` with forced
>   `noopener,noreferrer` and `kind:"navigate"` trace; `App.randomBytes`;
>   `App.now`/`mark`/`measure`; `Log.*` with `silentConsole` switch.
> - **Phase 3 (Gate) — ✅ shipped:** Steps 3.2–3.4 — `App.fetch` with
>   `allowedOrigins` allowlist; `<WebSocket>` and `<EventSource>` components
>   with managed lifecycle; `App.environment` curated environment-probe
>   surface.
>
> The per-section recommendations in §A.3 (Networking, Storage, Navigation,
> DOM Mutation, Concurrency, Sensors, Crypto, DevTools/Console) are all
> realised; the property-access guard sketched in §A.4 is the
> [`isBannedMember`](../src/components-core/script-runner/bannedMembers.ts)
> implementation; the migration plan in §A.6 has reached **Phase 2 (opt-in
> enforcement)** \— `strictDomSandbox: false` (warn) is the default,
> `strictDomSandbox: true` flips to throw.
>
> The original problem statement and threat-model discussion below are
> retained for historical reference.

The original report grades **DOM API access** as **Weak**: although `eval` and
the timer family are blocked, expressions can still reach `window`, `document`,
`localStorage`, `fetch`, and the rest of the browser's global surface through
`globalThis`. To raise this verdict to **Strong** — on a par with "no
timer-based attacks" — XMLUI needs to extend the same denylist mechanism in
[`bannedFunctions.ts`](../src/components-core/script-runner/bannedFunctions.ts)
to cover the broader browser API surface, and to add a parallel
property-access guard inside the interpreter.

This appendix enumerates the surface that needs to be considered, grouped by
threat class. Each group includes a recommended action (Ban / Gate / Replace)
and a short rationale.

### A.1 Threat Model

Within a `.xmlui` expression, an attacker — or simply a careless author of a
third-party UDC — can today:

1. **Exfiltrate data** — read `localStorage`, `sessionStorage`, cookies, the
   URL, IndexedDB, and POST the results via `fetch` or `navigator.sendBeacon`.
2. **Bypass the centralised HTTP layer** — call `fetch`, `XMLHttpRequest`,
   `WebSocket`, or `EventSource` directly, escaping CSRF headers, the
   in-flight cancellation policy, and any future origin allowlist.
3. **Pin or crash the page** — schedule work via `MessageChannel`,
   `BroadcastChannel`, `SharedWorker`, or `Worker`; spin via `Atomics.wait`
   on a `SharedArrayBuffer`.
4. **Phish or hijack** — call `window.open`, mutate `window.location`,
   replace `document.title`, install `beforeunload`, register Service Workers
   that intercept future requests.
5. **Read the user's environment** — `navigator.geolocation`,
   `navigator.mediaDevices.getUserMedia`, `navigator.clipboard.readText`,
   `navigator.usb`, `navigator.bluetooth`, `navigator.credentials`.
6. **Mutate the DOM out from under React** — `document.body.innerHTML = …`,
   `document.write`, `Element.insertAdjacentHTML`. This bypasses XSS
   protection because the HTML never traverses React's escaping path.
7. **Persist beyond the session** — write Service Workers, register
   `PushManager` subscriptions, install `PeriodicSyncManager` tasks.

A managed framework cannot leave this surface open by default.

### A.2 Mechanism

Today `bannedFunctions.ts` works by **identity comparison**: a captured
function reference is checked against a denylist at call time. This is the
right mechanism but it has two limits:

- **It only fires when a function is *called*.** Reading `window.location` and
  assigning to `.href` never invokes a banned function — the assignment is a
  property write on a host object. The interpreter needs a parallel
  **property-access guard** (`isBannedMember(receiver, key)`) invoked from
  the member-access and assignment evaluators in
  `eval-tree-common.ts` / `eval-tree-sync.ts`.
- **It assumes a flat global.** Many dangerous capabilities are nested
  (`navigator.clipboard.readText`, `window.indexedDB.open`). The guard must
  match either the leaf function reference *or* a path on a known root
  (`navigator.*`, `document.*`, `window.*`).

Both extensions reuse the existing `BannedFunctionInfo` shape and the existing
call site in the interpreter; no new architecture is required.

### A.3 Recommended Ban List

Legend:

- **Ban** — remove from the expression scope entirely; reading or calling throws
  a `BannedApiError`.
- **Gate** — allow only via a framework wrapper (an XMLUI global function or
  built-in component) that adds policy (CSRF, allowlist, audit).
- **Replace** — provide an XMLUI primitive that supersedes it.

#### A.3.1 Networking — Gate or Replace

| API | Action | Replacement |
|---|---|---|
| `fetch` | **Gate** | Force through `RestApiProxy` (so CSRF, transaction IDs, abort, and a future origin allowlist apply uniformly). |
| `XMLHttpRequest` | **Ban** | Use `DataSource` / `APICall`. |
| `WebSocket` | **Gate** | A future `<WebSocket>` component or `App.openSocket()` global with allowlist + lifecycle. |
| `EventSource` | **Gate** | A managed SSE primitive. |
| `navigator.sendBeacon` | **Ban** | Exfiltration vector; no legitimate need from user expressions. |
| `Request`, `Response`, `Headers` constructors | **Gate** | Not dangerous alone, but their presence is a footgun if `fetch` remains ungated. |

Closing this group turns the original "centralised HTTP with CSRF — Moderate"
verdict into **Strong**.

#### A.3.2 Storage — Gate

| API | Action | Replacement |
|---|---|---|
| `localStorage`, `sessionStorage` | **Gate** | An `AppState` / `AppGlobals` primitive with declared keys; raw access leaks PII and bypasses any future redaction policy. |
| `document.cookie` | **Ban** | No legitimate read/write surface from app expressions. |
| `indexedDB` (`window.indexedDB`) | **Ban** | Out of scope for declarative apps. |
| `caches` (Cache Storage API) | **Ban** | Same. |
| `navigator.storage` | **Ban** | Quota probing is a fingerprinting vector. |

#### A.3.3 Navigation, Window, and Page Identity — Ban or Replace

| API | Action | Replacement |
|---|---|---|
| `window.location` (reads and writes of `href`, `assign`, `replace`, `reload`) | **Replace** | Use the existing `navigate()` global so `willNavigate` guards and the trace pipeline always see it. |
| `window.open` | **Ban** | Pop-up phishing vector; offer an audited `App.openExternal(url)` if needed. |
| `window.close`, `window.stop`, `window.print`, `window.focus`, `window.blur` | **Ban** | — |
| `window.history.pushState` / `replaceState` / `back` / `forward` / `go` | **Ban** | Use `navigate()`. |
| `document.title` setter | **Ban** | Provide a `<PageTitle>` declarative primitive that the framework can render and trace. |
| `document.domain`, `document.cookie` | **Ban** | — |
| `document.write`, `document.writeln` | **Ban** | — |
| `document.execCommand` | **Ban** | — |

#### A.3.4 DOM Mutation Outside React — Ban

The default rendering path is XSS-safe because every value goes through React.
Any DOM API that *bypasses* React must be banned; otherwise the "No XSS in
default text rendering — Strong" verdict does not survive a single line of
expression code.

| API | Action |
|---|---|
| `document.body`, `document.documentElement`, `document.head` (any access) | **Ban** |
| `document.querySelector` / `querySelectorAll` / `getElementById` / `getElementsBy*` | **Ban** — component refs are the managed equivalent. |
| `document.createElement`, `createTextNode`, `createDocumentFragment`, `createRange` | **Ban** |
| `Element.innerHTML`, `outerHTML`, `insertAdjacentHTML` *setters* | **Ban** via property-access guard. |
| `Node.appendChild`, `insertBefore`, `replaceChild`, `removeChild`, `replaceWith`, `before`, `after`, `prepend`, `append` | **Ban** via property-access guard. |
| `Element.setAttribute`, `removeAttribute`, `setAttributeNS` | **Ban** |
| `Range.*`, `Selection.*` | **Ban** |
| `MutationObserver`, `ResizeObserver`, `IntersectionObserver`, `PerformanceObserver` constructors | **Ban** — these are uncancelable side-effect attachments from the framework's perspective. |

#### A.3.5 Background Execution and Concurrency — Ban

These are the structural complement of the existing timer ban — they let an
attacker schedule work through a different door.

| API | Action |
|---|---|
| `Worker`, `SharedWorker` constructors | **Ban** |
| `navigator.serviceWorker.register` / `getRegistration` / `getRegistrations` | **Ban** — Service Workers persist across sessions. |
| `MessageChannel`, `MessagePort` | **Ban** |
| `BroadcastChannel` | **Ban** |
| `Atomics.wait`, `Atomics.notify` | **Ban** |
| `SharedArrayBuffer` constructor | **Ban** |
| `WebAssembly.compile`, `instantiate`, `Module`, `Instance` | **Ban** — required to maintain the "no code injection" guarantee. |
| `Function` constructor | **Ban** (explicitly; the existing ban on `eval` does not cover `new Function()`). |

#### A.3.6 Sensors and User Environment — Ban (Gate Per Component)

| API | Action | Replacement |
|---|---|---|
| `navigator.geolocation` | **Ban** in expressions | Offer an explicit `<Geolocation>` component with permission UX. |
| `navigator.mediaDevices.getUserMedia`, `getDisplayMedia`, `enumerateDevices` | **Ban** | — |
| `navigator.clipboard.readText` | **Ban** | (`writeText` may be gated through a `clipboard.copy()` global with user-gesture enforcement.) |
| `navigator.permissions.query` | **Ban** | Permission probing is a fingerprinting vector. |
| `navigator.bluetooth`, `navigator.usb`, `navigator.serial`, `navigator.hid` | **Ban** | — |
| `navigator.credentials` (CredMan, WebAuthn) | **Ban** in expressions | — |
| `navigator.locks` | **Ban** | — |
| `Notification`, `Notification.requestPermission` | **Ban** | Use the existing `toast()` global. |
| `navigator.share` | **Gate** | Behind a built-in share component. |
| `navigator.userAgent`, `userAgentData`, `platform`, `hardwareConcurrency`, `deviceMemory`, `connection` | **Gate** | Provide a curated `App.environment` object instead; raw fingerprinting surface should not be reachable. |

#### A.3.7 Crypto, Identity, and Persistence — Ban or Gate

| API | Action | Replacement |
|---|---|---|
| `crypto.subtle.*` | **Ban** in expressions | Ad-hoc client crypto is almost always a vulnerability; belongs on the server or in framework-provided helpers. |
| `crypto.getRandomValues` | **Gate** | Via an `App.randomBytes(n)` global with a bounded length, so the trace can record entropy use. |
| `PushManager`, `PeriodicSyncManager`, `BackgroundFetchManager` | **Ban** | — |
| `cookieStore` | **Ban** | — |

#### A.3.8 DevTools and Console Surface — Replace

| API | Action | Replacement |
|---|---|---|
| `console.*` | **Replace** | Route through `pushXsLog` so output lands in the trace and any future audit sink; raw `console` can silently leak PII. |
| `debugger` statement | **Ban** at the parser level — it should not parse as a valid expression statement. |
| `performance.now`, `performance.mark`, `performance.measure` | **Gate** | Provide `App.now()` for time; let the trace record marks. |

### A.4 Property-Access Guard Sketch

A single new helper in the script-runner closes most of the surface above that
is *not* a direct function call:

```ts
// bannedFunctions.ts — new export alongside isBannedFunction()
export function isBannedMember(receiver: any, key: string | symbol): BannedFunctionResult {
  if (receiver == null) return { banned: false };

  // Roots that should not be accessed at all.
  if (receiver === globalThis || receiver === window) {
    if (BANNED_GLOBAL_KEYS.has(key as string))
      return { banned: true, help: BANNED_GLOBAL_HELP.get(key as string) };
  }
  if (receiver === document || receiver === window?.document) {
    if (BANNED_DOCUMENT_KEYS.has(key as string))
      return { banned: true, help: "DOM mutation bypasses React rendering safety." };
  }
  if (receiver === navigator) {
    if (BANNED_NAVIGATOR_KEYS.has(key as string))
      return { banned: true };
  }

  // Property setters that bypass React (write path guard).
  if (BANNED_DOM_SETTER_KEYS.has(key as string) && receiver instanceof Element)
    return { banned: true, help: "Use component props to update the DOM." };

  return { banned: false };
}
```

This helper is called from:

1. The **member-access evaluator** (read path, so `document.querySelector` never
   returns a live node).
2. The **assignment evaluator** (write path, so `el.innerHTML = "…"` is blocked
   before the assignment executes).
3. The **call evaluator** (so `obj.bannedMethod(…)` is blocked one level earlier
   than the existing `isBannedFunction` check).

The same `help` field in `BannedFunctionInfo` carries a human-readable message
pointing at the managed alternative
(e.g., `"Use navigate() instead of window.location.assign"`).

### A.5 Scorecard Impact

Closing the items in A.3 + adding the guard in A.4 moves several rows in the
consolidated scorecard:

| Row | Today | After this work |
|---|---|---|
| **DOM API isolation** | Weak | **Strong** — only the curated `App.*` globals are reachable from expressions. |
| **Centralised HTTP with CSRF** | Moderate | **Strong** — `fetch` / `XMLHttpRequest` / `WebSocket` are structurally unreachable except through `RestApiProxy`-routed primitives. |
| **No XSS in default rendering** | Strong (with Markdown caveat) | **Strong without caveat** — DOM mutation outside React is structurally unreachable, so even an HTML-flavoured value cannot find an injection sink. |
| **Audit logging coverage** | Browser only | Higher fidelity — `console`, ad-hoc network calls, and direct DOM mutation can no longer silently evade the trace. |

### A.6 Migration Considerations

A ban list of this size is a breaking change for any app that uses browser APIs
directly from expressions. Suggested rollout:

1. **Phase 1 — Warn.** Add the property-access guard in *report-only* mode:
   every banned access produces a trace entry but still executes. Ship for one
   minor release so teams can audit their apps.
2. **Phase 2 — Opt-in enforcement.** Add an `App` setting
   (`strictDomSandbox="true"`) that flips the guard from warn to throw.
   Document the curated managed alternative for each banned API.
3. **Phase 3 — Default on.** Flip the default. Keep a one-release escape hatch
   (`strictDomSandbox="false"`) for migration; remove it in the following major
   release.

Each phase reuses the existing trace pipeline, so the cost of the rollout is
dominated by documentation, not code. The substrate is already there — this
appendix is, in the spirit of the rest of the report, a matter of
*spending* it.
