# Internationalisation Foundations — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §11 "Internationalization and Localization"](../managed-react.md) and the §17 scorecard row **"i18n — Dates only."**

---

## Goal

Close the §17 scorecard row:

> **i18n — Dates only.**
> Path to managed: *String externalisation, ICU plurals, RTL guarantees.*

Today XMLUI is effectively monolingual. The `locale` field on
[`appContext`](../../src/components-core/appContext/app-utils.ts)
is read from `navigator.language` and is the input to
locale-aware date formatters
([`formatDateTime`](../../src/components-core/utils/date-utils.ts),
[`formatDatetimeToUserFriendly`](../../src/components-core/utils/misc.ts)).
Beyond dates there is nothing: every framework-emitted UI string
(default placeholders, validation messages, button labels, modal
ARIA labels) is an English literal embedded in the component
source. There is no string externalisation, no plural / gender
handling, no number / currency / list / relative-time formatters
on the expression surface, no collation helper, and no RTL
guarantee — components rely on CSS logical properties only when
the author remembered.

The work is split into independently shippable steps in priority
order:

1. **Locale resolver + `<App>` declarative override** —
   user-controllable locale (BCP-47) replacing the implicit
   `navigator.language`; reactive `App.locale` accessor.
2. **String externalisation infrastructure** — `LocaleProvider`,
   `App.translate(key, vars?)`, `<I18n>` component for slot-based
   markup; built-in framework strings extracted to a default
   English bundle.
3. **ICU MessageFormat support** — plurals, gender, select; built
   on `@formatjs/intl-messageformat` (the standard library the
   JVM and CLR ICU implementations also conform to).
4. **Locale-aware formatters on the expression surface** —
   `formatNumber`, `formatCurrency`, `formatList`,
   `formatRelativeTime`, `compare` (collation), `pluralRules` —
   all backed by `Intl.*`.
5. **RTL guarantee** — directionality contract on every component;
   `<App direction>` plus auto-detection from locale; framework
   primitives use CSS logical properties; lint rule against
   physical properties in component source.
6. **Strict default flip + docs** in next major.

Every step lands behind `App.appGlobals.strictI18n: boolean`
(see Step 0).

---

## Conventions

- **Locale identifier:** BCP-47 string (`en-US`, `de-CH`,
  `pt-BR`). All framework code consumes this; no proprietary
  locale codes.
- **Source of truth for the active locale:**
  [`appContext.locale`](../../src/components-core/appContext/app-utils.ts)
  becomes a derived value of:
  1. `<App locale="…">` markup prop (highest priority),
  2. user override via `App.setLocale("…")`,
  3. cookie / localStorage persisted choice (key configurable),
  4. `navigator.languages[]` first match against the loaded
     bundles (today's behaviour, refined to a list rather than a
     single value),
  5. fallback to `App.appGlobals.defaultLocale` (default `"en"`).
- **Source of truth for translations:** a `LocaleBundle` map
  loaded by `LocaleProvider`. Each bundle is a flat `Map<string,
  string>` keyed by message key. Bundles are loaded by the
  framework (built-in strings) and by the app
  (`<App localeBundles>`).
- **Source of truth for ICU formatting:**
  `@formatjs/intl-messageformat` v10 (BCP-47-aware, CLDR-based).
- **Existing infrastructure to reuse — do not reinvent:**
  - The
    [appContext](../../src/components-core/AppContext.tsx)
    `locale` field already exists and is read by date formatters;
    this plan extends it without renaming.
  - The
    [verified-type-contracts](./verified-type-contracts.md) plan's
    `locale` value type (BCP-47 string with regex check) is the
    type for the new `<App locale>` prop and any related
    metadata.
  - The
    [forms-validation plan](./forms-validation-discipline.md)'s
    validator registry stores `defaultMessage` strings; this plan
    promotes `defaultMessage` to a translation key when
    `App.translate()` is available.
  - The
    [theming-sandbox plan](./sealed-theming-sandbox.md)'s
    `valueType` vocabulary gains `locale` for theme-variable
    typing of locale-bearing values (rare but valid).
