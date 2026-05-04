# DOM API Hardening — Implementation Plan

**Date:** 2026-04-28
**Status:** Proposal
**Source:** [`managed-react.md` Appendix A](./managed-react.md)

---

## Goal

Raise the **DOM API access** verdict in the Managed React assessment from
**Weak** to **Strong** by extending the script-runner sandbox to cover the
broader browser API surface. The work is split into small, independently
shippable, independently testable steps in priority order:

1. **Ban** items first (highest priority; pure denial; no replacement work).
2. **Replace** items second (introduce or re-use a managed primitive, then deny
   the raw API).
3. **Gate** items last (require new wrapper APIs; lowest priority).

Every step ships behind a single `App.appGlobals.strictDomSandbox` switch
(see Step 0) so the rollout can stage warn → opt-in → default-on without
touching call sites again.

---

## Conventions

- **Source of truth:** the existing
  [`bannedFunctions.ts`](../../src/components-core/script-runner/bannedFunctions.ts)
  for callable identities, plus a new sibling `bannedMembers.ts` for
  property-access identities and key sets.
- **Guard call sites:** member-access read, member-access write, and call
  evaluators in
  [`eval-tree-common.ts`](../../src/components-core/script-runner/eval-tree-common.ts)
  and [`eval-tree-sync.ts`](../../src/components-core/script-runner/eval-tree-sync.ts).
- **Error type:** new `BannedApiError extends Error` thrown by the guard,
  carrying `{ api: string, help?: string }`. Caught by the existing handler
  error pipeline → trace + toast.
- **Reporting mode:** when `strictDomSandbox === false` (default during
  rollout), the guard does **not** throw; it emits a `kind: "sandbox:warn"`
  trace entry and lets the access proceed.
- **Test layout:** unit tests live in `xmlui/tests/components-core/script-runner/`
  next to the existing `bannedFunctions` tests; one spec file per step.

Each step lists: scope, files touched, tests, acceptance criteria, dependencies.

---

## Step 0 — Sandbox Switch + Property-Access Guard Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictDomSandbox: boolean` (default `false`).
- Introduce `BannedApiError` and the `isBannedMember(receiver, key)` helper.
- Wire the helper into the three evaluator points (read / write / call) in
  `eval-tree-common.ts` and `eval-tree-sync.ts`.
- In *warn* mode: emit `pushXsLog({ kind: "sandbox:warn", api, help })` and
  proceed.
- In *strict* mode: throw `BannedApiError`.

The denylists themselves stay empty in this step — every later step adds
entries to them.

### Files

- `xmlui/src/components-core/script-runner/bannedMembers.ts` (new)
- `xmlui/src/components-core/script-runner/bannedFunctions.ts` (export
  `BannedApiError`)
- `xmlui/src/components-core/script-runner/eval-tree-common.ts`
- `xmlui/src/components-core/script-runner/eval-tree-sync.ts`
- `xmlui/src/components-core/inspector/inspectorUtils.ts` (add
  `"sandbox:warn"` to the `XsLogEntry.kind` union)
- `xmlui/src/components-core/abstractions/standalone.ts` (document
  `strictDomSandbox`)

### Tests

- `bannedMembers.test.ts`
  - With an empty denylist, no access is blocked.
  - A seeded test-only entry blocks reads / writes / calls separately.
  - In warn mode, blocked access proceeds and produces a `sandbox:warn`
    trace entry.
  - In strict mode, blocked access throws `BannedApiError` with `api` and
    `help`.

### Acceptance

- All existing tests pass unchanged.
- Default behaviour of any app is unchanged.
- A unit test can flip `strictDomSandbox` and observe the new guard fire.

---

# Phase 1 — Ban (Highest Priority)

These steps add denylist entries only. No replacement APIs needed. Each step
is small enough to ship individually.

## Step 1.1 — Ban `Function`, `eval` Aliases, and `WebAssembly`

**Priority:** 1 (closes the largest remaining code-injection surface)

### Scope

Extend `bannedFunctions.ts` with:

- `globalThis.Function` (the constructor — covers `new Function("…")`).
- `WebAssembly.compile`, `WebAssembly.instantiate`,
  `WebAssembly.compileStreaming`, `WebAssembly.instantiateStreaming`,
  `WebAssembly.Module`, `WebAssembly.Instance`.

### Tests

- `eval` already throws — confirmed.
- `new Function("return 1")` — throws in strict mode.
- `WebAssembly.compile(...)` — throws in strict mode.
- Warn mode: each produces a `sandbox:warn` entry.

