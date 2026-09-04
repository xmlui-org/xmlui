# Use `ch` when width should track character count

Use `width="Nch"` when the useful way to describe a box is “make room for
about N character positions in this font.” It is especially useful for
monospace content—file paths, code, identifiers, terminal output—because
every character occupies the same width.

Choose the sizing rule that matches the job:

| Goal | Use |
| --- | --- |
| Reserve about N character positions in a chosen font | `width="Nch"` |
| Hug the text or components actually rendered | `width="fit-content"` |
| Keep a layout width tied to the application's root text scale | `rem` |
| Take whatever space the parent has left | `width="*"` |

`ch` does not inspect or count the content. It is a font-relative ruler: one
`ch` is the width of that font's `0` glyph. In a monospace font, that ruler
maps directly to character positions. In a proportional font it is only an
estimate, because other glyphs may be wider or narrower than `0`.

## Put the font and the `ch` width on one wrapper

For a monospace path column, put both the measuring font and `width="Nch"`
on a shared wrapper. Let its header and values fill that wrapper:

```xmlui-pg copy display name="One wrapper sets the column width" id="one-wrapper-sets-column-width" height="160px"
<App>
  <VStack
    testId="path-column"
    width="24ch"
    fontFamily="monospace"
    backgroundColor="$color-surface-200"
    padding="$space-2"
    gap="$space-1"
  >
    <Text
      testId="path-heading"
      width="100%"
      fontFamily="sans-serif"
      fontWeight="$fontWeight-bold"
      value="Path"
    />
    <Text testId="path-value" width="100%" value="src/components/Button.tsx" />
  </VStack>
</App>
```

The wrapper's `fontFamily="monospace"` determines what `24ch` means. The
header may use a different font without changing the column's physical width,
because both children take `100%` of the already-sized wrapper.

The child widths are not inherited from the wrapper—CSS width does not
inherit. They fill the wrapper because their own widths are `100%`. A
`VStack` also uses `itemWidth="100%"` for widthless direct children by
default, but writing the child widths here makes the recipe explicit.

## What controls the physical width

The element carrying `width="24ch"` supplies the font context. Change that
element's font and the physical width changes; change only its child text and
the width does not.

Font-relative units work on layout components as well as text components.
XMLUI passes `ch`, `em`, `ex`, and `rem` dimension values through to
CSS; the browser resolves them using the font context of the component that
owns the width or height.

## Why separate `ch` widths may not align

If a proportional header and a monospace value each declare
`width="20ch"`, each box measures its own font's `0`. The numbers match,
but the physical widths do not:

```xmlui-pg copy display name="Same ch count, different fonts" id="same-ch-count-different-fonts" height="140px"
<App>
  <VStack gap="$space-2">
    <Text
      testId="caption-20ch"
      width="20ch"
      fontFamily="sans-serif"
      value="Path"
      backgroundColor="$color-primary-200"
      padding="$space-1"
    />
    <Text
      testId="code-20ch"
      width="20ch"
      fontFamily="monospace"
      value="index.ts"
      backgroundColor="$color-surface-200"
      padding="$space-1"
    />
  </VStack>
</App>
```

This is a box-sizing mismatch, not text alignment inside the boxes.
`textAlign` cannot fix it. Measure once on the shared wrapper instead of
measuring the header and value independently.

## If a `ch` width looks ignored, check the binding

A valid font-relative width works on a `VStack`. An invalid interpolated
value can produce CSS such as `undefinedch`; the browser discards that width
without an XMLUI error, leaving the component to use its normal layout width.

The fixed-width parent below makes the fallback visible. The literal
`width="24ch"` child stays compact, while the invalid child fills the
parent:

```xmlui-pg copy display name="Valid and invalid ch bindings" id="valid-and-invalid-ch-bindings" height="190px"
<App var.charCount="{undefined}">
  <VStack testId="binding-parent" width="520px" gap="$space-2">
    <VStack
      testId="valid-width"
      width="24ch"
      fontFamily="monospace"
      backgroundColor="$color-primary-200"
      padding="$space-1"
    >
      <Text value="valid: 24ch" />
    </VStack>
    <VStack
      testId="invalid-width"
      width="{charCount}ch"
      minWidth="14rem"
      backgroundColor="$color-surface-200"
      padding="$space-1"
    >
      <Text value="invalid: fills the parent" />
    </VStack>
  </VStack>
</App>
```

`minWidth` is only a floor; it cannot repair an invalid `width`. If a
container appears to ignore `ch`, check the string produced by the binding
before changing the layout.

## Other font-relative units

| Unit | Resolves against | Good fit |
| --- | --- | --- |
| `ch` | The `0` glyph of this element's computed font | Monospace columns and character-position estimates |
| `em` | This element's computed font size when used for width or spacing | Control geometry that should scale with its local text |
| `rem` | The root element's font size | App-wide measurements that should ignore nested font changes |
| `ex` | The x-height of this element's computed font | Specialized typographic alignment |

When `em` is used to set `fontSize` itself, it resolves against the
parent's font size. For layout properties such as `width`, it uses the
element's own computed font size.

Use `ch` for the monospace path-column case because changing that font also
updates the column width. Use `em` when a box should scale with its local
text. Use `rem` when a layout measurement should remain consistent across
components with different fonts or font sizes; it still scales when the
application's root font size changes.

## See also

- [Size Values](/docs/styles-and-themes/common-units#size) — the complete
  size-unit reference
- [Layout Properties](/docs/styles-and-themes/layout-props) — `width`,
  `minWidth`, and `fontFamily`
- [Make a component hug its content with `fit-content`](/docs/howto/know-when-to-use-fit-content) —
  size a box from its rendered content instead of a character count
- [Auto-size column widths with star](/docs/howto/auto-size-column-widths-with-star) —
  divide remaining space instead of choosing an intrinsic unit
