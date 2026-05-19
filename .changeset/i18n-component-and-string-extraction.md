---
"xmlui": patch
---

**Plan #11 Phase 2.2 + Phase 2.3 — `<I18n>` component and framework-string extraction**

- **`<I18n>` component** (`components/I18n/`): renders translated messages from the active
  locale bundle; supports variable props (`:name="{expr}"` syntax) and named slot
  placeholders (`<link/>` patterns) for inline markup. Now documented in `I18n.md`.

- **Built-in English bundle** (`i18n/builtin-bundles/xmlui-en.ts`): expanded with all
  framework-emitted string keys:
  - `xmlui.select.searchPlaceholder`
  - `xmlui.drawer.ariaLabel`, `xmlui.drawer.closeAriaLabel`
  - `xmlui.modal.closeAriaLabel`
  - `xmlui.validation.email`, `.url`, `.phone`, `.isoDate`, `.length`, `.iban`,
    `.creditCard`, `.strongPassword`, `.noLeadingTrailingWhitespace`

- **SelectReact**: search-input placeholder now resolved via `App.translate()`.
- **DrawerReact**: panel and close-button `aria-label` attributes now resolved via
  `App.translate()`.
- **Validator builtins** (`forms/builtins/`): all nine built-in validators now return
  their `xmlui.validation.*` key as the failure message instead of a hardcoded English
  literal; `ValidationWrapper` translates any `xmlui.*` message at render time, so the
  English fallback is still shown when no bundle override is loaded.
