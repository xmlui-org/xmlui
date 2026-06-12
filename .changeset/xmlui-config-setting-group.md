---
"xmlui": patch
---

Add `xmluiConfig` as a dedicated setting group for framework / runtime configuration.

Apps can now place framework settings (e.g. `useHashBasedRouting`, `disableInlineStyle`, `xsVerbose`, the `strict*` family) under a separate `xmluiConfig` key in their app description instead of mixing them with application-specific values in `appGlobals`. The engine merges both objects — `xmluiConfig` wins on conflict — so existing apps that keep framework settings under `appGlobals` continue to work without any changes.

New exports:
- `mergeXmluiConfig(appGlobals, xmluiConfig)` — pure helper that returns a frozen merged object.
- `useXmluiConfig()` — React hook returning the merged framework config view.
- `useAppGlobals()` — React hook returning the raw `appGlobals` object (for app-specific values).
