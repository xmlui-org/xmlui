---
"xmlui": patch
---

Add `allowConsole` appGlobals switch (default `true`). Previously `window.console` access in expressions always produced an `[XMLUI sandbox]` warning; now it is permitted by default. Set `appGlobals.allowConsole: false` to restore the sandboxed behaviour (warn or throw per `strictDomSandbox`).
