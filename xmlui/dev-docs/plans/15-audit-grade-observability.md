# Audit-Grade Observability — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §15 "Logging, Tracing, and Audit"](./managed-react.md) and the §17 scorecard row **"Audit logging — Browser only, unredacted."**

---

## Goal

Close the §17 scorecard row:

> **Audit logging — Browser only, unredacted.**
> Path to managed: *OTLP exporter; PII redaction policy.*

The trace substrate that XMLUI already ships — `pushXsLog` and
the Inspector pipeline documented in
[`inspector-debugging.md`](../../../.ai/xmlui/inspector-debugging.md)
— is the *strongest* "managed" feature XMLUI has. Every
interaction, navigation, API call, handler start / complete /
error, and state diff lands in a circular in-memory buffer
keyed by `XsLogEntry.kind` (extended in 2026-04 with
`sandbox:warn`, `log:*`, `app:randomBytes`, `app:mark/measure`,
`app:fetch`, `clipboard:copy`, `navigate`, `ws:*`,
`eventsource:*`, plus the per-domain kinds added by the other
§17 plans: `theming`, `forms`, `i18n`, `versioning`, `build`,
`udc`, `accessibility`, `lifecycle`, `concurrency`, `error`).

Turning that substrate into an **audit-grade** system is, per
§15's own verdict, *"largely a packaging exercise."* This plan
delivers the four pieces §15 names as missing:

1. **Server sink + OTLP exporter** — trace entries flow off the
   browser to a centralised system.
2. **PII redaction** — declarative redaction policy applied
   *before* an entry leaves the browser; password fields,
   `Authorization` headers, and configured payload paths are
   masked by construction.
3. **Sampling, retention, and search** — head-based + tail-based
   sampling, configurable buffer policies, on-disk retention via
   the server sink, and a queryable index.
4. **Correlation IDs** — `traceId` / `spanId` propagated across
   navigations, across `<DataSource>` / `<APICall>`, and across
   handler chains; W3C `traceparent` headers attached to
   outgoing requests.

The work is split into independently shippable phases. Every
step lands behind `App.appGlobals.strictAuditLogging: boolean`
(see Step 0). Strict mode flips the *default redaction policy*
from "warn on unredacted" to "block on unredacted" and the
*default sink behaviour* from "drop on backpressure" to
"buffer with bounded memory then drop with audit-loss
diagnostic."

---

## Conventions

- **Source of truth for the trace substrate:**
  [`inspectorUtils.ts`](../../src/components-core/inspector/inspectorUtils.ts)
  (the `XsLogEntry` union, the circular buffer, `pushXsLog`)
  and the docs in
  [`inspector-debugging.md`](../../../.ai/xmlui/inspector-debugging.md).
  All work in this plan extends that pipeline; it does **not**
  introduce a parallel logging path.
- **Source of truth for outgoing HTTP:**
  [`xmlui/src/components-core/data-fetch/`](../../src/components-core/data-fetch/)
  — `<DataSource>` / `<APICall>` ride React Query under the hood
  per [`data-operations.md`](../../../.ai/xmlui/data-operations.md).
  Correlation header injection hooks here.
- **Source of truth for redaction policy** is *declarative*:
  apps configure via `<App auditPolicy>` in markup and via
  `xmlui.config.json` for build-time / CI-only overrides.
  Components contribute *defaults* via metadata
  (`PropertyDef.audit`).
- **OTLP wire format:** OpenTelemetry Protocol over HTTP/JSON
  (`application/x-protobuf` is out of scope — JSON keeps the
  in-browser exporter dependency-light). The semantic
  conventions follow OpenTelemetry's general spec; XMLUI-specific
  attributes are namespaced under `xmlui.*`.
- **New module location:**
  `xmlui/src/components-core/audit/` (new directory) holds the
  exporter, the redactor, the sampler, and the correlation
  context manager. `audit/index.ts` is the barrel.
- **New trace `kind: "audit"`** for *meta* events (audit pipeline
  loss, redaction policy changes, exporter failures) — note
  this is the audit *system's own* trace kind; the audit
  pipeline carries every other `kind` to the sink.