- **New module location:**
  `xmlui/src/components-core/i18n/` (new directory) holds the
  resolver, provider, formatters, and ICU runtime adapter.
- **Diagnostic shape:** new `I18nDiagnostic` carrying
  `{ code: I18nDiagnosticCode, severity: "error" | "warn",
  locale?, key?, bundleId?, message, data? }` where
  `I18nDiagnosticCode ∈ { "missing-key", "missing-bundle",
  "icu-parse-error", "untranslated-literal",
  "physical-css-property", "rtl-mismatch" }`.
- **Reporting mode:** new trace `kind: "i18n"`. Non-strict mode
  emits warns; strict mode upgrades `missing-key` and
  `missing-bundle` to errors and surfaces an
  [`AppError`](./structured-exception-model.md)
  with `category: "internal"` for `icu-parse-error`.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/i18n/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/i18n/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + i18n Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictI18n: boolean` (default `false`;
  flips to `true` in the next major).
- Add `App.appGlobals.defaultLocale: string` (default `"en"`).
- Add `App.appGlobals.localePersistKey: string | null`
  (default `"xmlui.locale"`; `null` disables persistence).
- Create `xmlui/src/components-core/i18n/` with stubs:

  ```ts
  // diagnostics.ts
  export type I18nDiagnosticCode =
    | "missing-key"
    | "missing-bundle"
    | "icu-parse-error"
    | "untranslated-literal"
    | "physical-css-property"
    | "rtl-mismatch";
  export interface I18nDiagnostic {
    code: I18nDiagnosticCode;
    severity: "error" | "warn";
    locale?: string;
    key?: string;
    bundleId?: string;
    message: string;
    data?: unknown;
  }
  ```

  ```ts
  // locale-resolver.ts
  export interface LocaleResolverInput {
    appProp?: string;
    userOverride?: string;
    persisted?: string;
    navigatorLanguages: readonly string[];
    available: readonly string[];
    fallback: string;
  }
  export function resolveLocale(input: LocaleResolverInput):
    { locale: string; source: "app" | "user" | "persisted" | "navigator" | "fallback" };
  ```

  ```ts
  // bundle-store.ts
  export interface LocaleBundle {
    locale: string;             // BCP-47
    messages: ReadonlyMap<string, string>; // key → ICU pattern
  }
  export interface BundleStore {
    register(bundle: LocaleBundle): void;
    available(): readonly string[];
    lookup(locale: string, key: string): string | undefined;
  }
  ```

  ```ts
  // formatters.ts
  // Stubs — implementations land in Phase 3.
  export function formatNumber(...): string;
  export function formatCurrency(...): string;
  export function formatList(...): string;
  export function formatRelativeTime(...): string;
  export function compare(a: string, b: string, locale?: string): number;
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"i18n"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals keys in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/i18n/diagnostics.ts` (new)
- `xmlui/src/components-core/i18n/locale-resolver.ts` (new)
- `xmlui/src/components-core/i18n/bundle-store.ts` (new)
- `xmlui/src/components-core/i18n/formatters.ts` (new)
- `xmlui/src/components-core/i18n/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `i18n/locale-resolver.test.ts` — priority order honoured;
  `navigator.languages` first match against `available` wins;
  fallback used when nothing matches.

### Acceptance

- All three appGlobals keys read through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Locale Resolver + `<App locale>`

### Step 1.1 — `<App locale>` Prop and `App.setLocale()`

**Priority:** 1

#### Scope

- New `<App locale="…">` prop. Validated against the BCP-47 type
  from the verified-type-contracts plan; invalid values warn and
  fall back.
- New `App.setLocale("de-DE")` global function on `appContext`.
  Side effects:
  - persists to `localePersistKey` (if non-null),
  - re-resolves the active locale,
  - triggers a reactive update wherever `App.locale` is read.
- `App.locale` becomes a reactive value (already exists in
  `appContext`; the plan promotes it from "snapshot at startup"
  to "live").
