# App Locale and Scoped Locale Component

## Goal

Add an app-level way to declare the root locale used by the app, and add a non-visual `<Locale>` component that scopes locale and formatting traits for its descendants.

The current i18n surface already has `<App locale="...">`, `App.setLocale(...)`, locale bundles, `App.translate(...)`, and formatting helpers such as `App.formatNumber(...)`. This plan keeps the public app-level property named `locale`.

## Proposed Public API

```xml
<App locale="hu-HU">
  <Text>{App.locale}</Text>
</App>
```

```xml
<Locale locale="de-DE">
  <I18n key="price" value="{1234.5}" />
  <Text>{App.formatNumber(1234.5)}</Text>
</Locale>
```

```xml
<Locale
  locale="en-US"
  decimalSeparator=","
  groupSeparator=" "
  currency="EUR">
  <Text>{App.formatNumber(1234.5)}</Text>
</Locale>
```

Initial trait set:

- `locale`: BCP-47 locale ID used by translation and `Intl`-based helpers.
- `decimalSeparator`: string override for formatted numeric decimal separators.
- `groupSeparator`: string override for formatted numeric grouping separators.
- `minusSign`: string override for the minus sign.
- `currency`: default currency used when formatting currency without an explicit currency argument, if the final API supports that overload.
- `numberingSystem`: forwarded to `Intl.NumberFormat` options where supported.

Open API decision before implementation: use `groupSeparator` as the public name, with `thousandSeparator` as a documented alias only if compatibility with user vocabulary is worth the extra metadata and tests.

## Step 1: Add Locale Profile Types and Normalization

Create a small locale-profile model under `xmlui/src/components-core/i18n/`, for example `locale-profile.ts`.

Implementation:

- Define `LocaleProfile` with `locale`, optional trait overrides, and possibly `source`.
- Add `normalizeLocaleProfile(input, parentProfile)` to validate and merge profiles.
- Reuse `isValidLocale()` and `normalizeLocale()` from `locale-resolver.ts`.
- Keep invalid locale behavior consistent with existing i18n diagnostics: warn in normal mode, error under `strictI18n`, and fall back to the parent locale.
- Add a deterministic number-part post-processing helper for simple glyph overrides after `Intl.NumberFormat.formatToParts(...)`.

Tests:

- `xmlui/tests/components-core/i18n/locale-profile.test.ts`
- Valid locale normalization, invalid locale fallback, parent trait inheritance, local trait override.
- Separator override only changes separator parts, not digits or currency text.

## Step 2: Clarify and Preserve `<App locale>`

Keep `<App locale>` as the app-level declared locale. This property remains the root locale source for app rendering, translation, direction, and formatting.

Implementation:

- Keep `locale` in `xmlui/src/components/App/App.tsx` metadata; update its description only if needed to make the default/declared-locale role clear.
- Keep `locale?: string` in `xmlui/src/components/App/AppReact.tsx`.
- Keep the existing `AppReact` effect that calls `App.setLocale(locale, { source: "app" })`.
- In `AppContent`, preserve existing locale resolution priority unless product semantics are intentionally changed: app locale, user override, persisted locale, navigator, config fallback.
- Use the resolved active app locale as the root `LocaleProfile.locale`.
- Treat `<Locale>` as the mechanism for descendant overrides, not as a reason to rename or split the app-level `locale` property.

Tests:

- Unit test `resolveLocale()` still passes current priority cases.
- Add or keep test proving `<App locale>` wins over user, persisted, navigator, and config fallback sources.
- Add E2E coverage proving `<App locale>` establishes the root locale used by `I18n` and `App.formatNumber(...)`.

## Step 3: Add Locale Context Provider

Add a React context for scoped locale profiles, separate from global app locale state.

Implementation:

- Create `LocaleContext` and `useLocaleProfile()` in `xmlui/src/components-core/i18n/LocaleContext.tsx` or a nearby `components-core/i18n` module.
- Provider value should merge parent profile plus local overrides.
- AppContent should provide the root profile based on the active app locale and any app-level traits added later.
- Decide whether `App.locale` should expose the global active locale or scoped locale inside `<Locale>`. Recommended: keep `App.locale` global for compatibility and add `App.currentLocale` or `App.localeProfile` only if scoped introspection is needed.

Tests:

- React/unit test for nested providers: outer locale, inner trait override, child inheritance.
- Test provider identity stability when inputs do not change.

## Step 4: Update App Formatting Helpers to Use Scoped Profile

Make formatting methods consumed through `App.*` honor the nearest `<Locale>` provider.

Implementation:

- Update `AppContent` to build formatting helpers from the active root profile.
- For React components using `useAppContext()`, ensure calls to `App.formatNumber`, `App.formatCurrency`, `App.formatList`, `App.formatRelativeTime`, `App.compare`, and `App.pluralRules` use the scoped profile when rendered under `<Locale>`.
- The cleanest approach is a new hook-backed wrapper component for scoped App helpers, or making `useAppContext()` compose the base app context with `useLocaleProfile()` for the `App` namespace.
- Keep non-renderer/global calls deterministic: outside any provider, helpers use the root active profile.
- Use `Intl.*` for locale-sensitive behavior and apply custom separator/minus-sign overrides only where `Intl` exposes stable parts, primarily numbers and currencies.

