# Stop a `width="*"` element from collapsing next to a flexible sibling

A `width="*"` child takes the **remaining** space in a stack — the parent's
size minus the sizes of siblings that have a definite width. The trap: if a
sibling has **no width**, its *intrinsic* (content) width is subtracted first,
and if that content is wide or variable, the `width="*"` element gets squeezed
— sometimes down to a thin strip.

The fix is to give the other sibling a **definite width** (a fixed size, or
`fit-content` so it hugs its content) so the `*` element has a stable, known
share of the row.

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
everything else. Remove the `width="8rem"` and the column's own intrinsic
width is subtracted first — the field can collapse to a sliver, which is the
usual "my `width="*"` input shrank to nothing" symptom.

**Hug content instead of a fixed size.** When you don't want to hard-code a
width, `width="fit-content"` makes a container take *only* its content's
width, leaving the rest of the row for the `*` element:

```xmlui /width="fit-content"/
<HStack width="100%">
  <Text value="Grows to fill" width="*" />
  <Badge value="hugs" width="fit-content" />
</HStack>
```

**Rules of thumb:**

- In a row, give **every** child either a definite width, `fit-content`, or
  `width="*"` — don't leave a content-sized sibling next to a `*` sibling and
  expect the `*` to win.
- `fit-content` = "only as wide as my content." `width="*"` = "the rest."
  A fixed value (`8rem`, `120px`) = exactly that.
- Same rule applies vertically with `height`. See also
  [Set the width of an input field in an HStack](/docs/howto/set-width-for-input-fields-in-a-horizontal-layout)
  and the star-size explanation in [Layout](/docs/layout).