### Acceptance

The "no code injection via `eval()`" verdict in the assessment now also
covers `Function` and WebAssembly without caveat.

---

## Step 1.2 — Ban `debugger` Statement at the Parser

**Priority:** 1

### Scope

Reject the `debugger` keyword in the scripting parser. It is not a function;
it is a statement. The change is in
`xmlui/src/parsers/scripting/Parser.ts` — add a parse-time error
("`debugger` is not allowed in expressions").

### Tests

- A `.xmlui` expression containing `debugger;` produces a parse diagnostic
  with line/column.

### Acceptance

Inline expressions cannot drop the runtime into the browser debugger.

---

## Step 1.3 — Ban Direct DOM Mutation APIs

**Priority:** 1 (closes the XSS-without-React loophole)

### Scope

Add `bannedMembers.ts` entries on `document`, `window.document`, and
`Element.prototype`:

- Document roots: `body`, `documentElement`, `head` (any read).
- Document queries: `querySelector`, `querySelectorAll`, `getElementById`,
  `getElementsByClassName`, `getElementsByTagName`, `getElementsByName`.
- Document factories: `createElement`, `createElementNS`, `createTextNode`,
  `createDocumentFragment`, `createRange`.
- Document side effects: `write`, `writeln`, `execCommand`, `domain`,
  `cookie`.
- Element setter keys (write path): `innerHTML`, `outerHTML`.
- Element setter methods: `insertAdjacentHTML`, `insertAdjacentElement`,
  `insertAdjacentText`, `setAttribute`, `removeAttribute`,
  `setAttributeNS`.
- Node mutation methods: `appendChild`, `insertBefore`, `replaceChild`,
  `removeChild`, `replaceWith`, `before`, `after`, `prepend`, `append`.
- Range/Selection: `Range`, `Selection`, `getSelection`.
- Observers: `MutationObserver`, `ResizeObserver`, `IntersectionObserver`,
  `PerformanceObserver`.

### Tests

One spec file (`bannedMembers.dom.test.ts`) iterating each API. For element
setters, instantiate via React, capture a real Element, assert the guard
fires on write.

### Acceptance

The "No XSS in default rendering — Strong" verdict survives any user
expression. Only the Markdown component caveat remains (separate work).

---

## Step 1.4 — Ban Background Execution and Concurrency APIs

**Priority:** 1 (closes the timer-ban analog)

### Scope

Add to `bannedFunctions.ts` / `bannedMembers.ts`:

- Constructors: `Worker`, `SharedWorker`, `MessageChannel`, `MessagePort`,
  `BroadcastChannel`, `SharedArrayBuffer`.
- `navigator.serviceWorker` (entire object — read and any method:
  `register`, `getRegistration`, `getRegistrations`).
- `Atomics.wait`, `Atomics.notify`.

### Tests

`bannedMembers.concurrency.test.ts` — one assertion per API.

### Acceptance

The structural complement of the existing timer ban is in place; no
side-channel scheduling primitive remains reachable from expressions.

---

## Step 1.5 — Ban Storage and Persistence APIs (Raw Path)

**Priority:** 1 (`localStorage`/`sessionStorage` get a Gate later in
Phase 3.1; the *raw* access is banned now so the strict mode is meaningful)

### Scope

- `document.cookie` (read and write).
- `window.indexedDB` (any access).
- `caches` (Cache Storage).
- `navigator.storage`.
- `cookieStore`.
- `localStorage`, `sessionStorage` — banned at this step. **Replacement** is
  Phase 2.1 (`AppState`/`AppGlobals`); until that lands, raw storage simply
  cannot be reached in strict mode.
- `PushManager`, `PeriodicSyncManager`, `BackgroundFetchManager` — banned
  outright (no replacement planned).

### Tests

`bannedMembers.storage.test.ts`.

### Acceptance

In strict mode, no expression can read or write the browser's persistent
storage surface. In warn mode, every such access produces an actionable
trace entry pointing teams at the migration target.

---

## Step 1.6 — Ban Sensors and User-Environment APIs

**Priority:** 1

### Scope

- `navigator.geolocation` (any access).
- `navigator.mediaDevices` and its methods (`getUserMedia`, `getDisplayMedia`,
  `enumerateDevices`).
- `navigator.clipboard.readText`. (Note: `writeText` is **Replace** — see
  Phase 2.2.)
- `navigator.permissions`.
- `navigator.bluetooth`, `navigator.usb`, `navigator.serial`,
  `navigator.hid`.
