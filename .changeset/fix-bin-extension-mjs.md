---
"xmlui": patch
---

Fix CLI bin path in published package: the `clean-package` replacement now correctly points to `dist/nodejs/bin/index.mjs` (the actual ESM output from tsdown) instead of the incorrect `dist/nodejs/bin/index.js`. This mismatch prevented `npm` from creating the `xmlui` symlink in `.bin` during install.
