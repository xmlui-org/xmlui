---
"xmlui": patch
---

`StickyBox` now resolves its scroll parent deterministically.

The scroll parent was resolved from a `useRef` whose node is rendered further down
the component, so on first render the hook received `null`. A ref mutation does not
re-render and the resolved value was already `null`, so nothing re-ran the lookup:
`StickyBox` found its scroller only when something *else* happened to re-render it
after mount. Everything it gates — stickiness, and the children themselves — rode on
that incidental re-render.

The sentinel is now a callback ref, matching the pattern the component already used
for its wrapper, so mounting the node re-runs the lookup on its own.

No API change. This is a robustness fix for a timing hazard; it is not a
demonstrated fix for xmlui-org/xmlui#2864, whose reported symptom did not reproduce
across six nesting and data-timing configurations — those configurations are now
covered by the component's first spec file.