- `App.availableLocales` exposes the list of registered bundles.
- `App.locale.source` (read-only) tells apps which input won the
  resolution — useful for "showing a 'we picked your language
  automatically' banner".

#### Files

- `xmlui/src/components-core/AppContext.tsx`
- `xmlui/src/components-core/appContext/app-utils.ts`
- `xmlui/src/components/App/App.tsx` (declare prop)
- `xmlui/src/components/App/App.md`

#### Tests

- `i18n/setLocale.test.ts` — `App.setLocale` re-resolves;
  reactive consumers re-render.
- `tests-e2e/i18n/locale-switch.spec.ts` — switching locale at
  runtime updates date formatting on screen without a page
  reload.

#### Acceptance

- Existing apps that never touch `App.locale` continue to use
  `navigator.language` exactly as today.
- Persisted choice survives page reload.

#### Dependencies

Step 0; verified-type-contracts plan Step 1.2 (BCP-47 rule).

---

## Phase 2 — String Externalisation

### Step 2.1 — `App.translate(key, vars?)` + Bundle Loading

**Priority:** 2

#### Scope

- `<App localeBundles>` prop accepts an array of bundle URLs or
  inline objects:

  ```xmlui
  <App
    locale="de-DE"
    localeBundles="{[
      { locale: 'en', url: '/i18n/en.json' },
      { locale: 'de-DE', url: '/i18n/de-DE.json' },
    ]}"
  >
    ...
  </App>
  ```

- Bundles are JSON: a flat `{ "key": "ICU pattern", ... }`. Loading
  is parallel; the app does not render until the resolved locale's
  bundle is available (or the resolver falls back to a loaded one
  with a `missing-bundle` warn).
- `App.translate("greeting.hello", { name: "Ada" })` returns the
  translated string. ICU pattern substitution is delegated to
  Phase 3; in this step the formatter accepts only `{name}`-style
  placeholders.
- Missing key emits `missing-key` warn and returns the key (so
  the UI is never broken by a typo).
- Bundle hot-reload supported in dev (Vite HMR for inline
  bundles; URL bundles re-fetched on `App.reloadLocale()`).

#### Files

- `xmlui/src/components-core/i18n/bundle-store.ts` (fill in)
- `xmlui/src/components-core/i18n/translate.ts` (new)
- `xmlui/src/components-core/AppContext.tsx`
- `xmlui/src/components/App/App.tsx`

#### Tests

- `i18n/translate.test.ts` — bundle lookup, fallback chain,
  missing-key behaviour.
- `tests-e2e/i18n/bundles.spec.ts` — two bundles loaded; switch
  locale; UI strings update.

#### Acceptance

- `App.translate("any.key")` returns `"any.key"` if no bundles
  are loaded — backward compatible (apps can adopt
  externalisation incrementally).

#### Dependencies

Step 1.1.

---

### Step 2.2 — `<I18n>` Component for Slot-Based Markup

**Priority:** 3

#### Scope

- `<I18n key="…">` component renders the translated string for
  `key`. Vars passed as props with `:` prefix:

  ```xmlui
  <I18n key="welcome.greeting" :name="{user.firstName}" />
  ```

- For messages with markup placeholders (links, bold spans), use
  named slots:

  ```xmlui
  <I18n key="terms.intro">
    <Link slot="termsLink" to="/terms">terms of service</Link>
    <Link slot="privacyLink" to="/privacy">privacy policy</Link>
  </I18n>
  ```

  with the bundle entry:

  ```json
  "terms.intro": "Please read our <termsLink/> and <privacyLink/>."
  ```

- The component is a thin wrapper over `App.translate()` plus the
  ICU runtime (Step 3.1) and slot resolution.
- Reactive: re-renders on locale change.

#### Files

- `xmlui/src/components/I18n/I18n.tsx` (new)
- `xmlui/src/components/I18n/I18n.md` (new)

#### Tests

- `tests-e2e/i18n/i18n-component.spec.ts` — both string and
  slotted forms render correctly across two locales.

