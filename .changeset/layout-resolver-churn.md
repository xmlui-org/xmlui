---
"xmlui": patch
---

The layout resolver now does work only for the layout properties a component actually sets. It used to build and look up keys for all ~96 layout properties, at every breakpoint, for every component on every render. Output is unchanged; on a 50-row test app this cuts startup allocation by about 90 MB (#3969).
