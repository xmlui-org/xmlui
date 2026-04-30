# Defended Routing — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §10 "Routing and Input Validation at the URL Boundary"](../managed-react.md) and the §17 scorecard row **"Routing input — Convenient, undefended."**

---

## Goal

Close the §17 scorecard row:

> **Routing input — Convenient, undefended.**
> Path to managed: *Route constraints, URL canonicalisation.*

Today routing is a thin wrapper around React Router v6 in
[`PagesReact`](../../src/components/Pages/PagesReact.tsx). Pages
are registered via `<Page url="/user/:id">`; the path is forwarded
verbatim to React Router as a string pattern. The
[`navigate()`](../../src/components-core/action/NavigateAction.tsx)
helper on `AppContext` runs `willNavigate` / `didNavigate` hooks,
but only when the navigation is initiated through it — browser
back/forward, direct URL entry, and external links bypass the
hook. Route parameters are always strings; nothing checks that
`:id` is numeric or that `:slug` matches a regex. There is no URL
canonicalisation: `/Users/42/`, `/users/42`, and
`/users/42?b=2&a=1` resolve to three different `$routeParams`
shapes.

The work is split into small, independently shippable steps in
priority order:

1. **Typed route constraints** — `<Page url="/user/:id:int">` with
   a constraint vocabulary (`int`, `uuid`, `slug`, `enum(...)`,
   custom validators from the
   [forms-validation plan's](./forms-validation-discipline.md)
   registry); non-matching URLs route to `fallbackPath` instead of
   crashing in user code.
2. **Coerced `$routeParams`** — `:id:int` produces a `number` in
   `$routeParams`, not a string. Same coercion table as the
   [verified-type-contracts](./verified-type-contracts.md) plan.
3. **Defensive `willNavigate`** — guard runs on *all* navigations
   including back/forward and direct entry; bypass-only loop-
   prevention; `<Page guard>` per-page guards in addition to the
   global hook.
4. **URL canonicalisation** — case folding, trailing-slash policy,
   query-parameter ordering, redirect-vs-rewrite choice; all
   declared once at the `<App>` level.
5. **Strict default flip + docs** in next major.

Every step lands behind `App.appGlobals.strictRouting: boolean`
(see Step 0).

---

## Conventions

- **Source of truth for route registration:**
  [`PagesReact`](../../src/components/Pages/PagesReact.tsx)
  consumes `<Page url=…>` children and mounts a React Router
  `<Route path=…>` per child. The constraint compiler runs once
  at `<Pages>` mount, transforming the constraint syntax into:
  - a stripped React Router pattern (`/user/:id` — what RR sees),
  - a per-segment validator + coercer table.
- **Source of truth for navigation:**
  [`NavigateAction`](../../src/components-core/action/NavigateAction.tsx)
  and `appContext.navigate`. Browser-driven navigations come
  through React Router's `useLocation()` / `usePopState`; the
  guard plumbs into the same observation point so it cannot be
  bypassed.
- **Existing infrastructure to reuse — do not reinvent:**
  - The
    [verified-type-contracts](./verified-type-contracts.md)
    plan's coercion rule table (`int`, `number`, `uuid`,
    `length`, `color`, …) is exactly the vocabulary route
    constraints need. Single chokepoint by construction.
  - The
    [forms-validation plan's](./forms-validation-discipline.md)
    `App.registerValidator()` registry is the same registry
    custom route constraints draw from. A validator named
    `employeeId` works in both `<FormItem validator>` and
    `<Page url="/emp/:id:employeeId">`.
  - The
    [structured-exception-model](./structured-exception-model.md)
    plan's `AppError` is the type a constraint-rejection produces:
    `category: "not-found"` for unknown routes,
    `category: "validation"` for failed constraints.
  - Inspector trace `kind: "navigate"` already exists; this plan
    extends the entry shape, it does not add a new kind.
- **New module location:**
  `xmlui/src/components-core/routing/` (new directory) holds the
  constraint compiler, coercer, canonicaliser, and guard
  dispatcher.
- **Diagnostic shape:** new `RoutingDiagnostic` carrying
  `{ code: RoutingDiagnosticCode, severity: "error" | "warn",
  pageUrl?, segment?, constraint?, rawValue?, message, data? }`
  where
  `RoutingDiagnosticCode ∈ { "constraint-rejected",
  "unknown-constraint", "duplicate-constraint",
  "non-canonical-url", "guard-bypass-attempt" }`.
- **Reporting mode:** `kind: "navigate"` trace entries gain a
  `routingDiagnostic?` field. Constraint rejections in non-strict
  mode warn and route to `fallbackPath`; in strict mode they
  additionally raise an `AppError` (`category: "validation"`)
  visible via the [`<App onError>` channel](./structured-exception-model.md).
- **Test layout:** unit tests under
  `xmlui/tests/components-core/routing/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/routing/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Routing Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictRouting: boolean` (default `false`;
  flips to `true` in the next major).
- Create `xmlui/src/components-core/routing/` with stubs:

  ```ts
  // diagnostics.ts
  export type RoutingDiagnosticCode =
    | "constraint-rejected"
    | "unknown-constraint"
    | "duplicate-constraint"
    | "non-canonical-url"
    | "guard-bypass-attempt";
  export interface RoutingDiagnostic {
    code: RoutingDiagnosticCode;
    severity: "error" | "warn";
    pageUrl?: string;
    segment?: string;
    constraint?: string;
    rawValue?: string;
    message: string;
    data?: unknown;
  }
  ```

  ```ts
  // constraint-compiler.ts
  export interface CompiledConstraint {
    name: string;          // "int", "uuid", "employeeId", …
    params?: unknown;      // for parameterised constraints
    validate: (raw: string) => boolean;
    coerce: (raw: string) => unknown;
  }
  export interface CompiledRoute {
    rrPath: string;                                      // React Router pattern
    constraints: ReadonlyMap<string, CompiledConstraint>; // segment name → constraint
    queryConstraints?: ReadonlyMap<string, CompiledConstraint>;
  }
  export function compileRoute(url: string): CompiledRoute;
  ```

  ```ts
  // canonicalise.ts
  export interface CanonicalPolicy {
    case: "preserve" | "lower";
    trailingSlash: "preserve" | "always" | "never";
    queryParamOrder: "preserve" | "alphabetical";
    onMismatch: "redirect" | "rewrite" | "warn";
  }
  export function canonicalise(url: string, policy: CanonicalPolicy):
    { canonical: string; changed: boolean };
  ```

  ```ts
  // guard-dispatcher.ts
  export type GuardResult =
    | { allow: true }
    | { allow: false; redirect?: string; reason?: string };
  export type GuardFn = (
    to: { pathname: string; routeParams: Record<string, unknown>;
          search: string; trigger: NavigationTrigger },
    from: { pathname: string } | null,
  ) => GuardResult | Promise<GuardResult>;
  export type NavigationTrigger =
    | "navigate"   // appContext.navigate
    | "popstate"   // browser back/forward
    | "initial"    // direct URL entry / refresh
    | "external";  // anchor / form submission
  ```

  ```ts
  // index.ts — barrel
  ```

- Document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).
  No new trace `kind` — routing reuses `"navigate"` and embeds the
  diagnostic.