#### Acceptance

- Worked example in the docs site uses `<I18n>` for at least one
  visible string.

#### Dependencies

Step 2.1; Step 3.1 (the ICU runtime is needed for slotted markup).

---

### Step 2.3 — Extract Built-in Framework Strings

**Priority:** 4

#### Scope

- Audit all framework-emitted English literals listed in §11:
  - validation messages (`Validations.ts`,
    `forms-validation-discipline` step 1.1 standard library),
  - default placeholders on input components,
  - default labels on `<Form>` (e.g.
    `saveInProgressLabel`, `submitFeedbackDelay` toast text),
  - modal close-button ARIA labels,
  - `<Pages>` `fallbackPath` 404 default text (if any).
- Replace each literal with `App.translate("xmlui.<key>")` where
  the key is namespaced under `xmlui.*` to avoid collision with
  app keys.
- Ship the default English bundle as a built-in
  `xmlui.en.json` loaded automatically. Apps can override
  individual keys without re-shipping the whole bundle.
- The component metadata (used by the LSP / docs generator) gains
  an `i18nKey` field on relevant string props so authoring tools
  can show the resolved value.

#### Files

- `xmlui/src/components-core/i18n/builtin-bundles/xmlui.en.json` (new)
- Every component file that emits a default string (Form, FormItem,
  Modal, Toast, etc.)
- `xmlui/src/components-core/i18n/translate.ts` (auto-load the
  built-in bundle on `<App>` mount)

#### Tests

- `tests-e2e/i18n/builtin-strings.spec.ts` — switching locale
  with a custom `xmlui.de.json` translates form validation
  messages and modal labels.

#### Acceptance

- All built-in literals identified in the audit have a
  `xmlui.*` key.
- `untranslated-literal` lint diagnostic (Step 5.1) passes for
  the framework's own source after this step.

#### Dependencies

Step 2.1.

---

## Phase 3 — ICU MessageFormat

### Step 3.1 — `@formatjs/intl-messageformat` Integration

**Priority:** 5

#### Scope

- Vendor `@formatjs/intl-messageformat` (or load on demand the
  first time an ICU pattern with `{n, plural, …}` /
  `{g, select, …}` is encountered).
- `App.translate(key, vars)` and `<I18n>` route ICU patterns
  through the runtime; non-ICU patterns continue to use the
  cheap `{name}` substitutor.
- ICU parse errors emit `icu-parse-error` (warn in non-strict;
  error + `AppError` in strict). The key is rendered as the raw
  pattern so the developer sees the issue.
- Standard ICU types supported (per FormatJS): `plural`, `select`,
  `number`, `date`, `time`, `selectordinal`. Locale-specific
  plural rules (`one`, `few`, `many`, `other`) honoured for all
  registered locales.

#### Files

- `xmlui/src/components-core/i18n/translate.ts`
- `xmlui/src/components-core/i18n/icu.ts` (new — runtime adapter)
- `xmlui/package.json` (add `@formatjs/intl-messageformat`)

#### Tests

- `i18n/icu.test.ts` — fixtures for each ICU type; English (`one`,
  `other`) and Polish (`one`, `few`, `many`, `other`) plural
  forms.
- `tests-e2e/i18n/plurals.spec.ts` — counter component renders
  correct plural form across locales.

#### Acceptance

- A bundle entry `"items": "{count, plural, one {# item}
  other {# items}}"` renders correctly for English and Polish
  plural rules.

#### Dependencies

Step 2.1.

---

## Phase 4 — Locale-Aware Formatters on the Expression Surface

### Step 4.1 — Number / Currency / List / Relative Time / Compare

**Priority:** 6

#### Scope

