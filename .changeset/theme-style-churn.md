---
"xmlui": patch
---

Each component's theme-variable class is now built once per component type and theme scope and shared, instead of rebuilt for every instance. The style registry also recognizes a style object it has already seen without serializing it again. Generated class names and CSS are unchanged; in WebKit the per-instance cost of the theme class was about 0.125 MB (#3969).