### Files

- `xmlui/src/components-core/routing/diagnostics.ts` (new)
- `xmlui/src/components-core/routing/constraint-compiler.ts` (new)
- `xmlui/src/components-core/routing/canonicalise.ts` (new)
- `xmlui/src/components-core/routing/guard-dispatcher.ts` (new)
- `xmlui/src/components-core/routing/index.ts` (new — barrel)
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `routing/constraint-compiler.test.ts` — empty / no-constraint
  patterns round-trip unchanged; `rrPath` matches input.

### Acceptance

- `strictRouting` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Typed Route Constraints

### Step 1.1 — Constraint Syntax + Built-in Vocabulary

**Priority:** 1

#### Scope

- Extend the `<Page url>` mini-grammar with a `:constraint[(params)]`
  suffix per segment:

  ```xmlui
  <Page url="/user/:id:int" />
  <Page url="/order/:uid:uuid" />
  <Page url="/post/:slug:slug" />
  <Page url="/category/:name:enum(books,music,film)" />
  <Page url="/page/:n:int(min=1,max=999)" />
  ```

- Built-in constraint vocabulary (delegating to the
  verified-type-contracts coercion table where possible):
  - `int` — integer; coerces to `number`.
  - `number` — float; coerces to `number`.
  - `uuid` — RFC 4122 string; coerces to `string` (lower-cased).
  - `slug` — `[a-z0-9-]+`; coerces to `string`.
  - `bool` — `true|false`; coerces to `boolean`.
  - `enum(a,b,c)` — closed set; coerces to `string`.
  - `length(min,max)` — string-length-bounded segment.
  - `regex(/pattern/flags)` — escape hatch; coerces to `string`.
