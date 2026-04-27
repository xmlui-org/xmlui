---
"xmlui": patch
---

Introduce the shared semantic theme tokens `borderColor-outlined`,
`borderColor-outlined--hover`, `borderColor-outlined--active` and
`borderColor-outlined--focus` and add a `variant="outlined"` flavour to
`Select`. An outlined `Button` (with the default `primary` theme color) and a
`Select` declared with `variant="outlined"` now resolve to the same border
color, so they always visually match — and overriding `borderColor-outlined`
in a custom theme updates both at once.

The outlined variant on form inputs is intentionally narrow: it only rebinds
the border color (and its hover/focus states); padding, background and
typography are unchanged. Existing markup is unaffected because `variant` is
a new opt-in prop and Button's resolved colors are preserved by the new token
defaults.
