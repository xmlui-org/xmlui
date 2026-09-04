# Find the theme variable for a text

Identify the right `{property}-{part}-{Component}` theme var for any text-shaped part, even when the reference table doesn't list it.

A `ModalDialog` title wraps onto two lines and the spacing between them looks too loose. The obvious fix is a heading theme var — the title is big, bold text, so `lineHeight-H2` seems like the right lever:

```xmlui-pg copy display name="lineHeight-H2 does not reach the dialog title" height="320px"
---app display
<App>
  <variable name="isOpen" value="{true}" />
  <Theme lineHeight-H2="1">
    <ModalDialog
      id="demo"
      when="{isOpen}"
      onClose="isOpen = false"
      title="Confirm permanent deletion of every archived record older than seven years"
    >
      <Text>This action cannot be undone.</Text>
      <Button label="Dismiss" onClick="isOpen = false" />
    </ModalDialog>
  </Theme>
</App>
```

Nothing changes. The wrapped lines stay exactly as loosely spaced as before `lineHeight-H2` was set. There is no error, no warning — the var is accepted and simply does nothing, because the dialog's title was never a `Heading`.

## Why it fails silently

`ModalDialog`'s `title` prop renders as plain text inside the dialog's own markup — not as an `H2`, not as any `Heading` component. `lineHeight-H2` only reaches an actual `<Heading level="2">` (or `<H2>`); the title text is a different part of a different component, so the var has nothing to attach to. XMLUI doesn't warn about this because, from the engine's point of view, `lineHeight-H2` is a perfectly valid theme variable — it just isn't read by anything on this page.

## The method

**1. Identify the component and the part, not the visual role.** Read the markup, not the rendering. "Big bold text at the top of a dialog" is a visual role; `ModalDialog`'s `title` prop is the actual part. Every part-scoped theme var is built from the part, never from what the part looks like.

**2. Build the name from the part.** Part-scoped theme vars follow `{property}-{part}-{Component}` (see [Override a component's theme vars](/docs/howto/override-a-components-theme-vars)). The part name is documented per component — `ModalDialog`'s title part is `title`, so the line-height var is `lineHeight-title-ModalDialog`.

**3. Assume the whole text family is available.** Every part styled as text is wired up by the same internal mechanism (`textVars` in the theme engine), which generates a fixed family of CSS properties — color, font family, size, weight, line-height, letter-spacing, and more — for that part, all at once. A component's reference table normally lists only the vars it ships an explicit default for, so `lineHeight-title-ModalDialog` can be real and settable even though no reference page names it. Grepping the source for the literal string won't find it either — the name is assembled at build time from the part and property, not written out anywhere.

**4. Heading and Markdown vars are their own families.** `lineHeight-H2` reaches a real `Heading` (`<H2>` or `<Heading level="2">`). `lineHeight-H2-markdown` reaches an `H2`-level heading rendered by `<Markdown>` (see [Style per-level heading sizes](/docs/howto/style-per-level-heading-sizes)). Neither reaches a component's own title, label, or caption part — those are separate families entirely. A var from the wrong family is accepted and does nothing, which is exactly what makes this hard to debug: there's no error to search for.

Applying that name instead of the heading var fixes it:

```xmlui-pg copy display name="lineHeight-title-ModalDialog reaches the dialog title" height="320px"
---app display
<App>
  <variable name="isOpen" value="{true}" />
  <Theme lineHeight-title-ModalDialog="1">
    <ModalDialog
      id="demo"
      when="{isOpen}"
      onClose="isOpen = false"
      title="Confirm permanent deletion of every archived record older than seven years"
    >
      <Text>This action cannot be undone.</Text>
      <Button label="Dismiss" onClick="isOpen = false" />
    </ModalDialog>
  </Theme>
</App>
```

Same wrapped title, same two lines — now set tight instead of loose. Nothing else about the dialog changed; only the property name did.

## Key points

**Name the part, not the look.** `ModalDialog`'s title, a `Card`'s title, a form field's label — each is a specific part of a specific component. Find the part's name in that component's docs, then build `{property}-{part}-{Component}`.

**A part styled as text exposes the whole text-property family, not just what's defaulted.** `color`, `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform`, and the rest of the family are all generated together for a text part. A reference table that lists four vars for a part is usually reporting only the ones that ship a default — the rest still work, they're just undocumented on that page.

**`Heading`/`H1`–`H6` vars and `-markdown` heading vars are separate families from every other component's text parts.** They style real headings and Markdown-rendered headings only. A component's title, label, or caption is never a `Heading`, no matter how it's styled to look like one.

**When a theme var does nothing, the var is very likely for the wrong part or the wrong family — not broken.** XMLUI applies whatever var you name; it doesn't check whether the element you're picturing is actually the element that var affects.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — the `{property}-{part}-{Component}` naming convention
- [Style per-level heading sizes](/docs/howto/style-per-level-heading-sizes) — the `Heading` and `-markdown` var families this page warns you away from
- [Style ModalDialog overlay and parts](/docs/howto/style-modaldialog-overlay-and-parts) — the rest of `ModalDialog`'s documented theme vars
