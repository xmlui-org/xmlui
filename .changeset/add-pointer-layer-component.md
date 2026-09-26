---
"xmlui": patch
---

Add an experimental PointerLayer component that draws live, fading ink over its children while a modifier key is held (freehand strokes, or line, arrow, rectangle, ellipse and pointer-ring shapes), and reports pointer movement, finished strokes and finished shapes as events in normalized coordinates. Trace payloads that components attach to native events are now deep-copied, so nested values such as a stroke's points survive the Inspector export.
