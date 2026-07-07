# Format values for the active locale

Use the `App.format*` helpers when values should follow the current locale's punctuation and phrasing.

The helpers wrap `Intl.NumberFormat`, `Intl.ListFormat`, `Intl.RelativeTimeFormat`, and related APIs. They automatically use `App.locale`, so changing the locale updates all formatted values.

```xmlui-pg copy display name="Format numbers currency lists and relative time" id="format-numbers-currency-lists-and-relative-time" height="360px"
---app display /App.locale/
<App
  localeBundles="{{
    en: { 'title': 'Invoice summary' },
    de: { 'title': 'Rechnungszusammenfassung' }
  }}">
  <VStack gap="$space-3">
    <HStack>
      <Button label="English" onClick="App.setLocale('en')" />
      <Button label="Deutsch" onClick="App.setLocale('de')" />
    </HStack>

    <Text variant="strong">{App.translate('title')}</Text>
    <Text>Number: {App.formatNumber(1234.5)}</Text>
    <Text>Currency: {App.formatCurrency(1234.5, 'EUR')}</Text>
    <Text>List: {App.formatList(['Ada', 'Lin', 'Sam'])}</Text>
    <Text>Relative: {App.formatRelativeTime(-3, 'day')}</Text>
  </VStack>
</App>
```

## Key points

**Format at render time**: Call the helpers in expressions so the output tracks the active locale reactively.

**Use currency codes, not symbols**: `App.formatCurrency(1234.5, 'EUR')` lets `Intl` decide symbol placement and separators.

**Use list formatting for natural conjunctions**: `App.formatList()` handles commas and words like `and` or `und` by locale.

**Use relative time for age and recency labels**: `App.formatRelativeTime(-3, 'day')` renders locale-aware phrases such as "3 days ago".

---

## See also

- [Render ICU plurals and selects](/docs/howto/render-icu-plurals-and-selects) — translate variable messages
- [Switch locale with inline bundles](/docs/howto/switch-locale-with-inline-bundles) — change `App.locale`
- [Internationalisation Foundations](/docs/managed-react/i18n-foundations) — formatter API list
