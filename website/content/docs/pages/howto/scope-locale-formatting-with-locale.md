# Scope locale formatting with Locale

Use `<Locale>` when one part of a page should use a different locale or number-formatting profile than the rest of the app.

The root `<App locale>` property defines the app-wide default. A `<Locale>` wrapper overrides that locale for its descendants, including `App.translate()`, `<I18n>`, `App.formatNumber()`, `App.formatCurrency()`, and typed table column formatting.

```xmlui-pg copy display name="Scope translated text and formatting" id="scope-translated-text-and-formatting" height="420px"
---app display /locale="de"/ /<Locale locale="en-US">/
<App
  locale="de"
  localeBundles="{{
    de: { 'summary.title': 'Zusammenfassung' },
    'en-US': { 'summary.title': 'Summary' }
  }}">
  <VStack gap="$space-4">
    <VStack gap="$space-2">
      <Text variant="strong">App locale: {App.locale}</Text>
      <I18n key="summary.title" />
      <Text>{App.formatNumber(1234567.89)}</Text>
      <Text>{App.formatCurrency(1234567.89, 'EUR')}</Text>
    </VStack>

    <Locale locale="en-US">
      <VStack gap="$space-2">
        <Text variant="strong">Scoped Locale</Text>
        <I18n key="summary.title" />
        <Text>{App.formatNumber(1234567.89)}</Text>
        <Text>{App.formatCurrency(1234567.89, 'EUR')}</Text>
      </VStack>
    </Locale>
  </VStack>
</App>
```

## Override only formatting traits

Use locale traits when the language should stay the same but punctuation or currency should follow a product, market, or data-source convention.

```xmlui-pg copy display name="Override separators without changing language" id="override-separators-without-changing-language" height="300px"
---app display /decimalSeparator=","/ /groupSeparator=" "/
<App locale="en-US">
  <VStack gap="$space-3">
    <Text>Default: {App.formatNumber(1234567.89)}</Text>

    <Locale decimalSeparator="," groupSeparator=" " currency="EUR">
      <Text>Scoped number: {App.formatNumber(1234567.89)}</Text>
      <Text>Scoped currency: {App.formatCurrency(1234567.89)}</Text>
    </Locale>
  </VStack>
</App>
```

## Use scoped formatting in tables

Typed table columns read the nearest locale profile. Explicit `typeOptions.locale` on a column still wins when one column needs its own locale.

```xmlui-pg copy display name="Format table values in a scoped locale" id="format-table-values-in-a-scoped-locale" height="330px"
---app display /<Locale locale="fr-FR">/ /type="currency"/
<App locale="en-US">
  <Locale locale="fr-FR" currency="EUR">
    <Table
      data="{[
        { product: 'Notebook', price: 1299.95, margin: 0.274 },
        { product: 'Monitor', price: 349.5, margin: 0.183 }
      ]}">
      <Column bindTo="product" />
      <Column bindTo="price" type="currency" />
      <Column bindTo="margin" type="percent" />
    </Table>
  </Locale>
</App>
```

## Key points

**Keep the app default on `<App locale>`**: Use `locale` on `App` for the default locale across the application.

**Wrap only the subtree that differs**: `<Locale>` affects its children and nested components, while siblings keep using the parent locale.

**Traits merge with the active locale**: `decimalSeparator`, `groupSeparator`, `thousandSeparator`, `minusSign`, `currency`, and `numberingSystem` override individual formatting details without requiring a new locale ID.

**Nested locales are allowed**: An inner `<Locale>` can override a parent `<Locale>` for a smaller section.

**Column options remain explicit**: `typeOptions.locale` on a `Column` takes precedence over the surrounding `<Locale>` profile.

---

## See also

- [Locale component](/docs/reference/components/Locale) — full property reference
- [App component](/docs/reference/components/App) — `locale`, `localeBundles`, and formatter helpers
- [Format values for the active locale](/docs/howto/format-values-for-the-active-locale) — app-wide formatter usage
- [Switch locale with inline bundles](/docs/howto/switch-locale-with-inline-bundles) — define translations at startup
