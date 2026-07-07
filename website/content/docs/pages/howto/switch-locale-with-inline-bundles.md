# Switch locale with inline bundles

Use inline `localeBundles` when a small app or example can ship translations directly with the app.

Each bundle is a flat map of translation keys to ICU message patterns. `App.translate()` is useful inside expressions, while `<I18n>` is the declarative component form. Both update when `App.setLocale()` changes the active locale.

```xmlui-pg copy display name="Switch between English and German bundles" id="switch-between-english-and-german-bundles" height="320px"
---app display /App.locale/
<App
  localeBundles="{{
    en: {
      'greeting.hello': 'Hello, {name}!',
      'dashboard.title': 'Dashboard'
    },
    de: {
      'greeting.hello': 'Hallo, {name}!',
      'dashboard.title': 'Ubersicht'
    }
  }}">
  <VStack gap="$space-3">
    <HStack>
      <Button label="English" onClick="App.setLocale('en')" />
      <Button label="Deutsch" onClick="App.setLocale('de')" />
    </HStack>

    <Text variant="strong">{App.translate('dashboard.title')}</Text>
    <I18n key="greeting.hello" name="Ada" />
    <Text>Active locale: {App.locale}</Text>
  </VStack>
</App>
```

## Key points

**Provide one map per locale**: `localeBundles` accepts `{ en: { ... }, de: { ... } }`, where each inner object maps keys to ICU messages.

**Use `<I18n>` for visible messages**: Extra props on `<I18n>` become message variables, so `name="Ada"` fills `{name}`.

**Use `App.translate()` inside expressions**: It reads the same bundle store and active locale as `<I18n>`.

**Switch with `App.setLocale()`**: The active locale is reactive, so translated text updates without remounting the app. Do not pin `<App locale="...">` when users should be able to switch language themselves.

---

## See also

- [Register locale bundles at runtime](/docs/howto/register-locale-bundles-at-runtime) — load translations after startup
- [Render ICU plurals and selects](/docs/howto/render-icu-plurals-and-selects) — write variable messages
- [Internationalisation Foundations](/docs/managed-react/i18n-foundations) — locale resolution and bundle store details
