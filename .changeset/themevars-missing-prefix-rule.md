---
"xmlui": patch
---

Plan #02 (themevars namespace) — Activate the `theming-missing-prefix`
analyzer rule. The rule walks `style`/`vars` attribute values and flags
two cases: theme-variable references whose package prefix is not
registered (e.g. `--xmlui-color-Animation_Button` → suggests
`Animations_…`), and references that omit a required prefix when the
bare component name unambiguously names a prefixed extension component
(e.g. `--xmlui-color-Viewer` → suggests `Pdf_Viewer`). The rule's
`defaultSeverity` is `info` (`warn` in strict mode); the canonical
prefix table lives in `components-core/themevars/prefix-registry.ts`.
Extension packages declare their prefix on
`Extension.themeNamespacePrefix`, which is now plumbed through
`ComponentRegistryEntry.themeNamespacePrefix` so the rule can resolve
bare → prefixed mappings.
