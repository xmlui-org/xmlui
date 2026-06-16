# Register locale bundles at runtime

Use `App.registerLocaleBundle()` when translations become available after the app has already rendered.

This is useful for lazy-loaded language packs, admin-authored copy, or plugin-provided translations. Register the bundle, then switch to that locale with `App.setLocale()`.

```xmlui-pg copy display name="Load a Spanish bundle from an action" id="load-a-spanish-bundle-from-an-action" height="320px"
---app display /App.locale/
<App
  localeBundles="{{
    en: { 'welcome': 'Welcome, {name}!' }
  }}">
  <VStack gap="$space-3">
    <HStack>
      <Button label="English" onClick="App.setLocale('en')" />
      <Button
        label="Load Spanish"
        onClick="() => {
          App.registerLocaleBundle({
            locale: 'es',
            messages: { 'welcome': 'Bienvenida, {name}!' }
          });
          App.setLocale('es');
        }"
      />
    </HStack>

    <I18n key="welcome" name="Ada" />
    <Text>Active locale: {App.locale}</Text>
  </VStack>
</App>
```

## Key points

**Register a `{ locale, messages }` bundle**: `messages` is the same flat key-to-message map used by inline `localeBundles`.

**Switch after registration**: Registering adds the bundle to the store; `App.setLocale('es')` makes it active.

**Use runtime registration for lazy language packs**: Keep startup bundles small and load additional locales only when users ask for them.

**Missing bundles do not break rendering**: If a locale has no bundle, translations fall back to their keys and XMLUI emits i18n diagnostics.

---

## See also

- [Switch locale with inline bundles](/docs/howto/switch-locale-with-inline-bundles) — define bundles at startup
- [Handle missing i18n translations](/docs/howto/handle-missing-i18n-translations) — design fallback behavior
- [Internationalisation Foundations](/docs/managed-react/i18n-foundations) — accepted bundle shapes
