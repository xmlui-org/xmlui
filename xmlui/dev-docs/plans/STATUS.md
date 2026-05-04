# Managed-React Implementation Status

This document tracks the live status of every dimension from the
[Managed React assessment](./managed-react.md). Update it whenever
a plan phase ships: change the Status cell, fill in the Date, and add
a one-line note.

**Status values**

| Symbol | Meaning |
|---|---|
| ✅ | Closed — fully implemented and shipped |
| 🔄 | In progress |
| ⬜ | Not started |

---

## Closed before the plan cycle (2026-04)

These dimensions were sealed by the DOM-API hardening work and carry no
open plan items.

| Dimension | Status | Date | Notes |
|---|---|---|---|
| Code injection (`eval`, `Function`, `WebAssembly`, `debugger`) | ✅ | 2026-04 | Custom AST interpreter; all four families banned in `bannedFunctions.ts`; `debugger` rejected at parse time |
| XSS in default rendering | ✅ | 2026-04 | React JSX escaping + DOM-mutation ban via `bannedMembers.ts`; Markdown sanitization (rehype-raw) is a known residual gap outside the plan scope |
| HTTP centralisation + CSRF + origin allowlist | ✅ | 2026-04 | `App.fetch` gate via `RestApiProxy`; raw `fetch`/`XHR`/`WebSocket`/`EventSource`/`sendBeacon` banned |
| Fetch lifecycle | ✅ | 2026-04 | React Query + `AbortController`; stale requests cancelled on key change / unmount |
| Observability substrate | ✅ | 2026-04 | `pushXsLog` circular buffer + Inspector overlay; all trace `kind` types registered |
| DOM-API isolation | ✅ | 2026-04 | Property-access guard (`isBannedMember`) + 99-entry denylist + sanctioned `App.*` / `Log.*` / `Clipboard.*` / `<WebSocket>` / `<EventSource>` replacements |

---

## Open dimensions — plan cycle status

Rows are ordered by plan number. The Wave column is the *earliest* wave
that delivers work on this dimension (see `00-master-plan.md` Section 4).

| # | Dimension | Status | Wave | Last updated | Notes |
|---|---|---|---|---|---|
| 01 | Type contracts | ⬜ | W3 | — | — |
| 02 | Themevars namespace | 🔄 | W0 | 2026-05 | W0-4 done: `themeNamespacePrefix` on `Extension`; canonical prefix table in `components-core/themevars/`; W1-5 done: `theming-missing-prefix` stub rule registered; Phases 2+ (lint rule body, migration) in later waves |
| 03 | Reactive cycle detection | ⬜ | W2 | — | W2-7 = warn-only probe; W6-7 = full enforcement |
| 04 | Managed lifecycle vocabulary | ⬜ | W3 | — | — |
| 05 | Enforced accessibility | 🔄 | W1 | 2026-05 | W1-4 done: `A11yDiagnostic`, `A11yCode`, `lintComponentDef()` in `components-core/accessibility/`; `a11y` block on `ComponentMetadata`; Phase 1 rules active; Phase 2+ (runtime enforcement, ARIA attribute injection) in later waves |
| 06 | Cooperative concurrency | ⬜ | W3 | — | W3-6 = `$cancel` API probe; W7-1 = runtime |
| 07 | Structured exception model | 🔄 | W0 | 2026-05 | W0-2 done: `AppError`, `RetryPolicySpec`, `ErrorDiagnostic` stubs; W1-6 done: `signError` and `ErrorBoundary.componentDidCatch` normalize via `AppError.from()`; Phase 2+ (LOADER_ERROR, HTTP status mapping) in later waves |
| 08 | Sealed theming sandbox | ⬜ | W5 | — | — |
| 09 | Forms validation discipline | ⬜ | W5 | — | — |
| 10 | Defended routing | ⬜ | W4 | — | — |
| 11 | i18n foundations | ⬜ | W4 | — | — |
| 12 | Enforced versioning | ⬜ | W6 | — | — |
| 13 | Build-validation analyzers | 🔄 | W0 | 2026-05 | W0-1 done: `BuildDiagnostic`, rule registry, walker, suppression stubs; W1-1/2/3 done: 10 rules active/stubbed (id-unknown-component/prop/event active; expr-dead-conditional/handler-no-value active; 5 stubs); Phase 2+ (scope analysis, AST integration) in later waves |
| 14 | UDC sandbox | ⬜ | W5 | — | W5-9 = declared-contract probe; W6-1–3 = enforcement |
| 15 | Audit-grade observability | 🔄 | W0 | 2026-05 | W0-3 done: `AuditPolicy`, redactor/sampler/correlation/sink stubs in `components-core/audit/`; Phase 1 (correlation IDs) in W2 |
| 16 | Concurrent-state determinism | ⬜ | W4 | — | W4-8 = happens-before contract probe; W7-2 = FIFO scheduler |

---

## How to update this file

When a plan phase ships:

1. Change ⬜ to 🔄 when work starts; change 🔄 to ✅ when all phases for
   the dimension are complete.
2. Fill in the *Last updated* column with `YYYY-MM`.
3. Add a one-line note (what shipped, what remains if partial).
4. If this is a Wave 8 strict-default flip, copy the row into the "Closed"
   table above and remove it from the open table.
