---
"xmlui": patch
---

Add a `segments` property to `Text` for rendering pre-computed highlight spans, as an array of `{ text, hit, active }`. Content whose highlights are decided upstream — a full-text search snippet, whose marks fall on token boundaries that substring matching cannot reproduce — can now be rendered directly instead of through a hand-built stack of nested inline `Text` elements.
