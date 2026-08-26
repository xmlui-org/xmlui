---
"xmlui": patch
---

Add an opt-in `highlightHoveredColumn` prop to Table. When set to `true`, hovering a cell tints its entire column with the `backgroundColor-column-Table--hover` theme variable, using a CSS custom property written directly to the table root on cell hover so a horizontal traverse costs a style write rather than a re-render per cell. The default is `false`: no cell hover handlers are attached and the rendered output is unchanged. Where the hovered row and hovered column intersect, the row highlight wins; pinned columns keep their existing hover background instead of the column tint.
