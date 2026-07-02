# I18n Source-Preserving Migration Findings (2026-07-01)

## Source Of Truth

- Component metadata/rendering: `/Users/dotneteer/source/xmlui/xmlui/src/components/I18n/I18n.tsx`
- Core i18n helpers: `/Users/dotneteer/source/xmlui/xmlui/src/components-core/i18n`
- App context contract: `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/AppContextDefs.ts`
- Built-in XMLUI messages: `/Users/dotneteer/source/xmlui/xmlui/src/components-core/i18n/builtin-bundles/xmlui-en.ts`

## Preserved Behavior

- `I18n` accepts arbitrary props. All props except `key` become ICU variables; leading `:` is stripped from variable names.
- Component-valued props/slots can replace translated placeholders of the form `<slotName/>`.
- Missing slot placeholders remain literal translated text instead of disappearing.
- Missing translation keys return the key.
- `App.translate(key, vars)` must work in child expressions during first render, not only after an effect.
- `App.setLocale(locale)` must notify subscribed `I18n` components so rendered text updates.
- Locale bundles support both locale maps and old `{ locale, messages }` bundle objects, with exact-locale and language fallback.
- When App omits `locale`, the active locale is resolved from persisted
  `xmlui.locale`, then browser languages constrained by the available bundles,
  before falling back to English. An App `locale` prop is an explicit app
  override, not a metadata default.

## Implementation Notes

- The runtime i18n implementation lives in `xmlui/src/runtime/i18n.ts`, but the old public helper path is preserved by `xmlui/src/components-core/i18n/index.ts`.
- App uses a non-notifying render-time i18n config seed so descendants can call `App.translate(...)` immediately. Runtime/user locale changes still notify subscribers.
- Built-in XMLUI English messages are registered by default so framework-owned text can use the same translation substrate later.
- The focused browser fixture uses the supported XMLUI locale-map syntax; the old `{ locale, messages }` bundle object shape is covered in the core unit test.
- The App metadata must not provide `defaultValue: "en"` for `locale`; doing so
  causes the renderer adapter to pass an authored-looking prop and bypass the
  original navigator/default locale resolver.
- `App.setLocale(...)` persists to the original default `xmlui.locale`
  localStorage key. Startup resolves that persisted value before navigator
  languages, matching the old App context path.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/I18n/I18n.spec.ts --workers=1`
- `npx vitest run xmlui/tests/compiler/i18n.test.ts`
- `npm --prefix xmlui run check:metadata`
- `npm --workspace xmlui run build`

## Reusable Lesson

For nonvisual App services, source compatibility can require separating synchronous config seeding from reactive notifications. Seed before child expressions render, but only notify `useSyncExternalStore` subscribers on actual runtime state changes.

Do not add metadata defaults for props whose old source treated omission as a
distinct state. In this case, omitted `locale` meant "resolve from App/user/
persisted/browser/default policy", while a default `"en"` became a hard app
override and broke locale negotiation.