- **Diagnostic codes** (open union `AuditDiagCode`):
  `audit-redaction-missing`, `audit-redaction-overrun`,
  `audit-sink-failure`, `audit-correlation-missing`,
  `audit-buffer-overflow`, `audit-pii-leaked`,
  `audit-policy-conflict`.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/audit/`; one spec per surface.
  E2E tests under `xmlui/tests-e2e/audit/`. Playwright fixtures
  for OTLP receiver under `xmlui/tests/fixtures/otlp-receiver/`.

Each step lists: scope, files touched, tests, acceptance
criteria, dependencies.

---

## Step 0 — Switch + Audit Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictAuditLogging: boolean` (default
  `false`; flips to `true` in the next major).
- Create `xmlui/src/components-core/audit/` with stubs:

  ```ts
  // diagnostics.ts
  export type AuditDiagCode =
    | "audit-redaction-missing"
    | "audit-redaction-overrun"
    | "audit-sink-failure"
    | "audit-correlation-missing"
    | "audit-buffer-overflow"
    | "audit-pii-leaked"
    | "audit-policy-conflict";

  export interface AuditDiagnostic {
    code: AuditDiagCode;
    severity: "error" | "warn" | "info";
    message: string;
    data?: unknown;
  }
  ```

  ```ts
  // policy.ts
  export interface AuditPolicy {
    redact: ReadonlyArray<RedactionRule>;
    sample: SamplingRule;
    retention: RetentionRule;
    sink?: SinkConfig;
  }
  export interface RedactionRule {
    selector: string;            // path expression — see Phase 2
    mode: "mask" | "drop" | "hash";
    replacement?: string;
  }
  export interface SamplingRule {
    head?: { rate: number };     // 0..1
    tail?: { keepIfErrorIn: ReadonlyArray<string> };
  }
  export interface RetentionRule {
    bufferSize: number;          // entries
    onOverflow: "drop-oldest" | "drop-newest" | "block";
  }
  export interface SinkConfig {
    kind: "otlp" | "console" | "custom";
    endpoint?: string;
    headers?: Record<string, string>;
  }
  ```

  ```ts
  // redactor.ts
  export function redact(entry: XsLogEntry, policy: AuditPolicy): XsLogEntry;
  ```

  ```ts
  // sampler.ts
  export function sample(entry: XsLogEntry, policy: AuditPolicy): boolean;
  ```

  ```ts
  // correlation.ts
  export interface TraceContext { traceId: string; spanId: string; parentSpanId?: string; }
  export function currentContext(): TraceContext | null;
  export function withSpan<T>(name: string, fn: (ctx: TraceContext) => T): T;
  export function injectTraceparent(headers: Headers): void;
  ```

  ```ts
  // sink.ts
  export interface AuditSink {
    push(entry: XsLogEntry): void;
    flush(): Promise<void>;
  }
  export function createOtlpSink(cfg: SinkConfig): AuditSink;
  export function createConsoleSink(): AuditSink;
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"audit"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/audit/diagnostics.ts` (new)
- `xmlui/src/components-core/audit/policy.ts` (new)
- `xmlui/src/components-core/audit/redactor.ts` (new)
- `xmlui/src/components-core/audit/sampler.ts` (new)
- `xmlui/src/components-core/audit/correlation.ts` (new)
- `xmlui/src/components-core/audit/sink.ts` (new)
- `xmlui/src/components-core/audit/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `audit/policy.test.ts` — empty policy round-trips; defaults
  produce no-op redactor / always-keep sampler.

### Acceptance

- `strictAuditLogging` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Correlation IDs

### Step 1.1 — `traceId` / `spanId` on every entry

**Priority:** 1

#### Scope

- Extend `XsLogEntry` with optional `traceId`, `spanId`,
  `parentSpanId` fields (W3C trace-context shape).
- The correlation manager
  ([`audit/correlation.ts`](../../src/components-core/audit/correlation.ts))
  generates a fresh `traceId` per top-level user interaction
  (click, route change, initial load) and threads `spanId` /
  `parentSpanId` through nested handler calls.
- `pushXsLog` reads the current correlation context and stamps
  every entry automatically; manual override remains possible
  via `withSpan`.
- A handler entry / exit pair becomes a `span:start` /
  `span:end` trace pair (new sub-kinds inside existing
  `kind: "handler"` entries — no new `kind`).

#### Files

- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/audit/correlation.ts`
- The handler invoker
  (see [action-execution.md](../../../.ai/xmlui/action-execution.md))