- Compiler strips constraints before forwarding to React Router —
  RR sees plain `:id` and matches greedily; the validator runs
  immediately after match and rejects to `fallbackPath` (with a
  `constraint-rejected` diagnostic) if invalid.
- Unknown constraint name → `unknown-constraint` (warn in
  non-strict, error in strict — fails the page registration).

#### Files

- `xmlui/src/components-core/routing/constraint-compiler.ts`
- `xmlui/src/components-core/routing/builtins/` (new — one file per
  constraint to keep them tree-shakable)
- `xmlui/src/components/Pages/PagesReact.tsx` (call `compileRoute`
  on each `<Page>` child)
- `xmlui/src/components/Pages/Page.md` (document syntax)

#### Tests

- `routing/builtins/*.test.ts`, one per constraint (positive,
  negative, boundary).
- `tests-e2e/routing/constraint-rejected.spec.ts` — `/user/abc` on
  `<Page url="/user/:id:int">` redirects to `fallbackPath`,
  emits `constraint-rejected`.

#### Acceptance

- All in-repo apps with plain `:param` patterns continue to work
  unchanged (no constraint = no coercion = `string`).
- Page registration with an unknown constraint warns at startup.

#### Dependencies

Step 0; verified-type-contracts plan Step 1.2 (shared coercion
table).

---

### Step 1.2 — Custom Constraints via the Validator Registry

**Priority:** 2

#### Scope

- A constraint name that is not a built-in is looked up in the
  [forms-validation registry](./forms-validation-discipline.md):

  ```xmlui
  <App
    onReady="
      App.registerValidator({
        name: 'employeeId',
        fn: (v) => /^E\\d{6}$/.test(v) ? null : 'invalid',
        defaultMessage: 'Invalid employee id',
      })">
    <Pages>
      <Page url="/emp/:id:employeeId" />
    </Pages>
  </App>
  ```

- Validators that take parameters expose them positionally:
  `:id:length(5,10)` → `validatorParams: { args: [5, 10] }`.
- A registered validator that throws → `constraint-rejected`
  with the exception message in `data`.
- This unifies the constraint vocabulary across the framework: one
  registry for forms and routes.

#### Files

- `xmlui/src/components-core/routing/constraint-compiler.ts`

#### Tests

- `routing/custom-constraint.test.ts` — registered validator
  rejects unknown id; accepted id passes through.

#### Acceptance

- Documentation of `App.registerValidator()` cross-references
  routing usage.

#### Dependencies

Step 1.1; forms-validation plan Steps 1.1 + 1.2.

---

### Step 1.3 — Coerced `$routeParams`

**Priority:** 3

#### Scope

- After a successful match + constraint check, `$routeParams` is
  populated with **coerced** values rather than raw strings:

  | Constraint | Type in `$routeParams` |
  |---|---|
  | none / `regex(...)` | `string` |
  | `int`, `number` | `number` |
  | `bool` | `boolean` |
  | `uuid`, `slug`, `enum(...)`, `length(...)` | `string` |
  | custom (registry) | as the validator returns from `coerce` (default `string`) |

- Same shape extended to `$queryParams` for query-string
  constraints (Step 1.4).
- The `<App>`-level `routeParamsCoerce: boolean` opt-out (default
  `true`) is provided for the rare app that wants string-only
  params during migration.

#### Files

- `xmlui/src/components/Pages/PagesReact.tsx` (apply coercer to
  the matched params before exposing as `$routeParams`)
- `xmlui/src/components-core/routing/constraint-compiler.ts`

#### Tests

- `routing/coercion.test.ts` — `:id:int` produces a `number`;
  arithmetic on it works without `Number()` wrapping.
- `tests-e2e/routing/coerced-params.spec.ts` — end-to-end check
  on a fixture page.

#### Acceptance

- Pages that previously did `Number($routeParams.id)` continue to
  work (the cast is a no-op on a number).
- Migration note in the docs: if the app reads
  `$routeParams.id.length`, it now needs to convert explicitly.

#### Dependencies

Step 1.1.

---

### Step 1.4 — Query-String Constraints

**Priority:** 4

#### Scope

- Extend the URL grammar to declare expected query parameters with
  constraints, in a separate `queryParams` declaration on `<Page>`:

  ```xmlui
  <Page url="/search"
        queryParams="q:string,page:int(min=1)?,sort:enum(asc,desc)?" />
  ```

  Trailing `?` marks a parameter optional. Required params absent
  from the URL → `constraint-rejected`.
