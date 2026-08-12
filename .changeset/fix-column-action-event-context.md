---
"xmlui": patch
---

Fix typed Column action events so nested APICall, FileDownload, and FileUpload handlers receive row context variables such as `$item`, `$row`, and `$cell`.
