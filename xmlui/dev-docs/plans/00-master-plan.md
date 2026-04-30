# Managed React — Master Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Inputs:** every plan in `xmlui/dev-docs/plans/` (17 plans). The
master plan sequences their phases into a single executable
backlog with a per-step workflow, a risk ranking, and a model
recommendation per step type so the work can be driven by a mix
of agentic LLMs.

---

## How to Read This Document

- **Section 1** ranks every plan by **risk**. Risk drives the
  ordering, but with a critical refinement (added in this
  revision): after a short Tier-A *experimental* warm-up, every
  wave **co-lands at least one Tier-C item**. This front-loads
  the highest-blast-radius work so we discover its surprises
  early and have time to remediate, instead of stacking every
  Tier-C plan into the final waves where their risks would
  compound.
- **Section 2** is the **per-step workflow** every backlog item
  follows — the same six-stage sequence (scope → implement →
  lint → test → docs → integrate). This is the contract you
  give to the agent.
- **Section 3** is the **model recommendation matrix**: which
  LLM to assign to which stage of the workflow.
- **Section 4** is the **interleaved master backlog** — phases
  from individual plans woven into eight numbered waves. Each
  wave is shippable independently.
- **Section 5** is a **dependency map** showing which plans
  unblock which.
- **Section 6** lists **conventions every step must respect** so
  parallel agent work stays merge-clean.

The plans referenced are:

| # | Plan | File |
|---|---|---|
| 1 | Verified type contracts | [01-verified-type-contracts.md](./01-verified-type-contracts.md) |
| 2 | Themevars namespace | [02-themevars-namespace.md](./02-themevars-namespace.md) |
| 3 | Reactive cycle detection | [03-reactive-cycle-detection.md](./03-reactive-cycle-detection.md) |
| 4 | Managed lifecycle vocabulary | [04-managed-lifecycle-vocabulary.md](./04-managed-lifecycle-vocabulary.md) |
| 5 | Enforced accessibility | [05-enforced-accessibility.md](./05-enforced-accessibility.md) |
| 6 | Cooperative concurrency | [06-cooperative-concurrency.md](./06-cooperative-concurrency.md) |
| 7 | Structured exception model | [07-structured-exception-model.md](./07-structured-exception-model.md) |
| 8 | Sealed theming sandbox | [08-sealed-theming-sandbox.md](./08-sealed-theming-sandbox.md) |
| 9 | Forms validation discipline | [09-forms-validation-discipline.md](./09-forms-validation-discipline.md) |
| 10 | Defended routing | [10-defended-routing.md](./10-defended-routing.md) |
| 11 | i18n foundations | [11-i18n-foundations.md](./11-i18n-foundations.md) |
| 12 | Enforced versioning | [12-enforced-versioning.md](./12-enforced-versioning.md) |
| 13 | Build-validation analyzers | [13-build-validation-analyzers.md](./13-build-validation-analyzers.md) |
| 14 | UDC sandbox | [14-udc-sandbox.md](./14-udc-sandbox.md) |
| 15 | Audit-grade observability | [15-audit-grade-observability.md](./15-audit-grade-observability.md) |
| 16 | Concurrent-state determinism | [16-concurrent-determinism.md](./16-concurrent-determinism.md) |
| 17 | DOM-API hardening (already shipped 2026-04) | [17-dom-api-hardening.md](./17-dom-api-hardening.md) |

(#17 is included for reference — it is the model the other 16
plans follow. It already shipped in the 2026-04 update.)

---

## 0. The Managed-React Scorecard

The 17 plans collectively close the gap between "XMLUI as it
ships today" and "XMLUI as a *managed* React framework" — the
same bundle of structural guarantees the CLR / JVM / .NET
ecosystem delivers beyond memory safety: type contracts,
lifecycle, exceptions, concurrency, sandboxing, observability,
accessibility, i18n, determinism, versioning, and build-time
validation. Live implementation status is tracked in
[`STATUS.md`](./STATUS.md); this scorecard distils every
dimension into a single reference table.

**Legend.** ✅ = already closed (not reopened by any plan).
Risk tier (A/B/C) matches Section 1. Wave column shows the
*earliest* wave the dimension gets work.