- `navigator.credentials`.
- `navigator.locks`.
- `Notification` constructor and `Notification.requestPermission`.

### Tests

`bannedMembers.sensors.test.ts`.

### Acceptance

The fingerprinting and capability surface is closed. Per-component opt-in
remains the only path (future `<Geolocation>` etc.).

---

## Step 1.7 — Ban Navigation, Window, and Page-Identity APIs (Bare)

**Priority:** 1 (the *Replace* counterparts in Phase 2.3 cover the legitimate
use cases)

### Scope

- `window.open`, `window.close`, `window.stop`, `window.print`,
  `window.focus`, `window.blur`.
- `window.history` (any method: `pushState`, `replaceState`, `back`,
  `forward`, `go`).
- `document.title` setter.
- `document.domain` (already covered by 1.3, listed for completeness).
- `window.location` reads and writes — **banned here**, replaced by the
  existing `navigate()` global. Strict mode produces a `BannedApiError`
  whose `help` reads "Use navigate() instead of window.location".

### Tests

`bannedMembers.navigation.test.ts`.

### Acceptance

All navigation flows through `navigate()` (and therefore through
`willNavigate` and the trace pipeline). Pop-up phishing surface is closed.

---

## Step 1.8 — Ban Direct Network Constructors

**Priority:** 1

### Scope

- `XMLHttpRequest` constructor.
- `navigator.sendBeacon`.
- `EventSource` constructor (Gate is Phase 3.3).
- `WebSocket` constructor (Gate is Phase 3.3).

### Tests

`bannedMembers.network.test.ts`.

### Acceptance

Only `fetch` (Phase 3.2 Gate) and the existing `RestApiProxy`-routed
primitives remain as network entry points.

---

## Step 1.9 — Ban Crypto and DevTools Surface (Raw)

**Priority:** 1

### Scope

- `crypto.subtle` (any access).
- `crypto.getRandomValues` — banned here; **Replace** is Phase 2.4
  (`App.randomBytes`).
- `performance` (banned here; **Replace** is Phase 2.5: `App.now`,
  `App.mark`).
- `console` (banned here; **Replace** is Phase 2.6, the highest-priority
  Replace step — see below).

### Tests

`bannedMembers.misc.test.ts`.

### Acceptance

Only managed alternatives (added in Phase 2) remain reachable.

---

# Phase 2 — Replace (Medium Priority)

Each Replace step adds a managed primitive *first*, then removes the
corresponding banned-list `help` text's "no replacement available" caveat.
The bans landed in Phase 1 are already in effect; these steps just give
users a supported migration path.

## Step 2.1 — Replace `localStorage` / `sessionStorage` with `AppState`

**Priority:** 2 (highest among Replace; covers the most common legitimate
need)

### Scope

- Define an `AppState` global function with a declared keys list:
  - `AppState.get(key)`, `AppState.set(key, value)`,
    `AppState.remove(key)`, `AppState.clear()`.
  - Persistence backend is `localStorage` under the `xmlui:appstate:` key
    prefix.
  - Schema: `App.appGlobals.appStateKeys: string[]` declares the allowed
    key set; unknown keys throw at access time.
- Update `bannedMembers.ts` `help` text to point at `AppState`.

### Tests

- Get/set round-trip.
- Unknown key — throws.
- Schema-less mode (no `appStateKeys` configured) — falls back to
  permissive read/write under the namespaced prefix.

### Acceptance

Apps that need persistent state have a documented, audited path.
`localStorage` remains banned.

---

## Step 2.2 — Replace `clipboard.writeText` with `Clipboard.copy()`

**Priority:** 2

### Scope

- Add a `Clipboard.copy(text)` global. Internally calls
  `navigator.clipboard.writeText`, but only when invoked synchronously
  from a user-initiated event handler (the framework already tags handler
  origin). Calls outside a user gesture throw.
- Trace entry on every copy.

### Tests

- From a `Button.onClick`: copies and traces.
- From a `DataSource.transformResult`: throws (no user gesture).

### Acceptance

Copy works for legitimate clicks; silent clipboard writes are impossible.

---

## Step 2.3 — Document and Lock In the `navigate()` Replacement

**Priority:** 2

### Scope

`navigate()` already exists — this step is documentation + a stricter
contract:

- `navigate(href, { replace?: boolean, target?: "_self" | "_blank" })`.
- `target: "_blank"` is the *only* sanctioned way to open a new tab; it
  uses an audited internal helper that sets `noopener,noreferrer`.
- All call sites of `window.open` in non-test code are removed.

### Tests