- Add the following global functions on `appContext`, all backed
  by `Intl.*` and respecting the active `App.locale`:
  - `formatNumber(value, opts?)` — wraps `Intl.NumberFormat`.
  - `formatCurrency(value, currency, opts?)` — `Intl.NumberFormat`
    with `style: "currency"`.
  - `formatList(values, opts?)` — `Intl.ListFormat`.
  - `formatRelativeTime(value, unit, opts?)` —
    `Intl.RelativeTimeFormat`. A second flavour
    `formatRelativeTimeFromNow(date, opts?)` computes the unit
    automatically (replacing the "WARNING: does not handle locales"
    comment in
    [`misc.ts`](../../src/components-core/utils/misc.ts) line 230).
  - `compare(a, b, opts?)` — `Intl.Collator.compare`.
  - `pluralRule(n, opts?)` — `Intl.PluralRules.select(n)`.
- Each formatter exposes the same option object as the
  underlying `Intl.*` constructor; defaults are taken from
  CLDR for the active locale.
- Existing date functions
  ([`date-functions.ts`](../../src/components-core/appContext/date-functions.ts))
  gain a third `locale` argument that defaults to `App.locale` —
  no behavioural change for callers that omit it.

#### Files

- `xmlui/src/components-core/i18n/formatters.ts` (fill in)
- `xmlui/src/components-core/AppContext.tsx` (export new globals)
- `xmlui/src/components-core/appContext/date-functions.ts` (add
  optional `locale` argument)

#### Tests

- `i18n/formatters.test.ts` — each formatter, three locales each.
- `tests-e2e/i18n/formatters.spec.ts` — smoke test rendering all
  five formatters.

#### Acceptance

- The "WARNING: does not handle locales" TODO is removed.
- All formatters tree-shake out when not used (`Intl.*` is
  built-in to the browser; only the wrapper code is bundled).

#### Dependencies

Step 1.1.

---

## Phase 5 — RTL Guarantee

### Step 5.1 — Direction Contract + Lint

**Priority:** 7

#### Scope

- New `<App direction="ltr" | "rtl" | "auto">` prop. `"auto"`
  derives from `App.locale` via the CLDR direction table (Arabic,
  Hebrew, Persian, Urdu, … → `rtl`).
- `App.direction` reactive accessor; injected as
  `dir="…"` on the root element of every XMLUI component
  automatically (one CSS layer).
- All built-in component SCSS modules audited and converted to
  CSS logical properties (`margin-inline-start` instead of
  `margin-left`, etc.). The
  [theming-sandbox plan](./sealed-theming-sandbox.md) Step 2.1's
  layout-prop allowlist is extended: `paddingLeft` /
  `paddingRight` map to `padding-inline-start` /
  `padding-inline-end` when `App.direction === "rtl"`. Authors who
  truly need physical positioning use new explicit props
  (`paddingPhysicalLeft`, etc.) which warn under strict mode.
- New ESLint / TS-AST lint rule: SCSS files under
  `xmlui/src/components/**/*.module.scss` cannot use
  `margin-left | margin-right | padding-left | padding-right |
  text-align: left | text-align: right | left: | right:`
  without a paired logical-property fallback. Violations emit
  `physical-css-property`.
- A focus-flow audit ensures that keyboard tab order continues
  to follow source order (which is logical, not physical).

#### Files

- `xmlui/src/components/App/App.tsx`
- All component `*.module.scss` files (mechanical conversion)
- `xmlui/scripts/lint-physical-css.ts` (new)
- `xmlui/src/components-core/theming/validator/style-prop-validator.ts`
  (extend layout prop coercion for direction)

#### Tests

- `tests-e2e/i18n/rtl-layout.spec.ts` — every component renders
  its mirror layout when `App.direction === "rtl"`; visual
  regressions captured by Playwright snapshot.
- `i18n/lint-physical-css.test.ts` — sample SCSS with
  `margin-left` is flagged.

#### Acceptance

- The docs site renders correctly under `<App direction="rtl">`.
- Lint passes for every in-repo `*.module.scss`.

#### Dependencies

Step 1.1; theming-sandbox plan Step 2.1.

---

## Phase 6 — Documentation & Strict Default

### Step 6.1 — i18n Chapter + Reference

**Priority:** 8

#### Scope

