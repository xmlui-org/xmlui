---
---

chore: regenerate the language-server metadata snapshot for `MenuItem`'s new `target` property.

`src/language-server/xmlui-metadata-generated.js` is a build artifact of the component metadata, checked in and verified by the `check:metadata-snapshot` CI step. Adding `MenuItem.target` (and rewording `MenuItem.to`) left it stale, so that step failed. No behaviour changes — the release note for the change itself is in the accompanying `menuitem-to-renders-a-real-link` changeset, which is still unreleased, so this lands in the same release.
