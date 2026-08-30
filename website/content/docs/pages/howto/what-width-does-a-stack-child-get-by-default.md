# What Width Does a Stack Child Get by Default?

In a horizontal `Stack` or an `HStack`, the default `itemWidth` is
`fit-content`. A direct child with no `width` therefore takes its content width.
A `width="*"` sibling receives the space left after those content-sized children
and the gaps between them have been measured.

In a vertical `Stack` or `VStack`, the default `itemWidth` is `100%`, so
widthless direct children fill the Stack across the horizontal axis.

This default belongs to the parent Stack. It is the same for `Text`, nested
Stacks, inputs, images, and other direct children. The component type still
matters because it determines the child's intrinsic size:

| Widthless direct child | What contributes to its default width |
| --- | --- |
| `Text` or a nested Stack | Its content, padding, and borders |
| Input such as `TextBox` | The input's intrinsic or minimum usable width |
| `Image` | Its resolved image size; give it a width or an aspect ratio when that size must be predictable before loading |

With a star-sized sibling, the common horizontal combinations are:

| Child widths | Result |
| --- | --- |
| no width + `*` | the widthless child hugs its content; the star gets the remainder |
| `fit-content` + `*` | the same layout, stated explicitly |
| `*` + `*` | the children share the available width equally |
| `2*` + `*` | the children split the available width in a 2:1 ratio |

The following rows compare a widthless label zone, an explicit
`fit-content` label zone, and two star-sized zones. In the first two rows, the
label takes the same content width and the first zone gets the remainder. In
the third, both star-sized zones share the available width equally.

```xmlui-pg name="Default, fit-content, and star widths" id="default-fit-content-and-star-widths" copy display
<App>
  <VStack width="100%" gap="$space-4">
    <HStack width="100%" gap="$space-2">
      <HStack testId="default-star" width="*" backgroundColor="$color-surface-100" padding="$space-2">
        <Text value="The star-sized zone gets the remaining width" />
      </HStack>
      <HStack testId="default-label" padding="$space-2">
        <Text value="Status" />
      </HStack>
    </HStack>

    <HStack width="100%" gap="$space-2">
      <HStack testId="explicit-star" width="*" backgroundColor="$color-surface-100" padding="$space-2">
        <Text value="Explicit fit-content behaves the same here" />
      </HStack>
      <HStack testId="explicit-label" width="fit-content" padding="$space-2">
        <Text value="Status" />
      </HStack>
    </HStack>

    <HStack width="100%" gap="$space-2">
      <HStack testId="first-star" width="*" backgroundColor="$color-surface-100" padding="$space-2">
        <Text value="First star" />
      </HStack>
      <HStack testId="second-star" width="*" backgroundColor="$color-surface-100" padding="$space-2">
        <Text value="Second star" />
      </HStack>
    </HStack>
  </VStack>
</App>
```

## When to write `fit-content`

For a widthless child in an `HStack`, `width="fit-content"` usually makes the
default explicit; it does not change the layout. Write it when you want to
communicate that the child must hug its content, or when the child can also be
used under a parent whose `itemWidth` is not `fit-content`.

Long unbreakable text, a wide input, or an image whose natural size is large
can consume most of the row before the remaining space is assigned.
`fit-content` does not cap that intrinsic width; use `maxWidth`, a fixed width,
wrapping, or truncation on the content-sized child when a cap is required. Add
`minWidth` to the star-sized child when it must not collapse below a usable
size.

To size every direct child alike, set `itemWidth` on the parent. An explicit
`width` on a child overrides that default.

## See also

- [Set the width of an input field in an HStack](/docs/howto/set-width-for-input-fields-in-a-horizontal-layout)
- [Keep a star-sized element from collapsing](/docs/howto/keep-a-star-sized-element-from-collapsing)
- [Wrap items across multiple rows](/docs/howto/wrap-items-across-multiple-rows)
- [Layout](/docs/layout)
