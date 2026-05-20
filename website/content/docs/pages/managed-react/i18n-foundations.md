# Internationalisation Foundations

XMLUI ships a complete internationalisation (i18n) layer out of
the box: a deterministic **locale resolver**, an **inline or URL
bundle store**, an **ICU MessageFormat** runtime for plurals and
selects, a set of **`Intl.*`-backed formatters** for numbers,
currencies, lists, dates, and relative time, and a built-in
**right-to-left (RTL) contract** for Arabic, Hebrew, Persian, and
Urdu. Every framework string the runtime emits — validation
messages, modal labels, default placeholders — flows through the
same translation table apps use, so an app can be translated
without re-shipping the framework.

## What problems this prevents

- **Hard-coded English everywhere.** Without bundles, every
  framework-emitted string (form validation, modal close
  button, select empty state) would ship as English and be
  un-overridable. With `App.translate("xmlui.form.required")`
  you can ship `xmlui.de.json` and the framework speaks German.
- **Broken plural agreement.** `"You have 1 items"` is the
  classic concatenation bug. The ICU runtime renders
  `"{count, plural, one {# item} other {# items}}"` correctly
  for every locale — Arabic (six categories) and Polish (four)
  included.
- **Lost user preference on reload.** Switching the locale at
  runtime via `App.setLocale("de")` persists to
  `localStorage.xmlui.locale`; the next page load restores it
  before the first render so the UI never flashes the wrong
  language.
- **Broken layouts in Arabic and Hebrew.** Components ship with
  CSS **logical properties** (`margin-inline-start` instead of
  `margin-left`), so `<App direction="auto">` mirrors the entire
  UI when the active locale is RTL — without per-component
  opt-ins.
- **Locale-blind number and date rendering.** `Intl.NumberFormat`
  formats `1234.5` as `"1.234,5"` in German and `"1,234.5"` in
  English. `App.formatNumber()`, `App.formatCurrency()`,
  `App.formatList()`, `App.formatRelativeTime()`, and
  `App.compare()` all respect the active locale automatically.

## How it works

Mount the `<App>` element with one or more locale bundles. Each
bundle is a flat `{ "key": "ICU pattern", … }` map. The resolver
picks the active locale in this priority order: `<App locale>`
prop > `App.setLocale()` (user override) > value persisted to
`localStorage.xmlui.locale` > first match against
`navigator.languages[]` > the `defaultLocale` global. The
resolved locale is exposed as the reactive `App.locale`; switching
it re-renders every component that reads a translation.

```xmlui
<App
  defaultLocale="en"
  localeBundles="{{
    en: { 'greeting.hello': 'Hello, {name}!' },
    de: { 'greeting.hello': 'Hallo, {name}!' },
    pl: { 'cart.items': '{count, plural, one {# rzecz} few {# rzeczy} many {# rzeczy} other {# rzeczy}}' }
  }}">
  <I18n key="greeting.hello" name="Ada" />
  <Text>{App.translate('cart.items', { count: 5 })}</Text>
  <Button onClick="App.setLocale('de')">Deutsch</Button>
</App>
```

Both forms — the `<I18n>` component (preferred for messages with
inline markup such as links) and the `App.translate(key, vars)`
function (for use inside expressions) — share one bundle store
and one ICU runtime. A missing key is a non-fatal `missing-key`
diagnostic by default: the rendered output falls back to the key
itself so the UI never breaks on a typo. Bundle URLs are loaded
in parallel; the app waits for the resolved locale's bundle
before its first render.

For locale-aware formatting, every `Intl.*` constructor is
exposed as a global function that defaults to `App.locale`:

| Function | Backed by | Use case |
|---|---|---|
| `App.formatNumber(v, opts?)` | `Intl.NumberFormat` | Localised decimal separators, grouping. |
| `App.formatCurrency(v, ccy, opts?)` | `Intl.NumberFormat` | Currency-symbol placement, ISO codes. |
| `App.formatList(values, opts?)` | `Intl.ListFormat` | `"A, B, and C"` / `"A, B et C"`. |
| `App.formatRelativeTime(v, unit, opts?)` | `Intl.RelativeTimeFormat` | `"3 days ago"` / `"il y a 3 jours"`. |
| `App.compare(a, b, opts?)` | `Intl.Collator` | Locale-aware sorting. |
| `App.pluralRules(n, opts?)` | `Intl.PluralRules` | Raw plural category for custom logic. |

For RTL: `<App direction="auto">` derives `"ltr"` or `"rtl"` from
the CLDR direction table, sets `dir` on the root element, and
relies on the SCSS logical-properties contract every built-in
component honours. The `scripts/lint-physical-css.ts` script
flags any new SCSS file that introduces a physical
`margin-left | margin-right | padding-left | padding-right |
text-align: left|right | left: | right:` without a logical-property
pair, so RTL never regresses silently.

## Enabling strict mode

By default the i18n diagnostics are non-fatal so apps can adopt
externalisation incrementally. To turn them into hard failures
during development, set the `strictI18n` global on the `<App>`:

```xmlui
<App global.strictI18n="{true}" defaultLocale="en" localeBundles="{...}">
  <!-- ... -->
</App>
```

Under strict mode:

- `missing-key` and `missing-bundle` upgrade from `warn` to
  `error` at every `App.translate` call site.
- `icu-parse-error` raises an `AppError` (caught by the
  structured exception model) instead of warning.
- `physical-css-property` lint failures fail CI rather than
  printing a console warning.

The default will flip to `strictI18n: true` in the next major
release; setting it explicitly today keeps your CI green when
that change ships.

## Related

- [Structured Exception Model](structured-exception-model.md) —
  how `icu-parse-error` and other i18n diagnostics surface as
  `AppError` instances under strict mode.
- [Build-Validation Analyzers](build-validation-analyzers.md) —
  the `untranslated-literal` analyzer that flags English
  literals in component metadata.
- [Verified Type Contracts](verified-type-contracts.md) — how
  the `i18nKey` field on metadata enables tooling to surface
  resolved values.
