# Render ICU plurals and selects

Use International Components for Unicode (ICU) message patterns when one translation needs
grammar based on a number or a state.

Plural and select messages keep grammar in the translation bundle instead of spreading conditional text through your markup.

```xmlui-pg copy display name="Render cart count and shipping status messages" id="render-cart-count-and-shipping-status-messages" height="340px"
---app display /count/ /status/
<App
  var.count="{1}"
  var.status="ready"
  localeBundles="{{
    en: {
      'cart.items': '{count, plural, one {# item} other {# items}} in cart',
      'order.status': '{status, select, ready {Ready to ship} delayed {Delayed by weather} other {Status unknown}}'
    },
    de: {
      'cart.items': '{count, plural, one {# Artikel} other {# Artikel}} im Warenkorb',
      'order.status': '{status, select, ready {Versandbereit} delayed {Durch Wetter verzogert} other {Status unbekannt}}'
    }
  }}">
  <VStack gap="$space-3">
    <HStack>
      <Button label="One item" onClick="count = 1" />
      <Button label="Five items" onClick="count = 5" />
      <Button label="Ready" onClick="status = 'ready'" />
      <Button label="Delayed" onClick="status = 'delayed'" />
      <Button label="English" onClick="App.setLocale('en')" />
      <Button label="Deutsch" onClick="App.setLocale('de')" />
    </HStack>

    <VStack gap="$space-2">
      <HStack gap="$space-1">
        <Text>Cart:</Text>
        <I18n key="cart.items" count="{count}" />
      </HStack>
      <HStack gap="$space-1">
        <Text>Status:</Text>
        <I18n key="order.status" status="{status}" />
      </HStack>
    </VStack>
  </VStack>
</App>
```

## Key points

**Use `plural` for counts**: The `one` and `other` branches are selected through `Intl.PluralRules` for the active locale.

**Use `select` for named states**: The `status` value chooses a branch, with `other` as the required fallback.

**Keep grammar in bundles**: Translators can change word order and phrasing without touching XMLUI markup.

**Switching locale re-renders ICU output**: The same `count` and `status` variables are formatted through the active bundle.

**Separate adjacent messages**: Wrap separate `<I18n>` outputs in layout or text components so translations do not run together.

---

## See also

- [Switch locale with inline bundles](/docs/howto/switch-locale-with-inline-bundles) — basic bundle setup
- [Format values for the active locale](/docs/howto/format-values-for-the-active-locale) — use `Intl`-backed formatters
- [I18n component](/docs/reference/components/I18n) — render translated messages from locale bundles
- [App component](/docs/reference/components/App) — `locale`, `localeBundles`, and `direction` properties
- [Internationalisation Foundations](/docs/managed-react/i18n-foundations) — ICU runtime behavior
