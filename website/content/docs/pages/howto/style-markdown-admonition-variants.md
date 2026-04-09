# Style Markdown admonition variants

Override colors and borders for note, tip, warning, and danger admonition blocks and blockquote styling.

Markdown admonitions are styled callout boxes rendered from the `> [!VARIANT]` syntax. Each variant (`info`, `warning`, `danger`, `tip`, `note`, `def`, `feat`, `card`) gets its own background and border vars. Base vars like `backgroundColor-Admonition-markdown` and `borderRadius-Admonition-markdown` apply to all variants and are overridden per-type with the `-{variant}` suffix.

```xmlui-pg copy display name="Markdown admonition theming"
---app display
<App>
  <Theme
    borderRadius-Admonition-markdown="6px"
    backgroundColor-Admonition-markdown-info="hsl(214,100%,97%)"
    borderColor-Admonition-markdown-info="hsl(214,100%,60%)"
    borderWidth-Admonition-markdown-info="1px"
    borderStyle-Admonition-markdown-info="solid"
    backgroundColor-Admonition-markdown-warning="hsl(38,100%,96%)"
    borderColor-Admonition-markdown-warning="$color-warn-400"
    borderWidth-Admonition-markdown-warning="1px"
    borderStyle-Admonition-markdown-warning="solid"
    backgroundColor-Admonition-markdown-danger="hsl(0,86%,97%)"
    borderColor-Admonition-markdown-danger="$color-danger-400"
    borderWidth-Admonition-markdown-danger="1px"
    borderStyle-Admonition-markdown-danger="solid"
    backgroundColor-Admonition-markdown-tip="hsl(150,60%,96%)"
    borderColor-Admonition-markdown-tip="$color-success-400"
    borderWidth-Admonition-markdown-tip="1px"
    borderStyle-Admonition-markdown-tip="solid"
    color-accent-Blockquote-markdown="$color-surface-300"
    width-accent-Blockquote-markdown="3px"
    backgroundColor-Blockquote-markdown="$color-surface-50"
  >
    <Markdown>
      <![CDATA[
> [!INFO]
> This is an **info** admonition for general notes.

> [!WARNING]
> This is a **warning** admonition for caution items.

> [!DANGER]
> This is a **danger** admonition for critical alerts.

> [!TIP]
> This is a **tip** admonition for helpful suggestions.

> A standard blockquote for comparison.
      ]]>
    </Markdown>
  </Theme>
</App>
```

## Key points

**Base vars apply to every admonition**: `backgroundColor-Admonition-markdown`, `borderRadius-Admonition-markdown`, and `padding-Admonition-markdown` set defaults inherited by all variants. Override specific ones per type with the `-{variant}` suffix.

**Per-variant vars follow the `-{variant}` suffix pattern**: `backgroundColor-Admonition-markdown-info`, `borderColor-Admonition-markdown-warning`, and `borderWidth-Admonition-markdown-danger` override just that variant. Built-in types are: `info`, `warning`, `danger`, `note`, `tip`, `card`, `feat`, `def`.

**Left-border style requires the full `borderWidth`/`Color`/`Style` trio**: Setting only `borderColor-Admonition-markdown-warning` without `borderStyle` leaves no visible border. Always pair color with width and style, or use the `border` shorthand.

**Blockquotes are themed separately**: Standard Markdown blockquotes (`>` without `[!TYPE]`) use `color-accent-Blockquote-markdown` (the left bar color), `width-accent-Blockquote-markdown`, and `backgroundColor-Blockquote-markdown`. These do not affect admonition blocks.

**Icon size is adjustable globally**: `size-icon-Admonition-markdown` controls the admonition icon's width and height. The icon itself reflects the variant type — only the size is overrideable via theme.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Render a Markdown file as a page](/docs/howto/render-a-markdown-file-as-a-page) — authoring Markdown content in XMLUI
- [Style Card and NoResult placeholders](/docs/howto/style-card-and-noresult-placeholders) — Card-level container theming