- `navigate("/x")` produces a `kind: "navigate"` trace entry.
- `navigate("/x", { target: "_blank" })` opens with `noopener`.
- A test that simulates a banned `window.open` call sees `BannedApiError`.

### Acceptance

`window.open` and `window.location` have a fully-documented replacement.

---

## Step 2.4 — Replace `crypto.getRandomValues` with `App.randomBytes(n)`

**Priority:** 2

### Scope

- Global `App.randomBytes(n: number): Uint8Array` where `1 <= n <= 1024`.
- Internally calls `crypto.getRandomValues`. Logs `n` (not the bytes)
  to the trace.

### Tests

- Returns a typed array of the requested length.
- `n` outside bounds throws.

### Acceptance

Entropy is bounded and observable.

---

## Step 2.5 — Replace `performance.*` with `App.now`, `App.mark`

**Priority:** 3

### Scope

- `App.now(): number` — `performance.now()` wrapper.
- `App.mark(label: string)`, `App.measure(label, fromMark)` — record into
  the trace, not into the browser's performance buffer (the trace already
  stores timestamps).

### Tests

Round-trip; trace contains the marks; raw `performance` is unreachable.

### Acceptance

Timing is available and trace-visible.

---

## Step 2.6 — Replace `console.*` with `pushXsLog` + `silentConsole` Switch

**Priority:** 2 (called out specifically by the user; ships alongside 2.1)

### Scope

This step has two parts.

**Part A — Route `console` through the trace.** Add a managed `Log` global
that maps to the existing inspector pipeline:

| User-facing call | Trace `kind` |
|---|---|
| `Log.debug(...args)` | `"log:debug"` |
| `Log.info(...args)` | `"log:info"` |
| `Log.warn(...args)` | `"log:warn"` |
| `Log.error(...args)` | `"log:error"` |

Internally `Log.*` calls `pushXsLog({ kind, args, ts: Date.now() })` and
**also**, by default, mirrors to the native `console.*` so existing
debugging workflows keep working.

**Part B — `silentConsole` switch.** Add
`App.appGlobals.silentConsole: boolean` (default `false`):

- `false` (default): `Log.*` writes to the trace **and** to `console.*`.
- `true`: `Log.*` writes **only** to the trace; the native `console.*`
  call is suppressed.

The native `console` global is already on the Phase 1.9 ban list. The
`silentConsole` switch governs only the framework's own internal mirroring
through `Log.*` — it is not a way to re-enable raw `console` access from
expressions.

### Files

- `xmlui/src/components-core/script-runner/globals/log.ts` (new) — implements
  the `Log` namespace.
- `xmlui/src/components-core/inspector/inspectorUtils.ts` — add
  `"log:debug" | "log:info" | "log:warn" | "log:error"` to the
  `XsLogEntry.kind` union.
- `xmlui/src/components-core/StandaloneApp.tsx` — read
  `appGlobals.silentConsole` and pass it into the `Log` factory.
- `xmlui/src/components-core/abstractions/standalone.ts` — document
  `silentConsole`.

### Tests

`globals/log.test.ts`:

- `Log.info("x")` writes a `log:info` trace entry with `args: ["x"]`.
- With `silentConsole: false` (default), `console.info` is also called
  (spy on `globalThis.console.info`).
- With `silentConsole: true`, `console.info` is **not** called; only the
  trace entry exists.
- Each level (`debug`, `info`, `warn`, `error`) produces its matching
  `kind`.
- Trace entries respect the existing `xsLogMax` circular buffer cap.

### Acceptance

- Apps that previously called `console.log` from expressions (now banned)
  have a documented, audited replacement.
- Production deployments can flip `silentConsole: true` to keep diagnostic
  data inside the trace and out of the browser console — useful when the
  trace is exported to a server sink.

---

# Phase 3 — Gate (Lower Priority)

Gates wrap an existing browser API behind framework policy (CSRF, allowlist,
audit). They are lower priority than Bans because the corresponding Phase 1
ban already removes the raw API; the Gate just makes the legitimate use
case ergonomic again.

## Step 3.1 — Gate `localStorage` / `sessionStorage` (covered by Step 2.1)

The `AppState` primitive from Step 2.1 is also the "Gate". No additional
work — listed here for completeness.

---

## Step 3.2 — Gate `fetch` Through `RestApiProxy`

**Priority:** 3

### Scope

- Add `fetch` to the Phase 1.8 ban list.
- Provide an `App.fetch(input, init?)` global that delegates to
  `RestApiProxy` so CSRF, transaction headers, abort, and a future origin
  allowlist apply uniformly.