Tests:

- E2E: `<Text>{App.formatNumber(1234.5)}</Text>` changes inside `<Locale locale="hu-HU">`.
- E2E: nested `<Locale>` overrides only descendants.
- Unit: trait override post-processing for number and currency format output.

## Step 5: Add `<Locale>` Component

Create a new non-visual built-in component under `xmlui/src/components/Locale/`.

Implementation:

- Add `Locale.tsx` using `wrapComponent` with `customRender`.
- Metadata: `status: "experimental"`, `nonVisual: true`, props for `locale`, `decimalSeparator`, `groupSeparator`, `thousandSeparator` alias if accepted, `minusSign`, `currency`, `numberingSystem`.
- The component renders `LocaleContext.Provider` around `renderChild(node.children)`.
- Register the renderer in `xmlui/src/components/ComponentProvider.tsx`.
- Add metadata to `xmlui/src/components/collectedComponentMetadata.ts`.

Tests:

- `xmlui/src/components/Locale/Locale.spec.ts`
- Renders children unchanged.
- Locale scopes translation through `<I18n>`.
- Locale scopes `App.formatNumber(...)`.
- Nested locale restores parent after inner scope.
- Trait-only `<Locale decimalSeparator=",">` inherits the parent locale.

## Step 6: Make `<I18n>` Locale-Aware

Update `<I18n>` so translations resolve against the nearest locale profile, not only the global active locale.

Implementation:

- In `xmlui/src/components/I18n/I18n.tsx`, read the locale profile hook in `I18nView`.
- Either call a scoped `App.translate` or expose a lower-level translation helper on the app context that accepts an explicit locale.
- Keep missing-key diagnostics unchanged, including locale/key fields.

Tests:

- Existing `I18n` tests still pass.
- Add scoped translation case with bundles for `en` and `de`, using `<Locale locale="de">`.
- Add fallback case: `<Locale locale="de-AT">` can resolve `de` bundle if current bundle-store fallback supports it.

## Step 7: Update Internal Consumers That Should Respect App Locale

Audit formatting consumers that currently use browser defaults or ad hoc locale props.

Candidates:

- `Table` / `Column` typed formatting currently accepts `typeOptions.locale`.
- Date/time display utilities in `AppContextDefs` and app-utils.
- File-size formatting if it should become locale-sensitive.

Implementation:

- Preserve explicit local options such as `typeOptions.locale`; they should win over scoped locale.
- Where no explicit locale is supplied, use the current scoped profile or root app profile instead of `navigator.language`.
- Keep this step small: start with `Table` typed formatting only if it can be tested without broad churn.

Tests:

- Table typed number formatting uses `<Locale locale="hu-HU">` when column has no explicit locale.
- Column `typeOptions.locale` still wins over `<Locale>`.

## Step 8: Documentation and Examples

Update user-facing docs and generated metadata inputs.

Implementation:

- Add `xmlui/src/components/Locale/Locale.md`.
- Update `xmlui/src/components/App/App.md` to clarify that `locale` declares the app-level locale.
- Update `xmlui/src/components/I18n/I18n.md` with scoped locale example.
- Update `.ai/xmlui/i18n.md` to document the root app locale and scoped locale profiles.
- Add `xmlui-pg` examples with `name="..."` on all fences.

Tests:

- If docs examples are covered by website example tests, update IDs carefully.
- Run focused docs/example extraction tests only if touched examples have existing coverage.

## Step 9: Metadata Snapshot and Changeset

Because this adds public component API and metadata:

- Run `npm --prefix xmlui run check:metadata-snapshot`.
- Include regenerated `xmlui/src/language-server/xmlui-metadata-generated.js`.
- Add `.changeset/<unique-name>.md` with `"xmlui": patch`.
- Run `npx changeset status`.

## Step 10: Verification Matrix

Focused verification:

```bash
npm --prefix xmlui run check:metadata-snapshot
npx vitest run xmlui/tests/components-core/i18n
npx playwright test xmlui/src/components/Locale/Locale.spec.ts --reporter=line
npx playwright test xmlui/src/components/I18n/I18n.spec.ts --reporter=line
```

Broader regression pass:

```bash
npx playwright test xmlui/src/components/Table/Table.spec.ts --reporter=line
npx playwright test --grep "I18n|Locale|Table" --reporter=line
npx changeset status
```

## Suggested Milestones

1. App root locale only: `<App locale>` remains the declared root locale and has unit/E2E coverage.
2. Locale profile core only: merge/normalize/format trait helpers are unit-tested.
3. Non-visual `<Locale>` renders children and scopes formatter calls.
4. `<I18n>` uses scoped locale.
5. Table/default formatting consumers adopt scoped locale where appropriate.
6. Docs, metadata snapshot, changeset, and regression pass.
