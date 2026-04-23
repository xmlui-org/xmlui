---
"xmlui-pdf": patch
---

Fix the PDF component failing with `No "GlobalWorkerOptions.workerSrc" specified.` after the recent component refactor accidentally dropped the worker registration.
