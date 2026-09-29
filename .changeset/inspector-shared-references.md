---
"xmlui": patch
---

Fix: Inspector trace logs and exports no longer record shared (non-circular) references as `"[Circular]"`. An object reached through several paths, such as a record repeated in a DataSource result, is now serialized in full at each occurrence; only a true cycle is marked `"[Circular]"`. For very large shared structures, repeats past an expansion budget are marked `"[Shared]"`.