- Optional `App.appGlobals.allowedOrigins: string[]` honoured by
  `App.fetch` when set.

### Tests

- `App.fetch("/x")` carries XSRF header.
- With `allowedOrigins` set, a cross-origin request is rejected before
  hitting the network.

### Acceptance

The "Centralised HTTP with CSRF" row in the assessment moves from
**Moderate** to **Strong**.

---

## Step 3.3 — Gate `WebSocket` and `EventSource`

**Priority:** 4

### Scope

Two new components / globals (or one of each):

- `<WebSocket url="…" onMessage="…" onOpen="…" onClose="…" />` —
  declarative, lifecycle-managed, allowlist-respecting.
- `<EventSource url="…" onMessage="…" />` — same.
- Each maintains a single connection per element, cancels on unmount,
  emits trace entries on connect / message / error / close.

### Tests

- Open/close lifecycle.
- Allowlist enforcement.
- Unmount closes the socket.

### Acceptance

Streaming network surfaces have a managed entry point.

---

## Step 3.4 — Gate Environment Probing (`navigator.userAgent` etc.)

**Priority:** 5 (lowest)

### Scope

Add `App.environment: { isMobile, prefersDark, prefersReducedMotion,
locale, languages }` — a curated, derived set of values. The raw
`navigator.userAgent`, `userAgentData`, `platform`,
`hardwareConcurrency`, `deviceMemory`, `connection` remain banned.

### Tests

Each property returns a sensible value under JSDOM and Playwright fixtures.

### Acceptance

Fingerprinting surface is closed; legitimate environment-aware UI has a
defined, minimal API.

---

## Rollout (Per the Appendix's A.6)

Independent of the steps above, the rollout schedule is:

1. **Phase 1 (warn).** Land Steps 0 + 1.1–1.9 + 2.6 with `strictDomSandbox`
   defaulting to `false`. Every banned access produces a trace entry; nothing
   throws. Ship for one minor release; teams audit their apps using the
   trace.
2. **Phase 2 (opt-in strict).** Add the remaining Replace steps (2.1–2.5).
   Apps that opt in by setting `strictDomSandbox: true` get hard
   enforcement. Document migrations.
3. **Phase 3 (default strict).** Flip `strictDomSandbox` default to `true`
   in the next major release. Land the Gate steps (3.1–3.4) so legitimate
   workflows have ergonomic replacements. Keep the `false` escape hatch
   for one release; remove it after.

Each *implementation* step (above) is independently mergeable and
independently testable; the *rollout* phases bundle them for release.

---

## Step Dependency Graph

```
Step 0 ─┬─> Step 1.1 ─┐
        ├─> Step 1.2  │
        ├─> Step 1.3  │
        ├─> Step 1.4  ├─> Phase 1 release (warn mode)
        ├─> Step 1.5  │
        ├─> Step 1.6  │
        ├─> Step 1.7  │
        ├─> Step 1.8  │
        └─> Step 1.9 ─┘
                        │
   ┌────────────────────┘
   │
   ├─> Step 2.6 (Log + silentConsole) ─┐
   ├─> Step 2.1 (AppState)              │
   ├─> Step 2.2 (Clipboard.copy)        ├─> Phase 2 release (opt-in strict)
   ├─> Step 2.3 (navigate hardening)    │
   ├─> Step 2.4 (App.randomBytes)       │
   └─> Step 2.5 (App.now / App.mark) ───┘
                        │
   ┌────────────────────┘
   │
   ├─> Step 3.2 (App.fetch + allowlist)
   ├─> Step 3.3 (WebSocket / EventSource components)
   └─> Step 3.4 (App.environment)         ─> Phase 3 release (default strict)
```

---

## Open Questions

1. **Where does the `Log` namespace live in markup?** — A bare global like
   `Log.info(...)` mirrors how `toast()` and `navigate()` are exposed
   today; that is the recommendation. Alternative: namespace under
   `App.log.*` for consistency with `App.fetch`, `App.now`,
   `App.randomBytes`.
2. **Should `silentConsole: true` also suppress framework-internal
   `console` calls** (e.g., React warnings)? The proposal says **no** —
   `silentConsole` governs only the `Log.*` mirror. Suppressing the React
   developer-warning channel would hide real bugs.
3. **Migration tooling.** A small CLI (`xmlui audit-sandbox`) that scans
   `.xmlui` files and lists every banned API used would shorten the
   warn-mode phase considerably. Out of scope for this plan; tracked
   separately.
