---
"xmlui": patch
---

Theming sandbox W5-6 + W5-7 risk probe (plan #08 Phases 1 + 2): introduces the `ThemeVarMetadata.valueType` vocabulary (`color`/`length`/`integer`/`number`/`duration`/`easing`/`shadow`/`border`/`fontFamily`/`fontWeight`/`lineHeight`/`string` opt-out), ships a side-effect-free theme validator (`validateTheme`), a layout-prop validator (`validateInlineStyle` with a `zIndex` ceiling), and a `style`-prop token funnel (`validateStyleString` flagging `position: fixed|sticky`, `url(...)`, `!important`, and unknown declarations). Registers the `kind:"theming"` trace entry shape and documents the `strictTheming`, `allowInlineRawCss`, and `maxZIndex` appGlobals (defaults preserve current behaviour). No call sites are switched onto the validator yet — this ships the API surface so apps can adopt it incrementally before strict-mode enforcement lands.
