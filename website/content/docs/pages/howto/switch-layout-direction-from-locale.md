# Switch layout direction from locale

Use `direction="auto"` when the active locale should decide whether the app renders left-to-right or right-to-left.

Arabic, Hebrew, Persian, and Urdu are right-to-left languages. With automatic direction, switching to one of those locales updates `App.direction` and sets the root document direction.

```xmlui-pg copy display name="Switch direction automatically from locale" id="switch-direction-automatically-from-locale" height="340px"
---app display /App.locale/ /App.direction/
<App
  direction="auto"
  localeBundles="{{
    en: { 'heading': 'Account settings' },
    ar: { 'heading': 'اعدادات الحساب' }
  }}">
  <VStack gap="$space-3">
    <HStack>
      <Button label="English" onClick="App.setLocale('en')" />
      <Button label="Arabic" onClick="App.setLocale('ar')" />
    </HStack>

    <Text variant="strong">{App.translate('heading')}</Text>
    <Text>Locale: {App.locale}</Text>
    <Text>Direction: {App.direction}</Text>
  </VStack>
</App>
```

## Key points

**Use `direction="auto"` at the app root**: XMLUI derives `ltr` or `rtl` from the active locale.

**Switching locale switches direction**: `App.setLocale('ar')` changes both translations and layout direction.

**Built-ins use logical CSS properties**: XMLUI components are designed to mirror without per-component overrides.

**Override only when necessary**: Use explicit `direction="ltr"` or `direction="rtl"` when a particular app or subtree must ignore locale-derived direction.

---

## See also

- [Set a right-to-left layout direction](/docs/howto/set-a-right-to-left-layout-direction) — static RTL layout
- [Switch locale with inline bundles](/docs/howto/switch-locale-with-inline-bundles) — locale switching basics
- [Internationalisation Foundations](/docs/managed-react/i18n-foundations) — RTL contract details