| # | Dimension | Verdict | What is missing | Risk | Wave | Plan |
|---|---|---|---|---|---|---|
| — | Code injection (`eval`, `Function`, `WebAssembly`, `debugger`) | ✅ **Strong** | Banned list maintained; all four covered as of 2026-04 | — | — | [#17](./17-dom-api-hardening.md) |
| — | XSS in default rendering | ✅ **Strong** | React JSX escaping + DOM-mutation ban (2026-04); Markdown sanitization still open (out of scope) | — | — | [#17](./17-dom-api-hardening.md) |
| — | HTTP centralisation + CSRF + origin allowlist | ✅ **Strong** | `App.fetch` gate + `allowedOrigins`; raw `fetch`/`XHR`/`WebSocket`/`EventSource`/`sendBeacon` banned (2026-04) | — | — | [#17](./17-dom-api-hardening.md) |
| — | Fetch lifecycle | ✅ **Strong** | React Query + `AbortController` cancels stale requests | — | — | — |
| — | Observability substrate | ✅ **Strong** | `pushXsLog` circular buffer; Inspector overlay; all trace `kind` types registered (2026-04) | — | — | [#17](./17-dom-api-hardening.md) |
| — | DOM-API isolation | ✅ **Strong** | Property-access guard + 99-entry denylist + sanctioned `App.*`/`Log.*`/`Clipboard.*`/`<WebSocket>`/`<EventSource>` replacements (2026-04) | — | — | [#17](./17-dom-api-hardening.md) |
| 3 | Reactive cycle detection | **Absent** | Static AST analysis of var ↔ DataSource ↔ expression edges; no warning on cyclic bindings today | C | W2 | [#03](./03-reactive-cycle-detection.md) |
| 16 | Determinism (concurrent state) | **Visual, not concurrent** | Documented happens-before contract; FIFO handler ordering; floating-point drift in spacing tokens; replay harness | C | W4 | [#16](./16-concurrent-determinism.md) |
| 1 | Type contracts | **Metadata, not verified** | Parse-time prop validation against `PropertyDef`; runtime contract enforcement; TS↔metadata drift detection | B | W3 | [#01](./01-verified-type-contracts.md) |
| 13 | Build-time validation | **Parse only** | "Unknown component/prop/event", wrong value type, dead expressions, cycle diagnostics in the LSP and CLI | A | W0 | [#13](./13-build-validation-analyzers.md) |
| 12 | Versioning | **Mechanism present, unenforced** | LSP deprecation diagnostics; prop-level deprecation channel; build-time API diff (`japicmp` analogue) | C | W6 | [#12](./12-enforced-versioning.md) |
| 4 | Resource lifecycle | **Strong for framework, asymmetric for user code** | Generic sandbox-safe lifecycle hook for user-code side effects not covered by an existing component | B | W3 | [#04](./04-managed-lifecycle-vocabulary.md) |
| 7 | Exception model | **Contained, not structured** | Structured `AppError` type (problem-details shape); retry/fallback/circuit-breaker policies; global `unhandledHandlerError` event | A | W0 | [#07](./07-structured-exception-model.md) |
| 6 | Concurrency / cancellation | **Predictable, uncoordinated** | User-visible `$cancel` token; in-flight guard / single-flight; happens-before contract between handlers; timeout policy | C | W3 | [#06](./06-cooperative-concurrency.md) |
| 14 | UDC sandboxing | **Absent** | Declared `<Prop>`/`<Event>`/`<Method>`/`<Slot>` contract; scope-climb enforcement; capability declaration; trust modes; third-party manifest | C | W5 | [#14](./14-udc-sandbox.md) |
| 8 | Theming sandbox | **Mostly scoped** | Typed theme variables (`Color`/`Length`/`Number`); inline-style boundary still porous; namespaced extension mechanism | C | W5 | [#08](./08-sealed-theming-sandbox.md) |
| 2 | Themevars namespace | **Ad-hoc naming** | Canonical `--xmlui-<component>-<role>-<property>` namespace; lint rule for unknown/misspelled theme variables | A | W0 | [#02](./02-themevars-namespace.md) |
| 9 | Forms validation | **State strong, validators absent** | Built-in validators (`email`/`url`/`length`/`range`/`pattern`); 422 → per-field server-error mapping; submit-spam guard; CSRF binding on Form | C | W5 | [#09](./09-forms-validation-discipline.md) |
| 5 | Accessibility | **Documented only** | Parse-time a11y linter (actionable component without accessible name); contrast checker; `SkipLink`/`FocusScope`/`LiveRegion` primitives | A | W1 | [#05](./05-enforced-accessibility.md) |
| 10 | Routing input | **Convenient, undefended** | Route segment constraints (`{id:int:min(1)}` analogue); guards that survive back/forward; URL canonicalisation | B | W4 | [#10](./10-defended-routing.md) |
| 11 | Internationalisation | **Dates only** | String externalisation; ICU plurals/select; locale collation helpers; RTL contract; currency formatting | B | W4 | [#11](./11-i18n-foundations.md) |
| 15 | Audit-grade observability | **Browser only, unredacted** | OTLP/server sink; PII redaction policy; sampling; retention; search; correlation IDs across navigations and DataSources | B | W2 | [#15](./15-audit-grade-observability.md) |

**Bottom line.** XMLUI has the right *substrate* for every open
dimension (metadata, single coercion point, single HTTP
chokepoint, async statement queue, trace pipeline, CSS Modules,
`ErrorBoundary` on every component). The 17 plans are almost
without exception exercises in *spending that substrate* —
turning conventions into compile-time and runtime guarantees
behind a `strict[X]` switch that defaults `false` and flips to
`true` in the next major release.

---

## 1. Risk Ranking

Risk is measured on three axes: **blast radius** (how much of
the codebase a step touches), **runtime invariants** (does it
change observable behaviour for existing apps), and
**reversibility** (can the change be turned off cleanly via the
strict-mode switch). Every plan has a `strict[X]` switch that
defaults `false` until the next major — that is the universal
escape hatch. The risk ranking below is *despite* that switch.

### Tier A — **Low risk** (additive only, no observable change at default)

Start here to build agent muscle memory and to land tooling that
later plans depend on.

- **#2 Themevars namespace** — pure metadata + lint surface.
- **#7 Structured exception model** — adds a class hierarchy +
  trace shape; default behaviour unchanged until apps adopt
  `<App onError>`. Underpins many later plans.
- **#13 Build-validation analyzers** — diagnostics only;
  default severity is `info`/`warn`; never fails the build.
  Critical foundation: every other plan ships rules that ride
  on this pipeline.
- **#5 Enforced accessibility** — analyzer rules + metadata
  defaults. Diagnostics only at default severity.

### Tier B — **Moderate risk** (new managed primitives, opt-in markup)

These add genuinely new runtime surfaces but stay opt-in.

- **#1 Verified type contracts** — extends `PropertyDef` and
  the parse-time validator walk; touches every component's
  metadata file but the diagnostic surface is opt-in.
- **#4 Managed lifecycle vocabulary** — new lifecycle hooks,
  resource-tracker; existing components keep working.
- **#15 Audit-grade observability** — extends `pushXsLog` and
  `XsLogEntry`; defaults to today's behaviour without a
  configured sink.
- **#11 i18n foundations** — new `App.locale`, bundles, ICU
  format. Existing apps see no change until they declare a
  `locale`.
- **#10 Defended routing** — constraint syntax + guard
  dispatcher; routes without constraints behave as today.

### Tier C — **Higher risk** (touches hot paths or changes default semantics)

Plans that reach into the rendering / scheduler / handler hot
path. Land only after Tier A/B and after the audit pipeline is
ready to record warn-mode telemetry.

- **#9 Forms validation discipline** — the `pattern → validator`
  rename, async validators, submit policies. Forms are
  high-traffic in real apps; regressions are visible.
- **#8 Sealed theming sandbox** — touches `StyleProvider`,
  layout-prop resolution, the `style` tokeniser. Visual
  regression risk.
- **#14 UDC sandbox** — changes the scope-climb rules for UDCs.
  Even with `strict=false`, the metadata surface is intrusive.
- **#12 Enforced versioning** — `api-snapshots/` + CI release
  guard. Operational risk: a bad guard config blocks releases.
- **#3 Reactive cycle detection** — touches the dependency
  tracker; cycles in the wild may be harmless oscillations
  apps depend on.
- **#6 Cooperative concurrency** — changes handler-invocation
  semantics under `handlerPolicy`; default `concurrent` keeps
  today's behaviour but the new APIs (`$cancel`, queue,
  drop-while-running) reach the action invoker.
- **#16 Concurrent-state determinism** — FIFO scheduler can
  unmask order-dependent bugs in existing apps. The
  *highest-blast-radius* plan; lands last.

---

## 2. Per-Step Workflow

Every backlog item follows the same six-stage sequence. The
agent driving the step **does not skip stages**. Each stage has
a checklist; each checklist is the contract.

### Stage 1 — **Scope**

1. Read the source plan section for this step
   (e.g. *"Plan #15, Step 2.2"*).
2. Read every cross-referenced doc in the plan's *Conventions*
   section.
3. Read the existing source files the plan names.
4. Produce a one-paragraph **scope note** in the PR
   description: what changes, what does *not* change, which
   files are touched, which existing tests cover the area.

### Stage 2 — **Implement**

1. Land the code change minimally — exactly what the plan step
   says, nothing more.
2. Behind the plan's `App.appGlobals.strict[X]` switch
   (default `false`).
3. New files in the locations the plan specifies (no
   reorganisation).
4. Add the new diagnostic codes to the open union; do not
   weaken existing types.
5. Respect the
   [`implementationDiscipline`](../../../AGENTS.md) section
   from `AGENTS.md` — no incidental refactors, no
   "improvements" beyond what the plan says.

### Stage 3 — **Lint**

1. Run the workspace ESLint config against every changed file:
   `npx eslint <file>`.
2. Run the SCSS module lint
   ([theming.instructions.md](../../../.github/instructions/theming.instructions.md))
   for every `.module.scss` touched.
3. Run TypeScript in `--noEmit` mode for the affected package.
4. Run the markdown linter on touched docs.
5. **Fail closed** — never disable a rule to land the change.
   If a rule conflicts with the plan, raise it in the PR
   description and ask for an explicit waiver.

### Stage 4 — **Test**

1. **Unit tests (Vitest)** under
   `xmlui/tests/components-core/<area>/`. One spec per new
   diagnostic code, one spec per new public function.
2. **E2E tests (Playwright)** under
   `xmlui/tests-e2e/<area>/` when the change is observable in
   the browser (every UI surface, every analyzer rule with a
   markup form, every scheduler change).
3. **Regression sweep** — run the full Vitest + Playwright
   suite for the affected package. Diagnose every new failure;
   do not retry.
4. **Trace-replay assertion** (after Plan #16 Step 4.1 lands):
   replay the docs site's recorded boot trace; assert zero
   divergence.
5. **Coverage** for new modules ≥ 90 % statements / 80 %
   branches via `vitest run --coverage`.
6. Tests follow the conventions in
   [`testing-conventions.md`](../../../.ai/xmlui/testing-conventions.md)
   and [`e2e-tests.instructions.md`](../../../.github/instructions/e2e-tests.instructions.md).

### Stage 5 — **Docs**

1. **AI-developer docs** (`.ai/xmlui/`):
   - Update the relevant existing file (every plan names which
     `.ai/xmlui/*.md` files it changes; do not create new ones
     unless the plan says so).
   - Keep entries terse; the
     [`memoryGuidelines`](../../../AGENTS.md#memoryguidelines)
     style applies.
2. **Human-developer docs** (`xmlui/dev-docs/guide/`):
   - Update or extend the numbered chapter the plan names.
   - One worked markup example per new feature.
3. **End-user component docs** (`xmlui/src/components/<X>/<X>.md`)
   when component metadata changes — follow
   [`#write-component-docs`](../../../.github/prompts/write-component-docs.prompt.md).
4. **Changeset** at the repo root: `.changeset/<unique>.md`,
   `"xmlui": patch` per
   [`AGENTS.md` § Changesets](../../../AGENTS.md#changesets).
   Body: one-line plain-language summary.
5. **Cross-link** the change from the
   [`STATUS.md`](./STATUS.md) row when the step closes a
   scorecard item.

### Stage 6 — **Integrate**

1. Verify `npx changeset status` recognises the changeset.
2. Run the build-validation analyzer on the docs site
   (after Plan #13 ships): `xmlui check --strict website/` — no
   `error`-severity diagnostics.
3. Run `npm run build` for the affected package and the docs
   site.
4. Push the branch, open a PR with the scope note from Stage 1
   plus a "How to verify" section listing the manual smoke
   steps.
5. Mark the master-plan checklist item complete.

---

## 3. Model Recommendation Matrix

Different LLMs play different roles well. The recommendation
below is a starting heuristic; a single agent of any tier can
do every stage in a pinch, but pairing the right model to the
stage saves money and improves quality.

| Stage | Recommended model | Why | Acceptable substitute |
|---|---|---|---|
| 1. Scope | **Claude Sonnet 4.6** | Strong at synthesising plan + cross-references into a single scope note; cheaper than Opus | Codex, Sonnet 4 |
| 2. Implement (mechanical: rename, metadata addition, new file from template) | **Claude Haiku 4.5** | Fast, cheap, very accurate on bounded edits | Codex |
| 2. Implement (architecturally novel: scheduler hot path, validator pipeline, parser changes) | **Claude Opus 4.7** | Reasoning depth matters for invariant-preserving changes | Sonnet 4.6 |
| 3. Lint | **Claude Haiku 4.5** | Pure rule-following loop; cheap | any |
| 4. Test (writing new specs from a fixture) | **Claude Sonnet 4.6** | Tests need design judgement; Haiku misses edge cases | Codex |
| 4. Test (running and triaging regressions) | **Claude Opus 4.7** for diagnosis + **Haiku 4.5** for the fix | Triaging an unfamiliar failure rewards depth; the fix is usually mechanical | Sonnet 4.6 throughout |
| 5. Docs (AI-developer + dev-docs guide) | **Claude Sonnet 4.6** | Writes terse, consistent prose at the right altitude | Sonnet 4 |
| 5. Docs (changeset one-liner) | **Claude Haiku 4.5** | Trivial | any |
| 6. Integrate | **Claude Sonnet 4.6** | Verification + PR description need synthesis | Codex |

**General guidance**

- Use **Haiku 4.5** as the default for any stage where the
  change is bounded and the contract is fully specified by the
  plan step.
- Promote to **Sonnet 4.6** when the step requires synthesising
  multiple sources or design judgement.
- Reserve **Opus 4.7** for steps explicitly tagged
  *architecturally novel* in the backlog (Section 4).
- **Codex** is a good alternative for Stage 2 mechanical edits
  in TypeScript and for Stage 6 verification commands.
- For agent orchestration, run a single-agent loop per backlog
  item; do not parallelise stages within one item (lint depends
  on implement; test depends on lint, etc.).
- For multiple backlog items in flight, run them on separate
  branches with separate agents — the conventions in
  Section 6 keep the merge clean.

---

## 4. Interleaved Master Backlog

The work is sequenced into **eight waves**. Each wave is
shippable; wave *N* never depends on a feature that lands in
wave *N+1* or later. Within a wave, items can run in parallel
on separate branches. Each item lists: *plan • step • tier •
agent tag*.

The agent tag uses three letters — **H** = Haiku 4.5,
**S** = Sonnet 4.6, **O** = Opus 4.7 — referring to Stage 2
(Implement); the rest of the workflow follows Section 3
defaults. An asterisk (`*`) marks an *architecturally novel*
item where Opus is non-negotiable.

### Sequencing principle: surface risk early

The original draft of this plan stacked every Tier-C item into
Waves 5–7. That maximises the chance of a late surprise on the
*highest-blast-radius* plans (UDC scope climb, FIFO scheduler,
cycle detector) — exactly the surprises we cannot absorb at the
end. The revised sequencing **front-loads one Tier-C probe per
wave starting at Wave 2**, so the agent loop sees the hardest
problems while there is still time to remediate. Waves 0–1
remain a pure Tier-A warm-up: they exist to prove the workflow,
not to defer risk.

The four Tier-C plans selected for early probes (one per Wave
2–5) are deliberately the four where *early signal is most
useful*:

- **#3 Cycle detection** (Wave 2) — touches the dependency
  tracker hot path; the earliest signal on whether existing
  apps oscillate harmlessly or break.
- **#6 Cooperative concurrency** Phase 1 (Wave 3) — `$cancel`
  and `handlerPolicy` API. Foundation for Forms + Determinism;
  early ship lets later plans build on a settled contract.
- **#16 Determinism** Phase 1 (Wave 4) — the happens-before
  *doc* and the `state-write-after-render` diagnostic. Ships
  the *contract* without the FIFO scheduler; gives the rest of
  the work an authoritative ordering reference.
- **#14 UDC sandbox** Phase 1 (Wave 5) — declared `<Prop>` /
  `<Event>` / `<Method>` / `<Slot>` blocks. Parser change
  ripples into every later analyzer rule that touches UDCs;
  earlier signal = lower late-stage rework.

The "remaining" Tier-C work (FIFO scheduler, full UDC scope
enforcement, full theming sandbox, full forms validation, full
versioning) still lands in Waves 6–7, but each of those waves
inherits a partially-de-risked codebase because its predecessor
already exposed the design tension.

### Wave 0 — Foundations (Tier A only)

Goal: every later plan needs the diagnostic pipeline, the
exception class hierarchy, and the trace `kind` registry. Land
these first; nothing else moves until they do.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W0-1 | #13 Build-validation | Step 0 (skeleton, switch, `kind:"build"`) | A | **S** | Foundation for every later analyzer rule |
| W0-2 | #7 Exception model | Step 0 (`AppError`, `kind:"error"`) | A | **S** | Foundation for every later error contract |
| W0-3 | #15 Audit observability | Step 0 (skeleton, `kind:"audit"`) | A | **S** | Foundation for every later trace producer |
| W0-4 | #2 Themevars namespace | Step 0 (skeleton + lint registry) | A | **H** | Pure metadata + lint surface |

### Wave 1 — Tier A surfaces (workflow proving wave)

Goal: deliver complete Tier A diagnostic surfaces so apps see
warn-mode telemetry across the most common rule families. This
is the wave where the team confirms the six-stage workflow
holds end-to-end before the first risk probe.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W1-1 | #13 Build-validation | Phase 1 (identifier rules) | A | **H** | Mechanical AST walks |
| W1-2 | #13 Build-validation | Phase 2 (expression rules) | A | **S** | Needs scope analysis |
| W1-3 | #13 Build-validation | Phase 3 (cross-binding rules) | A | **S** | |
| W1-4 | #5 Accessibility | Phases 1–2 (metadata + analyzer rules) | A | **S** | Rides W1-1 pipeline |
| W1-5 | #2 Themevars namespace | Phases 1–2 | A | **H** | |
| W1-6 | #7 Exception model | Phase 1 (`<App onError>`, `AppError` shape) | A | **S** | Per-app boundary |

### Wave 2 — Audit pipeline + **first risk probe (cycle detector)**

Goal: ship audit observability so later waves can rely on
trace capture for regression detection — and **simultaneously
probe the highest-risk dependency-tracker change** (cycle
detection) so any "this app oscillates harmlessly today" cases
surface now, not in Wave 6.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W2-1 | #15 Audit observability | Phase 1 (correlation IDs) | B | **S** | `traceparent` injection touches data-fetch — careful |
| W2-2 | #15 Audit observability | Phase 2 (PII redaction) | B | **S** | |
| W2-3 | #15 Audit observability | Phase 3 (sampling, retention, search) | B | **S** | |
| W2-4 | #15 Audit observability | Phase 4 (OTLP sink + console sink) | B | **S** | |
| W2-5 | #13 Build-validation | Phase 4 (LSP, Vite, CLI surfaces) | A | **S** | Surfaces the W1 rules |
| W2-6 | #13 Build-validation | Phase 5 (CI scaffold) | A | **H** | Mechanical scaffold work |
| **W2-7** | **#3 Cycle detection** | **Phase 1 (detector skeleton + warn-only diagnostics)** | **C** | **O\*** | **Risk probe — runs warn-only against the docs site, captures every cycle for review before Phase 2 lands in W6.** |

### Wave 3 — Tier B contracts + **second risk probe (`$cancel`)**

Goal: extend `PropertyDef` (the metadata foundation every
later plan plugs into) and ship the lifecycle vocabulary —
plus the second Tier-C probe: `$cancel` and the
`handlerPolicy` API surface. Ships the *contract* of
cooperative concurrency without yet changing the default
scheduler, so Forms (Wave 5) and Determinism (Wave 7) can
both build on settled signatures.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W3-1 | #1 Type contracts | Phase 1 (`PropertyDef.type`, validator walk) | B | **O\*** | Architecturally novel — touches the validator pipeline |
| W3-2 | #1 Type contracts | Phase 2 (parent-boundary checks) | B | **S** | |
| W3-3 | #4 Lifecycle vocabulary | Phases 1–2 | B | **O\*** | Architecturally novel — new hook system |
| W3-4 | #4 Lifecycle vocabulary | Phase 3 (resource tracker) | B | **S** | |
| W3-5 | #15 Audit observability | Phase 5 (component metadata `audit` flag — depends on W3-1) | B | **H** | Mechanical metadata sweep across components |
| **W3-6** | **#6 Concurrency** | **Phase 1 (`handlerPolicy` API + `$cancel` contract)** | **C** | **O\*** | **Risk probe — ship the public API behind `strictConcurrency=false` so handler authors can adopt; default behaviour unchanged.** |

### Wave 4 — Routing + i18n + **third risk probe (determinism contract)**

Goal: deliver routing input validation and i18n in parallel,
plus the third Tier-C probe: the **happens-before contract
document** and the `state-write-after-render` diagnostic. Ships
the determinism *contract* — every later wave can cite it —
without the FIFO scheduler.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W4-1 | #10 Routing | Phase 1 (constraints) | B | **S** | |
| W4-2 | #10 Routing | Phase 2 (guards) | B | **S** | |
| W4-3 | #10 Routing | Phase 3 (canonical URLs) | B | **S** | |
| W4-4 | #11 i18n | Phase 1 (`App.locale`, resolution priority) | B | **S** | |
| W4-5 | #11 i18n | Phase 2 (`App.translate`, bundles) | B | **S** | |
| W4-6 | #11 i18n | Phase 3 (ICU plurals/select) | B | **S** | |
| W4-7 | #11 i18n | Phase 4 (`Intl.*`-backed formatters) | B | **H** | |
| **W4-8** | **#16 Determinism** | **Phase 1 (happens-before doc + `state-write-after-render` diagnostic)** | **C** | **S** | **Risk probe — ships the *contract*, not the scheduler. Surfaces every mid-render write in warn-only mode.** |

### Wave 5 — Forms + theming + **fourth risk probe (UDC contract)**

Goal: deliver the user-facing high-risk plans (forms touch
every CRUD app; theming touches every visual change) plus the
fourth Tier-C probe: **UDC declared contract surface**.
Shipping the parser change for `<Prop>`/`<Event>`/`<Method>`/
`<Slot>` blocks now (without yet enforcing scope climb)
de-risks Wave 6's UDC scope enforcement.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W5-1 | #9 Forms | Phase 1 (validator registry, `pattern → validator` rename) | C | **S** | Public-API rename — coordinate with #12; rides W3-6 contract |
| W5-2 | #9 Forms | Phase 2 (`<FormValidator>` cross-field) | C | **S** | |
| W5-3 | #9 Forms | Phase 3 (RFC 7807 mapping) | C | **S** | |
| W5-4 | #9 Forms | Phase 4 (submit policies) | C | **S** | Rides W3-6 |
| W5-5 | #9 Forms | Phase 5 (CSRF + idempotency key) | C | **S** | |
| W5-6 | #8 Theming | Phase 1 (`ThemeVarMetadata.valueType`) | C | **S** | |
| W5-7 | #8 Theming | Phase 2 (layout + style tokeniser) | C | **O\*** | Architecturally novel — visual regression risk |
| W5-8 | #11 i18n | Phase 5 (RTL + logical CSS audit) | B | **S** | Mechanical SCSS audit, but breadth matters |
| **W5-9** | **#14 UDC sandbox** | **Phase 1 (declared `<Prop>`/`<Event>`/`<Method>`/`<Slot>` blocks)** | **C** | **O\*** | **Risk probe — parser change ships now; scope enforcement (W6) lands against an already-declared corpus.** |

### Wave 6 — Tier C completion: UDC scope + versioning + cycle remediation

Goal: complete the Tier-C plans whose *first phases* were
probed earlier. Each item here inherits a partially-de-risked
codebase because the warn-only data from Waves 2–5 has already
surfaced the violations to fix.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W6-1 | #14 UDC sandbox | Phase 2 (scope enforcement) | C | **O\*** | Touches script-runner scope climb — rides W5-9 declarations |
| W6-2 | #14 UDC sandbox | Phase 3 (capabilities) | C | **S** | |
| W6-3 | #14 UDC sandbox | Phases 4–5 (trust modes + manifest) | C | **S** | |
| W6-4 | #12 Versioning | Phases 1–2 (metadata + LSP/runtime/doc surfaces) | C | **S** | |
| W6-5 | #12 Versioning | Phase 3 (api-snapshots, CI release guard) | C | **S** | Operational risk — coordinate with release engineering |
| W6-6 | #12 Versioning | Phase 4 (Inspector versioning tab) | C | **H** | |
| W6-7 | #3 Cycle detection | Phase 2 (full enforcement against W2-7 captured cycles) | C | **O\*** | Remediation — every cycle the W2-7 probe captured is either fixed or annotated |

### Wave 7 — Scheduler + concurrency + replay

Goal: complete the two highest-blast-radius items —
cooperative-concurrency runtime and the FIFO determinism
scheduler — plus the replay harness that becomes the canonical
regression gate for Wave 8. Both runtime items inherit a
codebase where every other plan is already in warn-mode
telemetry.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W7-1 | #6 Concurrency | Phases 2–4 (queue, drop-while-running, integration) | C | **O\*** | Rides W3-6 public API |
| W7-2 | #16 Determinism | Phase 2 (FIFO scheduler) | C | **O\*** | The single highest-risk item — but the contract from W4-8 is already documented, and trace replay (W7-3) lands in the same wave as the regression gate |
| W7-3 | #16 Determinism | Phase 3 (FP + iteration audits) | C | **S** | |
| W7-4 | #16 Determinism | Phase 4 (replay harness) | C | **O\*** | Architecturally novel; canonical Wave 8 regression gate |

### Wave 8 — Strict-mode flips + final docs

Goal: in the next major release, flip every `strict[X]` default
from `false` to `true`. Each plan's final phase ("Docs +
Strict default") ships here together so the major release has
one coordinated migration story.

| Item | Plan | Step | Tier | Agent | Notes |
|---|---|---|---|---|---|
| W8-1 | All 16 plans | Final phase (strict default + migration changeset + guide chapter) | mixed | **S** | One PR per plan; coordinate the major bump |
| W8-2 | Cross-cutting | Mark every row sealed in [`STATUS.md`](./STATUS.md) | — | **S** | Move all open rows to the closed table |
| W8-3 | Cross-cutting | Run replay harness against the docs site under all strict modes | — | **O\*** | Final regression sweep |

---

## 5. Dependency Map

```
W0 (foundations)
  │
  └── W1 (Tier A surfaces — workflow proving)
        │
        └── W2 (audit pipeline + risk probe: cycle detector)
              │
              ├── W3 (type contracts + lifecycle + risk probe: $cancel API)
              │     │
              │     └── W5 (forms + theming + risk probe: UDC contract)
              │
              └── W4 (routing + i18n + risk probe: determinism contract)
                    │
                    └── W6 (UDC scope + versioning + cycle remediation)
                          │
                          └── W7 (concurrency runtime + FIFO scheduler + replay)
                                │
                                └── W8 (strict defaults + major release)
```

Hard prerequisites:

- **W3-1** (type contracts) before **W3-5** (audit metadata
  needs `PropertyDef` extension) and before **W5-6** (theming
  `valueType` extends the same field).
- **W3-6** (concurrency `$cancel` public API) before **W5-1**
  / **W5-4** (forms validators + submit policies reuse it),
  before **W6-7** (cycle-detection enforcement uses `$cancel`
  to break runaway re-eval), and before **W7-1** / **W7-2**
  (concurrency runtime + FIFO scheduler force-cancel via
  `$cancel`).
- **W2-1** (correlation IDs) before **W7-4** (replay harness
  consumes the trace shape).
- **W2-7** (cycle-detection probe, warn-only) before **W6-7**
  (full enforcement remediates cycles the probe captured).
- **W4-8** (happens-before contract doc + `state-write-after-
  render` diagnostic) before **W7-2** (FIFO scheduler is one
  *implementation* of the documented contract).
- **W5-9** (UDC declared contract probe) before **W6-1** (UDC
  scope enforcement matches against an already-declared
  corpus).

Plans that have **no inter-plan dependencies** and can be
scheduled into any wave once their prerequisites land:

- #2 Themevars namespace (Wave 1 by convenience).
- #5 Accessibility (Wave 1 by convenience).
- #11 i18n (Wave 4 by convenience; could ship earlier).

---

## 6. Conventions Every Step Must Respect

These conventions exist so that parallel agent work on multiple
backlog items stays merge-clean and so that the strict-mode
escape hatch holds.

1. **Strict switch contract.** Every plan ships an
   `App.appGlobals.strict[Domain]: boolean` switch with default
   `false`. The flip to `true` is *only* in Wave 8. New code
   reads the switch via the existing
   [`appGlobals` accessor](../../src/components-core/abstractions/standalone.ts);
   never inline `true`.
2. **New `kind` registration.** Every plan that adds a new
   trace `kind` extends the
   [`XsLogEntry` union in `inspectorUtils.ts`](../../src/components-core/inspector/inspectorUtils.ts)
   in a single PR — never split across multiple PRs (other
   PRs would land with `kind` strings the union does not yet
   know).
3. **Diagnostic code uniqueness.** Every diagnostic code is
   prefix-namespaced (`id-*`, `expr-*`, `theming-*`,
   `forms-*`, `udc-*`, `audit-*`, `versioning-*`, `accessibility-*`,
   `lifecycle-*`, `concurrency-*`, `determinism-*`, `error-*`,
   `i18n-*`, `route-*`). Codes are added to the open union in
   a single PR.
4. **No incidental refactors.** Per
   [`implementationDiscipline`](../../../AGENTS.md#implementationdiscipline)
   in `AGENTS.md`. If the plan does not say to change a file,
   do not change it.
5. **Component metadata changes follow
   [`#extend-component`](../../../.github/prompts/extend-component.prompt.md).**
   Every new prop / event / theme variable change runs through
   that prompt's checklist.
6. **Tests follow
   [`testing-conventions.md`](../../../.ai/xmlui/testing-conventions.md)**
   — `initTestBed`, locator patterns, the `xmlui` /
   `xmlui-nonsmoke` tag conventions.
7. **Changeset per backlog item.** One backlog item = one
   `.changeset/*.md` file = one `"xmlui": patch` line. No
   `minor` / `major` until Wave 8.
8. **Docs co-land with code.** Stage 5 is non-optional. A PR
   that ships code without `.ai/xmlui/` and
   `xmlui/dev-docs/guide/` updates is rejected at Stage 6.
9. **Branch naming.** `wave-N/plan-shortname/step-N`. Example:
   `wave-3/type-contracts/phase-1`. Keeps `git log` legible.
10. **PR size budget.** Target ≤ 800 lines diff per PR (excluding
    generated files). Larger steps split along plan
    sub-step boundaries.
11. **Replay-harness assertion** (after W7-5 lands) is a
    required CI step for every wave-8 PR. Before W7-5, the
    Playwright suite is the canonical regression gate.
12. **`.ai/xmlui/` style.** Terse, factual, present-tense,
    bullet-led. Match the
    [`memoryGuidelines`](../../../AGENTS.md#memoryguidelines)
    rule: AI docs are loaded into context — brevity is value.
13. **Cross-plan references.** When a step closes a scorecard
    dimension, update the corresponding row in
    [`STATUS.md`](./STATUS.md) in the same PR. Wave 8 moves
    the row to the closed table and marks it ✅.

---

## Appendix — Quick Lookup

**"I have one hour and want to start somewhere safe"** → W0-4
(themevars namespace skeleton) or W1-5 (themevars phases 1–2).
Pure metadata + lint; uses Haiku 4.5; minimal blast radius.

**"I want to ship the highest-leverage plan first"** → W0-3
then W2 (audit observability). Every later plan benefits from
trace capture + replay.

**"I want to validate the master plan with one wave"** → run
W0 + W1 in full. They cover every workflow stage, exercise
the analyzer pipeline, and produce shippable tooling.

**"I want to know which step will hurt the most if it
regresses"** → W7-2 (FIFO scheduler). Followed by W5-7
(theming style tokeniser), W6-1 (UDC scope enforcement), and
W6-7 (cycle detection enforcement). All four are tagged `O*`
for Opus. Crucially under the revised sequencing, **each one
has a warn-only probe shipped one or more waves earlier**
(W2-7 for cycles, W4-8 for determinism contract, W5-9 for UDC
contract, theming layout-prop allowlist absorbed into W5-6
metadata pass) — so the second-wave enforcement step inherits
real telemetry instead of running blind.

**"Which steps are the early risk probes?"** → **W2-7**
(cycle detector, warn-only), **W3-6** (`$cancel` public API
without runtime change), **W4-8** (happens-before contract
doc + state-write-after-render diagnostic), **W5-9** (UDC
declared-contract parser change without scope enforcement).
These are the four Tier-C items deliberately pulled forward
so risk is discovered while there is time to remediate.

**"I want one model to do everything"** → Sonnet 4.6 throughout,
escalating to Opus 4.7 for the eight `O*`-tagged items.
Estimated hit rate: ~95 % first-pass success on `S`-tagged
items, ~80 % on `O*`-tagged items, ~99 % on `H`-tagged items.