- Unknown query parameters present in the URL: in non-strict mode
  pass through silently; in strict mode warn (does not reject —
  routes are still matched).
- `$queryParams` returns the coerced + filtered map; the original
  raw query string is available as `$queryString` (unchanged).

#### Files

- `xmlui/src/components/Pages/PagesReact.tsx`
- `xmlui/src/components-core/routing/constraint-compiler.ts`
- `xmlui/src/components/Pages/Page.tsx` (declare the
  `queryParams` prop on `<Page>`)
- `xmlui/src/components/Pages/Page.md`

#### Tests

- `routing/query-constraints.test.ts` — required missing rejects;
  optional missing produces `undefined`; enum values out of range
  reject.
- `tests-e2e/routing/query.spec.ts` — end-to-end smoke.

#### Acceptance

- Pages that do not declare `queryParams` behave exactly as today.
- Documentation of `$queryParams` lists the constraint vocabulary.

#### Dependencies

Step 1.1; verified-type-contracts plan Step 1.2.

---

## Phase 2 — Defensive Guards

### Step 2.1 — Guard Runs on All Navigation Triggers

**Priority:** 5

#### Scope

- Replace the current `willNavigate` invocation site (only inside
  [`NavigateAction`](../../src/components-core/action/NavigateAction.tsx))
  with a single dispatcher in `routing/guard-dispatcher.ts` that
  is fed by:
  - `appContext.navigate(...)` — `trigger: "navigate"`.
  - React Router's `usePopState` listener attached at
    `<App>` mount — `trigger: "popstate"`.
  - The very first render after page load — `trigger: "initial"`.
  - Anchor click + form-submission interception (added by
    `<App>` at the document level) — `trigger: "external"`.
