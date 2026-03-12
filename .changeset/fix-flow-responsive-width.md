---
"xmlui": patch
---

Fix responsive width properties (e.g. `width-md`) not working on FlowLayout/HStack-wrap children; eliminate layout flash by using CSS @media rules instead of JS-based sizeIndex detection
