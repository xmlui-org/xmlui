# Stop a `width="*"` element from collapsing next to a flexible sibling

A `width="*"` child takes the **remaining** space in a stack. In an `HStack`,
a sibling with no width defaults to `fit-content`, so its intrinsic content
width is measured first. A short label normally hugs its content and leaves
the rest of the row to the star-sized child. The trap appears when that
intrinsic width is large or variable: it can leave the `width="*"` child only
a thin strip.

The fix is to bound the other sibling with a fixed width, `maxWidth`, wrapping,
or truncation so the `*` element has a stable, known share of the row.
`width="fit-content"` documents the default for a widthless `HStack` child,
but by itself does not cap wide intrinsic content.

```xmlui-pg copy display name="Flexible input beside a fixed button column" height="200px"
<App>
  <HStack width="100%" verticalAlignment="center">
    <TextBox initialValue="This field fills the row" width="*" />
    <VStack width="8rem" itemWidth="fit-content" gap="$space-1">
      <Button label="Send" />
      <Button label="Skip" />
    </VStack>
  </HStack>
</App>
```

Here the button column is pinned to `8rem`, so the `TextBox` reliably fills
everything else. Without that bound, the column defaults to its content width;
if the content becomes wide enough, the field can collapse to a sliver.

**Make content sizing explicit.** `width="fit-content"` says that a container
should take its content width. That is already the default for a widthless
child in an `HStack`, but writing it can clarify the intended contract:

```xmlui /width="fit-content"/
<HStack width="100%">
  <Text value="Grows to fill" width="*" />
  <Badge value="hugs" width="fit-content" />
</HStack>
```

**Rules of thumb:**

- A short widthless label beside a `width="*"` sibling is normally safe: the
  label hugs its content and the star gets the remainder.
- Bound content whose intrinsic width can grow. `fit-content` makes the sizing
  intent explicit but does not impose a maximum.
- `fit-content` = "only as wide as my content." `width="*"` = "the rest."
  A fixed value (`8rem`, `120px`) = exactly that.
- The same sizing principle applies vertically with `height`. See also
  [What width does a Stack child get by default?](/docs/howto/what-width-does-a-stack-child-get-by-default),
  [Set the width of an input field in an HStack](/docs/howto/set-width-for-input-fields-in-a-horizontal-layout),
  and the star-size explanation in [Layout](/docs/layout).