#### Tests

- `audit/correlation.test.ts` — a synthetic click chain
  produces one `traceId` shared by the click handler entry, the
  `<APICall>` it triggers, the resulting `app:fetch` entry, and
  the toast that follows.

#### Acceptance

- Every entry produced after Step 1.1 carries a `traceId`;
  entries before the first interaction carry the boot-trace id.

#### Dependencies

Step 0.

---

### Step 1.2 — `traceparent` header injection

**Priority:** 2

#### Scope

- Outgoing HTTP from `<DataSource>` / `<APICall>` /
  `App.fetch(…)` automatically carries a W3C `traceparent`
  header derived from the current context.
- Apps may opt out per-call via `<APICall traceparent="off">`
  (some endpoints reject unknown headers).
- A new `<App audit traceparentScope="same-origin | all">`
  attribute restricts header emission to same-origin requests
  by default (the safe choice — third-party origins should not
  receive the app's trace ids).

#### Files

- `xmlui/src/components-core/data-fetch/`
  (the request preparation step)
- `xmlui/src/components-core/audit/correlation.ts`

#### Tests

- E2E: a `<DataSource>` to a same-origin endpoint receives a
  `traceparent` header; cross-origin requests do not (under
  default `same-origin`).

#### Acceptance

- A backend logging the `traceparent` header can correlate
  server-side logs with the browser's audit trail.

#### Dependencies

Step 1.1.

---

### Step 1.3 — `audit-correlation-missing` diagnostic

**Priority:** 3

#### Scope

- Any `XsLogEntry` produced *outside* a span context (manual
  `pushXsLog` calls in custom code-behind, third-party UDCs)
  fires `audit-correlation-missing` (severity `info`; strict
  `warn`).
- The diagnostic carries the offending kind and a stack hint;
  it does *not* drop the entry — the boot-trace id is used.

#### Files

- `xmlui/src/components-core/inspector/inspectorUtils.ts`

#### Tests

- A code-behind handler calling `pushXsLog` without a wrapping
  span produces the diagnostic.

#### Acceptance

- Apps can audit which custom code is missing correlation hooks.

#### Dependencies

Step 1.1.

---

## Phase 2 — PII Redaction

### Step 2.1 — Component metadata `audit` flag

**Priority:** 4

#### Scope

- Extend `PropertyDef` in
  [`ComponentDefs.ts`](../../src/abstractions/ComponentDefs.ts)
  with an optional `audit` field:

  ```ts
  audit?: {
    classification: "public" | "sensitive" | "secret";
    defaultRedaction?: "mask" | "drop" | "hash";
  };
  ```

- Built-in components annotate sensitive props out of the box:
  - `<TextBox type="password">` → `secret` / `mask`.
  - `<APICall headers.Authorization>` (header path) → `secret` /
    `mask`.
  - `<APICall headers.Cookie>` → `secret` / `drop`.
  - `<TextBox type="email">` → `sensitive` / `hash`.
  - `<Form>` `data` shape inherits per-field classification from
    the `<FormItem>` it backs.
- The redactor consults this metadata as the *baseline* policy;
  app-level `<App auditPolicy>` rules layer on top.

#### Files

- `xmlui/src/abstractions/ComponentDefs.ts`
- `xmlui/src/components/Form/`, `xmlui/src/components/TextBox/`,
  `xmlui/src/components/APICall/` — annotate.
- `xmlui/src/components-core/audit/redactor.ts`

#### Tests

- A `<TextBox type="password" value="secret123">` renders an
  audit entry with `value: "***"` (default `mask`).
- An `<APICall headers="{ Authorization: 'Bearer abc' }">`
  produces an `app:fetch` entry with the header masked.

#### Acceptance

- Out of the box, the most common PII paths are masked without
  any app-level policy.

#### Dependencies

Step 0; alignment with the
[verified-type-contracts](./01-verified-type-contracts.md) plan
(both extend `PropertyDef`).

---

### Step 2.2 — Declarative `<App auditPolicy>` markup

**Priority:** 5

#### Scope

- New child element under `<App>`:

  ```xmlui
  <App>
    <auditPolicy>
      <redact selector="event.payload.ssn" mode="hash" />
      <redact selector="state.user.email" mode="mask" />
      <redact selector="header.X-Api-Key" mode="drop" />
      <redact selector="form.checkout.creditCard" mode="mask" replacement="**** **** **** ****" />
    </auditPolicy>
  </App>
  ```

- `selector` is a dotted path within the entry's serialised
  shape; supports `*` wildcards on a single segment and `**` on
  multiple segments.
- `mode`:
  - `mask` — replace value with `***` (or `replacement`).
  - `drop` — remove the key entirely.
  - `hash` — replace with `sha256(value).slice(0, 16)` for
    fingerprinting without leakage.
- Conflicting rules → `audit-policy-conflict` (severity `warn`;
  strict `error`); the *more aggressive* rule wins
  (`drop > hash > mask`).

#### Files

- `xmlui/src/components-core/audit/policy.ts`
- `xmlui/src/components-core/audit/redactor.ts`
- The `<App>` component renderer (parses `<auditPolicy>`)

#### Tests

- `audit/redactor.test.ts`:
  - Wildcard selector `event.payload.*Email` masks two fields.
  - Conflicting rules at the same path resolve per the
    aggressive-wins rule.

#### Acceptance

- Apps can declare app-wide redaction in markup without code.

#### Dependencies

Step 2.1.

---

### Step 2.3 — `audit-redaction-missing` diagnostic + strict block

**Priority:** 6

#### Scope

- A trace entry that contains a value matching a *content-based*
  PII heuristic (default heuristics: regex for credit-card
  numbers, US/UK phone numbers, email addresses, JWT tokens) and
  is *not* covered by any redaction rule fires
  `audit-redaction-missing` (severity `warn`; strict `error`).
- Under strict mode, the entry is **dropped** rather than
  exported, and an `audit-pii-leaked` follow-up entry records
  the heuristic that fired (without the offending value).
- Heuristics are extensible via `<auditPolicy heuristics="…">`
  referencing named built-ins; apps can register custom
  heuristics through `App.registerAuditHeuristic(name, regex)`.

#### Files

- `xmlui/src/components-core/audit/redactor.ts`
- `xmlui/src/components-core/audit/heuristics.ts` (new)

#### Tests

- An entry containing an unredacted credit-card number fires
  `audit-redaction-missing`; under strict, the entry is dropped
  and `audit-pii-leaked` is recorded.

#### Acceptance

- Apps cannot accidentally ship to production with a wide-open
  audit pipeline; strict mode forces an explicit policy decision.

#### Dependencies

Steps 2.1 and 2.2.

---

## Phase 3 — Sampling, Retention, Search

### Step 3.1 — Head-based + tail-based sampling

**Priority:** 7

#### Scope

- `<sample>` element under `<auditPolicy>`:

  ```xmlui
  <auditPolicy>
    <sample head="0.1" />                                <!-- 10% of traces -->
    <sample tailKeepIfErrorIn="error, app:fetch" />      <!-- always keep traces with errors -->
  </auditPolicy>
  ```

- Head sampling decides at `traceId` creation time; all entries
  for an unsampled trace are dropped.
- Tail sampling buffers per-trace entries and flushes on either
  trace completion (`span:end` of the root span) or on a kept
  kind appearing — at that point the entire buffered trace is
  exported.
- Default: 100% head, no tail rule (today's behaviour).

#### Files

- `xmlui/src/components-core/audit/sampler.ts`

#### Tests

- 10% head sampling produces ~10% of traces in the sink.
- Tail rule with `error` keeps a trace that would have been
  head-dropped if it produces an error.

#### Acceptance

- Sampling is a pure data-flow decision; no other module needs
  changes.

#### Dependencies

Step 1.1.

---

### Step 3.2 — Retention buffer policy

**Priority:** 8

#### Scope

- `<retention>` element configures the in-browser circular
  buffer (today fixed-size, drop-oldest):

  ```xmlui
  <retention bufferSize="5000" onOverflow="drop-oldest" />
  ```

- New mode `onOverflow="block"` pauses *log production* (caller
  is told via `pushXsLog` returning `false`) until the sink
  drains — used for tests, almost never in production.
- Buffer overflow under `drop-*` modes fires
  `audit-buffer-overflow` (severity `warn`; strict `warn` —
  same; this is data-loss telemetry, not a programming bug).

#### Files

- `xmlui/src/components-core/inspector/inspectorUtils.ts` (the
  buffer)
- `xmlui/src/components-core/audit/policy.ts`

#### Tests

- Filling the buffer produces `audit-buffer-overflow` once per
  threshold cross.

#### Acceptance

- App can size the buffer for its load profile.

#### Dependencies

Step 0.

---

### Step 3.3 — Inspector search index

**Priority:** 9

#### Scope

- Inspector overlay gains a search box: free-text matches
  `message`, `kind`, `code`, `traceId`, `spanId`, and any
  redacted-safe attribute value.
- The index is a simple in-memory tokeniser over the buffered
  entries; it scales to the buffer size (5–50k entries) with
  no observable latency.
- Filter pills for `kind` and `severity` (today's overlay has
  none).

#### Files

- The inspector UI (under
  [`xmlui/src/components-core/inspector/`](../../src/components-core/inspector/))

#### Tests

- E2E: typing `traceId:abc123` filters the overlay to that
  trace.

#### Acceptance

- The Inspector becomes useful as a developer audit tool, not
  just a live tail.

#### Dependencies

Step 1.1; Step 3.2.

---

## Phase 4 — Server Sink (OTLP Exporter)

### Step 4.1 — `<sink kind="otlp">` + buffered batch export

**Priority:** 10

#### Scope

- `<sink>` element under `<auditPolicy>`:

  ```xmlui
  <auditPolicy>
    <sink kind="otlp"
          endpoint="https://otel.example.com/v1/logs"
          headers="{ Authorization: 'Bearer ' + App.environment.OTEL_TOKEN }" />
  </auditPolicy>
  ```

- Entries are batched in 1-second windows (configurable via
  `flushIntervalMs`) and posted as OTLP/JSON `LogsData`.
- `XsLogEntry.kind` maps to OTLP `attributes["xmlui.kind"]`;
  `severity` maps to OTLP `severityNumber`; `traceId` /
  `spanId` map to top-level OTLP fields.
- Network failure → exponential back-off (1s → 30s cap) with
  `audit-sink-failure` (severity `warn`).
- On `beforeunload`, a synchronous `navigator.sendBeacon` flush
  attempts to drain the queue.
- Custom sinks via
  `App.registerAuditSink(name, factory)` for
  enterprise-specific transports.

#### Files

- `xmlui/src/components-core/audit/sink.ts`
- `xmlui/src/components-core/audit/otlp.ts` (new)

#### Tests

- OTLP fixture receiver
  (`xmlui/tests/fixtures/otlp-receiver/server.ts`) records
  posted batches; integration test asserts payload shape.
- Network failure + recovery preserves at-most-once + at-least-
  once semantics depending on `<sink delivery="at-most-once" |
  "at-least-once">`.

#### Acceptance

- An app configured with a real OTLP collector (Jaeger, Grafana
  Tempo, Honeycomb) shows traces end-to-end.

#### Dependencies

Steps 1.1, 2.1, 3.1, 3.2.

---

### Step 4.2 — `<sink kind="console">` + zero-config dev mode

**Priority:** 11

#### Scope

- `<sink kind="console">` (the default in dev) prints structured
  trace lines to `console.log` with collapsible groups per
  trace.
- `App.appGlobals.devMode` (existing) auto-enables this when no
  `<sink>` is declared and `App.environment.NODE_ENV !==
  "production"`.

#### Files

- `xmlui/src/components-core/audit/sink.ts`

#### Tests

- Dev-mode app produces grouped console output.

#### Acceptance

- Developers see correlated traces in the browser DevTools
  console without configuration.

#### Dependencies

Step 1.1.

---

## Phase 5 — Documentation & Strict Default

### Step 5.1 — Audit-Logging Chapter

**Priority:** 12

#### Scope

- New `xmlui/dev-docs/guide/38-audit-logging.md` chapter.
- Updates
  [`inspector-debugging.md`](../../../.ai/xmlui/inspector-debugging.md)
  with the redaction policy, sinks, sampling, and correlation
  surfaces.
- Updates [`managed-react.md` §15](./managed-react.md):
  - Mark *"Browser-only"* as resolved (Phase 4 OTLP exporter).
  - Mark *"No PII redaction"* as resolved (Phase 2 redactor +
    metadata defaults).
  - Mark *"No sampling, no retention"* as resolved (Phase 3).
  - Mark *"No correlation IDs"* as resolved (Phase 1).
- Updates the §17 scorecard row from
  *"Browser only, unredacted"* to
  *"Sealed — OTLP exporter, declarative redaction, sampling,
  trace-context correlation."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/38-audit-logging.md` (new)
- `.ai/xmlui/inspector-debugging.md`
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter contains a worked example for each phase: correlated
  click→fetch→toast trace, redaction policy with three modes,
  10% head + tail-keep-on-error sampling, OTLP sink against a
  Tempo / Jaeger backend.

#### Dependencies

Phases 1–4.

---

### Step 5.2 — Default `strictAuditLogging: true` in Next Major

**Priority:** 13 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip
  the default in the next major: `strictAuditLogging: true`.
- Effects under strict:
  - `audit-redaction-missing` becomes hard error (entry dropped
    + `audit-pii-leaked` recorded).
  - `audit-policy-conflict` becomes hard error.
  - The default `traceparent` scope stays `"same-origin"`.
- Changeset + migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-audit-logging-default.md`
- `xmlui/dev-docs/guide/38-audit-logging.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/audit/strict-mode.spec.ts` covers each
  diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  audit logging.

#### Dependencies

Step 5.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + audit module skeleton | Next minor |
| **Correlation** | 1.1, 1.2, 1.3 | `traceId`/`spanId`; `traceparent` injection; missing-correlation diag | Next minor + 1 |
| **Redaction** | 2.1, 2.2, 2.3 | Component metadata; `<auditPolicy>`; PII heuristics | Next minor + 2 |
| **Sampling/retention/search** | 3.1, 3.2, 3.3 | Head + tail sampling; buffer policy; inspector search | Next minor + 2 |
| **Sinks** | 4.1, 4.2 | OTLP exporter; console sink | Next minor + 3 |
| **Docs + strict default** | 5.1, 5.2 | Guide chapter; strict default in next major | Next major |

Each step is independently shippable: correlation can land
without sinks; redaction can land without OTLP; OTLP sink can
land without strict-mode block.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (traceId/spanId)
   │      │
   │      ├─> Step 1.2 (traceparent header)
   │      ├─> Step 1.3 (correlation-missing diag)
   │      ├─> Step 3.1 (sampling)
   │      ├─> Step 3.3 (inspector search)
   │      └─> Step 4.2 (console sink)
   │
   ├─> Step 2.1 (component metadata audit flag)   ← verified-type-contracts (PropertyDef)
   │      │
   │      └─> Step 2.2 (<auditPolicy> markup)
   │             │
   │             └─> Step 2.3 (PII heuristics + strict block)
   │
   ├─> Step 3.2 (retention buffer policy)
   │
   └─> Step 4.1 (OTLP sink)                       ← needs 1.1, 2.1, 3.1, 3.2
            │
            └─> Step 5.1 (docs)
                   │
                   └─> Step 5.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **One trace substrate, not two.** The audit pipeline extends
   `pushXsLog`; it does not introduce a parallel logger. Every
   existing `XsLogEntry.kind` (sandbox, log, app, clipboard,
   navigate, ws, eventsource, theming, forms, i18n, versioning,
   build, udc, accessibility, lifecycle, concurrency, error)
   automatically participates. Alternative considered: separate
   `App.audit.*` API — rejected because it would split the
   surface in two and require every component author to log
   twice.

2. **OTLP/JSON, not protobuf.** The browser-side exporter
   stays dependency-light; protobuf would require either a
   wasm parser or a 200KB+ JS dep. Alternative considered:
   shipping protobuf as opt-in — rejected for v1 because most
   OTel collectors accept JSON; protobuf can be a follow-up.

3. **Redaction is *defence in depth*: metadata defaults +
   declarative policy + content heuristics.** Three layers
   compose; each layer alone is insufficient. Alternative
   considered: heuristics-only — rejected because false
   negatives leak; metadata-only — rejected because it cannot
   cover dynamic payloads.

4. **Aggressive-wins on conflicting redaction rules.** When two
   rules apply to the same path, the more aggressive mode
   (`drop > hash > mask`) wins, with `audit-policy-conflict`
   recorded. Alternative considered: most-specific-wins —
   rejected because it would let an over-broad `mask` rule
   silently downgrade a `drop` rule.

5. **`traceparent` defaults to same-origin only.** Privacy by
   default — third-party origins should not receive the app's
   trace ids. Apps that want cross-origin correlation opt in
   explicitly. Alternative considered: emit to all origins —
   rejected because this leaks app structure to embedded
   third-party services.

6. **Tail sampling is per-trace, not per-entry.** Tail rules
   keep or drop *entire* traces (so the kept context for an
   error is intact). This requires per-trace buffering until
   the root span closes. Alternative considered: per-entry tail
   sampling — rejected because it produces orphaned entries
   without context.

7. **Buffer overflow is `warn`, not `error`, even under
   strict.** Data loss is operational telemetry, not a
   programming bug; teams set buffer size based on load and
   should not see hard failures from a misconfigured buffer.
   Alternative considered: error under strict — rejected.

8. **Strict mode drops entries on PII heuristic match, does
   not throw.** Throwing in the audit pipeline could break
   user code that ran cleanly with default-mode redaction.
   Alternative considered: throw `AuditPiiError` — rejected
   because the audit pipeline must never break user code paths.

9. **At-most-once delivery is the default; at-least-once is
   opt-in.** Browser sinks lose data on tab close; trying to
   guarantee at-least-once requires `IndexedDB` persistence
   that this plan does not commit to in v1. Alternative
   considered: at-least-once default — rejected because the
   storage cost is too high without an opt-in.

10. **Custom sinks register through `App.registerAuditSink`,
    not as components.** Sinks are pure data adapters; making
    them components would imply a render lifecycle they don't
    need. Alternative considered: `<CustomSink>` markup —
    rejected.

11. **Strict-mode flip waits for a major.** Same rationale as
    every other §17 plan — warn-mode telemetry is needed
    before failing on `audit-redaction-missing` and the long
    tail of metadata gaps in third-party components.

---

## Out of Scope

- **`IndexedDB`-backed durable buffer.** At-least-once across
  tab crashes requires persistent storage; deferred to a
  follow-up plan.
- **Server-side log collector / dashboard.** This plan ships
  the *exporter*; the receiver is whatever OTel-compatible
  backend the app already runs (Tempo, Jaeger, Honeycomb,
  Datadog, …).
- **Encryption at rest in the buffer.** The browser memory is
  not a secure store; sensitive values should be redacted
  *before* hitting the buffer (Phase 2). Encrypting the buffer
  itself does not change the threat model.
- **Real User Monitoring (RUM) metrics** — Web Vitals,
  long-task observers, navigation timing. RUM is a separate
  observability pillar from audit logging; covered by a future
  plan that may layer on this trace substrate.
- **Distributed tracing across micro-frontends.** A single
  XMLUI app is one trace context; multi-app federation is a
  separate concern.
- **GDPR consent flows** for telemetry. Apps that need consent
  must gate `<auditPolicy sink>` behind their consent
  component; this plan provides the mechanism, not the policy.
- **Auto-fix codemods** for adding `audit` metadata to
  third-party components. Authors annotate manually; the
  `audit-redaction-missing` heuristic catches what they miss.
- **PCI / HIPAA / SOC 2 certification.** This plan ships
  building blocks (redaction, sampling, retention,
  correlation) that compliance programs require but does not
  itself confer compliance.
