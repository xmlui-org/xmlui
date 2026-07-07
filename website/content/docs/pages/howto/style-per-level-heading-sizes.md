# Style per-level Heading sizes

Configure per-level theme vars (h1–h6) for font-size, weight, line-height, and margin.

Each heading level (H1–H6) gets its own family of theme variables sharing the same property names with the level number as suffix. Set `fontSize-H1` through `fontSize-H6` to define a typographic scale, then use `textColor-Heading` as a single override for all six levels at once. Markdown-rendered headings respect their own `-markdown` suffixed variants, letting you keep a compact prose scale without affecting large display headings.

```xmlui-pg copy display name="Per-level heading size scale"
---app display
<App>
  <Theme
    textColor-Heading="#1e293b"
    fontSize-H1="2.25rem"
    fontWeight-H1="700"
    marginBottom-H1="0.25rem"
    fontSize-H2="1.5rem"
    fontWeight-H2="600"
    marginTop-H2="1.25rem"
    marginBottom-H2="0.25rem"
    fontSize-H3="1.2rem"
    fontWeight-H3="600"
    marginTop-H3="1rem"
    fontSize-H4="1rem"
    fontWeight-H4="600"
    textColor-H4="#475569"
  >
    <VStack>
      <H1>H1 — Page title</H1>
      <H2>H2 — Section heading</H2>
      <H3>H3 — Sub-section</H3>
      <H4>H4 — Minor heading</H4>
      <H5>H5 — Detail heading</H5>
      <H6>H6 — Fine print heading</H6>
    </VStack>
  </Theme>
</App>
```

## Key points

**`textColor-Heading` sets all six levels at once**: Use it as a global override when all headings should share one color. Per-level vars like `textColor-H2` take precedence when both are set, so you can override individual levels without repeating the global.

**Each level has independent `fontSize`, `fontWeight`, and margin vars**: Define a typographic scale with `fontSize-H1` through `fontSize-H6`. Use `marginTop-H{n}` and `marginBottom-H{n}` to control the whitespace rhythm around each level.

**Markdown-rendered headings use `-markdown` suffixes**: `fontSize-H2-markdown` and `marginTop-H2-markdown` only apply to headings inside a `<Markdown>` component. This lets you keep Markdown prose compact while display headings remain large.

**`fontFamily-H{n}` enables a display font for specific levels**: Set `fontFamily-H1` to a distinct font (loaded via a `resources` entry in your theme file) to give hero headings a different typeface from body text.

**Anchor link vars apply to all levels**: `color-anchor-Heading` and `gap-anchor-Heading` control the color and spacing of the `#` anchor icon shown next to headings when `showHeadingAnchors` is active.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Generate a table of contents](/docs/howto/generate-a-table-of-contents) — TableOfContents consumes your heading hierarchy
- [Define custom Text variants in a theme](/docs/howto/define-custom-text-variants-in-a-theme) — extend the type scale with named Text variants