- New `xmlui/dev-docs/guide/34-i18n.md` chapter.
- Updates `.ai/xmlui/i18n.md` (new file) with:
  - Locale resolution priority,
  - Bundle JSON format and naming convention,
  - ICU pattern reference with at least one plural and one
    select example,
  - Formatter API reference,
  - RTL contract and migration notes.
- Updates [`managed-react.md` §11](../managed-react.md):
  - Mark "No string externalization" as resolved.
  - Mark "No pluralization or gender support" as resolved.
  - Mark "No locale-aware sorting or collation helpers" as
    resolved.
  - Mark "No RTL support contract" as resolved.
  - Mark "No currency formatting" as resolved.
- Updates the §17 scorecard row from
  *"Dates only"* to
  *"Sealed — bundles, ICU plurals, Intl-backed formatters,
  RTL guarantee."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/34-i18n.md` (new)
- `.ai/xmlui/i18n.md` (new)
- `xmlui/dev-docs/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter covers each of the five mechanisms with at least one
  worked example, plus a migration section.
- A "rule reference" table lists every `I18nDiagnosticCode` with
  cause, severity in non-strict / strict, example fix.

#### Dependencies

Steps 1–5.

---

### Step 6.2 — Default `strictI18n: true` in Next Major

**Priority:** 9 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip the
  default in the next major release: `strictI18n: true`.
- Effects under strict mode:
  - `missing-key` and `missing-bundle` upgrade to errors at
    `App.translate` call sites.
  - `icu-parse-error` raises an `AppError` instead of warn.
  - `physical-css-property` lint failures fail CI.
  - `rtl-mismatch` (a component that uses physical positioning
    and breaks under `dir="rtl"`) becomes an error.
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-i18n-default.md`
- `xmlui/dev-docs/guide/34-i18n.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/i18n/strict-mode.spec.ts` covers each
  diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  i18n (English-only is fine — the diagnostics fire only when
  `App.translate` is called against an unloaded bundle).

#### Dependencies

Step 6.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + skeleton | Next minor |
| **Locale resolver** | 1.1 | `<App locale>`, `App.setLocale` | Next minor + 1 |
| **Externalisation** | 2.1, 2.2 | `App.translate`, `<I18n>` | Next minor + 1 |
| **Built-in extraction** | 2.3 | Framework strings keyed | Next minor + 2 |
| **ICU runtime** | 3.1 | Plurals, selects | Next minor + 2 |
| **Formatters** | 4.1 | Number / currency / list / relative / compare | Next minor + 3 |
| **RTL** | 5.1 | Direction contract + SCSS audit + lint | Next minor + 3 |
| **Docs + strict default** | 6.1, 6.2 | Guide chapter; strict default in next major | Next major |

Each step is independently shippable: `App.translate` works
without ICU (Phase 2 ships before Phase 3); formatters work
without externalised bundles; RTL works whether or not bundles
are loaded.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   └─> Step 1.1 (<App locale>, App.setLocale)
          │
          ├─> Step 2.1 (App.translate + bundles)
          │      │
          │      ├─> Step 2.2 (<I18n>)              ← needs Step 3.1
          │      │
          │      ├─> Step 2.3 (extract built-ins)
          │      │
          │      └─> Step 3.1 (ICU runtime)
          │             │
          │             └─> Step 2.2 (slotted markup)
          │
          ├─> Step 4.1 (formatters)
          │
          └─> Step 5.1 (RTL contract)               ← theming-sandbox Step 2.1
                  │
                  ▼
            Step 6.1 (docs)
                  │
                  └─> Step 6.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Bundle format is flat JSON, ICU values.** Industry standard;
   FormatJS, lingui, react-intl, and most translator tools (POEdit,
   Crowdin, Lokalise) emit / accept this shape. Alternative
   considered: nested namespaces (`{ form: { submit: "Save" } }`)
   — rejected because flat keys are easier to grep, easier to
   extract, and avoid ambiguity when keys contain dots.