- The guard receives the `trigger` so apps can implement
  trigger-specific policy ("require confirmation on
  `popstate` only").
- A guard returning `{ allow: false, redirect: "/login" }` is
  honoured uniformly across all triggers; today browser
  back/forward bypasses this entirely.
- Bypass-detection: if a `popstate` happens that "should" have been
  blocked because the previous guard call returned
  `{ allow: false }`, the dispatcher emits
  `guard-bypass-attempt` and re-redirects. (React Router's
  blocker API is the underpinning; this plan documents and tests
  the contract.)

#### Files

- `xmlui/src/components-core/action/NavigateAction.tsx` (delegate
  to the dispatcher)
- `xmlui/src/components-core/routing/guard-dispatcher.ts`
- `xmlui/src/components-core/AppRoot.tsx` (or equivalent — wire
  `usePopState` + anchor interception)

#### Tests

- `routing/guard-dispatcher.test.ts` — each trigger routes through
  the same guard.
- `tests-e2e/routing/guard-back-button.spec.ts` — back button
  cannot bypass an `allow: false` guard.
- `tests-e2e/routing/guard-direct-entry.spec.ts` — initial page
  load on a guarded URL redirects.

#### Acceptance

- `willNavigate` continues to work as today for the
  `navigate()` case (backward-compatible).
- Apps that relied on bypassability (rare; smells like a bug)
  must opt out via `App.appGlobals.guardOnPopState: false`.

#### Dependencies

Step 0.

---

### Step 2.2 — Per-Page `<Page guard>` Hook

**Priority:** 6

#### Scope

- Optional `guard` prop on `<Page>` runs *after* the global
  `willNavigate`:

  ```xmlui
  <Page
    url="/admin"
    guard="
      ({ trigger }) => App.user?.isAdmin
        ? { allow: true }
        : { allow: false, redirect: '/login' }">
  </Page>
  ```

- Per-page guards compose: global first, page guard second; both
  must `allow: true` to proceed. First denial wins.
- Async guards supported (return a `Promise`); during the wait
  the destination page is not mounted.

#### Files

- `xmlui/src/components/Pages/Page.tsx` (declare prop)
- `xmlui/src/components/Pages/PagesReact.tsx` (collect + pass to
  dispatcher)
- `xmlui/src/components-core/routing/guard-dispatcher.ts`

#### Tests

- `tests-e2e/routing/per-page-guard.spec.ts` — admin page
  redirects unauthenticated users.

#### Acceptance

- Pages without a `guard` prop behave exactly as today.

#### Dependencies

Step 2.1.

---

## Phase 3 — URL Canonicalisation

### Step 3.1 — Declarative Canonical Policy

**Priority:** 7

#### Scope

- New `<App>` props (each maps to the `CanonicalPolicy` shape
  defined in Step 0):
  - `urlCase="preserve" | "lower"` (default `"preserve"`).
  - `trailingSlash="preserve" | "always" | "never"`
    (default `"preserve"` for backward compatibility).
  - `queryParamOrder="preserve" | "alphabetical"`
    (default `"preserve"`).
  - `nonCanonicalUrl="redirect" | "rewrite" | "warn"`
    (default `"warn"` in non-strict; `"redirect"` in strict).
- The canonicaliser runs on every match. If the incoming URL
  differs from the canonical form:
  - `"redirect"` — emit a 302-equivalent React Router replace.
  - `"rewrite"` — `history.replaceState` to the canonical form
    silently (no extra render).
  - `"warn"` — emit `non-canonical-url` diagnostic; no URL
    change.
- Trailing-slash policy interacts with `<Page url>`: the page
  pattern is normalised once at compile so that
  `<Page url="/about">` and `<Page url="/about/">` are equivalent
  registrations under the chosen policy.

#### Files

- `xmlui/src/components-core/routing/canonicalise.ts`
- `xmlui/src/components-core/AppRoot.tsx` (read policy from
  `<App>` props, run on every match)

#### Tests

- `routing/canonicalise.test.ts` — every combination of policy
  vs. input.
- `tests-e2e/routing/canonical.spec.ts` — `/About/` redirects to
  `/about` under
  `urlCase="lower" trailingSlash="never" nonCanonicalUrl="redirect"`.

#### Acceptance

- All in-repo apps continue to behave identically under the
  default `"preserve"` settings.

#### Dependencies

Step 0; Step 1.1 (to share the route compilation pipeline).

---

## Phase 4 — Documentation & Strict Default

### Step 4.1 — Routing Sandbox Chapter

**Priority:** 8

#### Scope

- New `xmlui/dev-docs/guide/33-routing.md` chapter.
- Updates [`routing.md`](../../../.ai/xmlui/routing.md) with the
  constraint vocabulary, custom constraints, guard contract,
  canonicalisation, and the four `RoutingDiagnosticCode`s.
- Updates [`managed-react.md` §10](../managed-react.md):
  - Mark "No type or constraint syntax on route segments" as
    resolved.
  - Mark "`willNavigate` is bypassable" as resolved.
  - Mark "No URL canonicalization" as resolved.
- Updates the §17 scorecard row from
  *"Convenient, undefended"* to
  *"Defended — typed constraints, all-trigger guards, canonical
  URLs."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/33-routing.md` (new)
- `.ai/xmlui/routing.md`
- `xmlui/dev-docs/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter covers each of the three mechanisms with at least one
  worked example, plus a migration section.
- A "rule reference" table lists every `RoutingDiagnosticCode`
  with cause, severity in non-strict / strict, example fix.

#### Dependencies

Steps 1–3.

---

### Step 4.2 — Default `strictRouting: true` in Next Major

**Priority:** 9 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default in the next major release: `strictRouting: true`.
- Effects under strict mode:
  - `unknown-constraint` → error at page registration.
  - `non-canonical-url` default action becomes `"redirect"`.
  - `guard-bypass-attempt` upgrades from warn to error trace.
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-routing-default.md`
- `xmlui/dev-docs/guide/33-routing.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/routing/strict-mode.spec.ts` covers each
  diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  routing.

#### Dependencies

Step 4.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + skeleton | Next minor |
| **Constraint vocabulary** | 1.1, 1.2 | `:int`, `:uuid`, …; custom constraints from registry | Next minor + 1 |
| **Coerced params** | 1.3, 1.4 | `$routeParams` typed; query constraints | Next minor + 2 |
| **Defensive guards** | 2.1, 2.2 | Guard runs on all triggers; per-page `guard` prop | Next minor + 2 |
| **Canonicalisation** | 3.1 | Declarative policy on `<App>` | Next minor + 3 |
| **Docs + strict default** | 4.1, 4.2 | Guide chapter; strict default in next major | Next major |

Each step is independently revertible — removing the constraint
suffix from `<Page url>`, removing the guard prop, or setting the
canonical policy back to `"preserve"` returns the app to today's
behaviour.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (constraint syntax + built-ins)        ← verified-type-contracts
   │      │
   │      ├─> Step 1.2 (custom via validator registry) ← forms-validation
   │      │
   │      ├─> Step 1.3 (coerced $routeParams)
   │      │
   │      └─> Step 1.4 (query-string constraints)
   │
   ├─> Step 2.1 (guard on all triggers)
   │      │
   │      └─> Step 2.2 (<Page guard>)
   │
   └─> Step 3.1 (canonicalisation)
                        │
                        ▼
                  Step 4.1 (docs)
                        │
                        └─> Step 4.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Constraint syntax is `:name:constraint` not
   `:name(constraint)`.** Single colon-separated form mirrors
   ASP.NET Core (`{id:int}`) which §10 cites as the inspiration
   and is parseable without ambiguity. Alternative considered:
   parentheses syntax — rejected because parentheses are already
   valid in URL paths and would force escaping.

2. **Constraint registry is shared with the forms validator
   registry.** A team-defined `employeeId` validator works in both
   forms and routes, single mental model. Alternative considered:
   parallel route-only registry — rejected because the duplication
   would cause drift and double-registration ceremony.

3. **`fallbackPath` is the default rejection target.** Reuses the
   existing `<Pages fallbackPath>` configuration, no new prop
   needed for the common case. Apps that want per-page rejection
   targets can use `<Page guard>` (Step 2.2) which can return a
   `redirect`. Alternative considered: per-`<Page>`
   `rejectionPath` prop — rejected as redundant with the guard.

4. **Coercion is enabled by default.** Type-aware `$routeParams`
   is the whole point. Apps that depend on string-only params
   opt out per-page or globally via `routeParamsCoerce`.
   Alternative considered: opt-in coercion — rejected because the
   constraint syntax already declares intent (a developer typing
   `:id:int` is explicitly asking for a number).

5. **Guard dispatcher hooks `popstate` and anchor clicks
   uniformly.** §10's "`willNavigate` is bypassable" is the most
   security-relevant gap; closing it requires intercepting the
   triggers React Router does not own. Alternative considered:
   document-only "use `navigate()` everywhere" — rejected because
   external links and the back button are realistic exfil paths
   for half-completed flows.

6. **Per-page guards run *after* the global `willNavigate`.** Same
   composition order as middleware in most server frameworks; the
   global guard handles app-wide concerns (auth) before the page
   asks specifics. Alternative considered: page-first — rejected
   because it duplicates auth checks at every page.

7. **Canonical policy lives on `<App>`, not per-`<Page>`.** Whole-
   app consistency is the point of canonicalisation; allowing
   per-page exceptions defeats the purpose. Alternative
   considered: per-page override — rejected; a few legitimate
   exceptions can use `<Page guard>` to handle the redirect
   manually.

8. **`nonCanonicalUrl` defaults to `"warn"` in non-strict and
   `"redirect"` in strict.** Allows app authors to *see* the
   canonicalisation gap during the warn-mode window without
   breaking existing bookmarks; flips to redirect in strict mode
   so that bookmarks normalise on first visit.

9. **Async guards are first-class.** Auth guards typically need
   to fetch the current session; a sync-only contract would force
   apps to pre-fetch + cache or to misuse `useEffect`. Alternative
   considered: sync-only — rejected because the realistic uses
   are async.

10. **`strictRouting` default flip waits for a major.** Same
    rationale as the other plans — the warn-mode telemetry window
    is needed before failing on unknown constraints and on
    non-canonical bookmarks.

---

## Out of Scope

- **Server-side rendering of routes / data preloading.** XMLUI is
  client-rendered; SSR is a separate effort.
- **Nested route layouts beyond what `<Pages>` already supports.**
  Layout composition is not a *defence* concern.
- **Route-level rate limiting.** A backend concern; the
  [DOM-API hardening plan's](./dom-api-hardening.md)
  `App.fetch` Gate is the choke-point for outbound throttling.
- **Breadcrumbs / route metadata.** Composition feature; can be
  added later as a `<Page title>` / `<Page breadcrumb>` extension
  without changing the constraint or guard surface.
- **Route-aware code splitting.** Build-time concern; orthogonal
  to this plan and already partially handled by Vite mode.
- **Localised URLs (`/de/produkte`).** Owned by the i18n plan
  (next §17 row); the constraint vocabulary stays
  language-neutral here.
- **OAuth / OIDC redirect handling.** Auth is an app concern; the
  guard mechanism is the integration point but the plan does not
  ship an auth library.
