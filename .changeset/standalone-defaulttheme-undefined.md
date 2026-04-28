---
"xmlui": patch
---

Fix standalone bundle regression where loading `Main.xmlui` without a `config.json` file crashed with "Cannot read properties of undefined (reading 'defaultTheme')". The standalone bootstrap now tolerates a missing config file, restoring the script-tag drop-in pattern (`<script src="xmlui-standalone.umd.js"></script>` + `Main.xmlui`) that worked in 0.12.15.