2. **Locale resolution honours `<App locale>` over user override.**
   The markup is the source of truth for app-controlled locales
   (e.g. an admin tool that always renders in English regardless
   of browser settings); the user override applies only when the
   app does not pin a locale. Alternative considered: user
   override always wins — rejected because it removes the app's
   ability to enforce a single language.

3. **Built-in framework strings are namespaced under `xmlui.*`.**
   Avoids key collisions with app translations.

4. **ICU runtime is `@formatjs/intl-messageformat`.** It is the
   reference implementation in the JavaScript ecosystem; aligns
   with the JVM (`com.ibm.icu`) and CLR (`System.Globalization`)
   ICU implementations §11 cites. Alternative considered:
   hand-rolled plural runtime — rejected because plural rules
   for many locales are complex (Arabic has 6 categories) and
   maintaining a fork is unjustified.

5. **Locale-aware formatters wrap `Intl.*` directly.** Browser-
   built-in, zero bundle cost. Alternative considered: ship a
   formatter library — rejected because all modern targets
   (`Chrome ≥ 89`, `Safari ≥ 14`, `Firefox ≥ 91`, `Edge ≥ 89`)
   support `Intl.ListFormat`, `Intl.RelativeTimeFormat`,
   `Intl.PluralRules` natively.

6. **`App.locale` is reactive.** Switching locale at runtime must
   re-render the visible UI; computing it once at startup would
   require a hard reload. Alternative considered: snapshot at
   startup with a "reload to apply" toast — rejected as a worse
   user experience for an internal management tool.

7. **RTL is opt-in via `<App direction>` but auto-detected for
   known RTL locales.** Apps that ship in only LTR languages pay
   no cost; apps that ship Arabic/Hebrew get the right behaviour
   without per-component opt-ins. Alternative considered: always
   set `dir` based on `App.locale` — rejected because some apps
   intentionally render bidi text inside an LTR shell.

8. **Layout-prop coercion translates physical to logical when
   `dir="rtl"`.** `paddingLeft="20"` in markup means "before the
   text" in the user's reading direction; auto-mapping to
   `padding-inline-start` is what the author meant in 99% of cases.
   Authors who literally mean physical-left can use
   `paddingPhysicalLeft` (warns under strict). Alternative
   considered: deprecate `paddingLeft` outright — rejected
   because the migration cost is not justified by the marginal
   safety win.

9. **Bundle loading blocks first paint of components that call
   `App.translate`.** Otherwise a flash of message keys appears.
   Apps with large bundles can use the
   [cooperative-concurrency plan](./cooperative-concurrency.md)'s
   `handlerTimeoutMs` to bound the wait. Alternative considered:
   show keys until bundles load — rejected as a worse user
   experience.

10. **`strictI18n` default flip waits for a major.** Same rationale
    as the other plans — the warn-mode telemetry window is needed
    before failing on missing keys, missing bundles, and physical
    CSS properties.

---

## Out of Scope

- **Translation tooling (key extraction CLI, missing-key
  reporting back to a TMS).** Deferred to a future tooling plan;
  the runtime emits `missing-key` traces that a build-time tool
  can scrape.
- **Pseudo-localisation mode.** Useful for finding hard-coded
  strings; can be added later as a synthetic bundle generator.
- **Right-to-left bidi inside text content.** The browser handles
  Unicode bidi natively; this plan only addresses *layout*
  direction.
- **Per-page locale.** A page does not get its own locale; if an
  app needs a mixed-locale view (rare), it can pass an explicit
  `locale` to individual formatters.
- **Server-side rendering of locale-correct HTML.** XMLUI is
  client-rendered; the resolver runs after first paint.
- **Translation memory / fuzzy matching.** Translator workflow
  concern, not framework concern.
- **Unicode normalisation helpers (NFC / NFD).** Niche; can be
  added to the formatter surface later if demand surfaces.
- **Locale-specific theme variations** (e.g. different default
  fonts for CJK locales). Owned by the
  [sealed-theming-sandbox plan](./sealed-theming-sandbox.md);
  this plan only ensures the locale value is reactively
  available.
