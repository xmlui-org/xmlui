# Handle missing i18n translations

Design missing translation behavior so the UI stays usable while diagnostics point to the broken key or ICU pattern.

In non-strict mode, XMLUI does not throw when a translation key is absent or an ICU pattern cannot be formatted. It emits an i18n diagnostic and renders the key as a visible fallback.

```xmlui-pg copy display name="Show fallback text for missing i18n messages" id="show-fallback-text-for-missing-i18n-messages" height="320px"
---app display /App.locale/
<App
  locale="en"
  localeBundles="{{
    en: {
      'profile.title': 'Profile',
      'broken.items': '{count, plural, one {# item}}'
    }
  }}">
  <VStack gap="$space-3">
    <Text variant="strong">{App.translate('profile.title')}</Text>
    <Text>Missing key: {App.translate('profile.subtitle')}</Text>
    <Text>Broken ICU: {App.translate('broken.items', { count: 2 })}</Text>
  </VStack>
</App>
```

## Key points

**Missing keys render the key**: `App.translate('profile.subtitle')` falls back to `profile.subtitle`, making the problem visible without blanking the UI.

**Invalid ICU patterns also fall back to the key**: The example's plural message has no `other` branch, so it renders `broken.items` and emits an `icu-parse-error` diagnostic.

**Use diagnostics during development**: Inspector can show `missing-key` and `icu-parse-error` entries with locale and key details.

**Turn on strict diagnostics in development**: Set `xmluiConfig.strictI18n` to escalate i18n diagnostics from warnings to errors in logs and tooling. The visible fallback still keeps the page inspectable.

```json
{
  "xmluiConfig": {
    "strictI18n": true,
    "defaultLocale": "en"
  }
}
```

---

## See also

- [Collect global errors with App onError](/docs/howto/collect-global-errors-with-app-onerror) — app-level structured error handling
- [Switch locale with inline bundles](/docs/howto/switch-locale-with-inline-bundles) — provide bundles
- [Internationalisation Foundations](/docs/managed-react/i18n-foundations) — i18n diagnostics and strict mode
