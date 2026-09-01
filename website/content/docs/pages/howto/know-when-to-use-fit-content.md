# Make a component hug its content with `fit-content`

Use `width="fit-content"` when a component is wider than its content and you
want the box to shrink to the content's natural width. If the component already
hugs its content, adding `fit-content` changes nothing.

Start with the dimension you want to change, not the stack direction:

| What should hug? | Property |
| --- | --- |
| The component, left to right | `width="fit-content"` |
| The component, top to bottom | `height="fit-content"` |
| Every direct child of a stack, left to right | `itemWidth="fit-content"` on the parent |

This page focuses on width. `HStack` and `VStack` do not give `fit-content`
different meanings; they only use different defaults when a child has no
explicit width.

## Use it when a child fills but should hug

A `VStack` normally makes its direct children fill the available width. Set
`width="fit-content"` on the child that should be compact:

```xmlui-pg copy display name="Make one child hug its content" id="make-one-child-hug" height="180px"
<App>
  <VStack width="420px" gap="$space-3">
    <Text
      testId="filled-child"
      value="No width: fills the VStack"
      backgroundColor="$color-surface-200"
      padding="$space-2"
    />
    <Text
      testId="hugged-child"
      width="fit-content"
      value="fit-content: hugs"
      backgroundColor="$color-primary-200"
      padding="$space-2"
    />
  </VStack>
</App>
```

This is the ordinary reason to write `fit-content`: the parent's default made
the box wider than you wanted, so the child overrides that default.

## In an `HStack`, most children already hug

An `HStack` normally gives widthless children their content width. These two
labels therefore have the same width; the explicit `fit-content` is harmless
but redundant:

```xmlui-pg copy display name="HStack children already hug" id="hstack-children-already-hug" height="140px"
<App>
  <HStack gap="$space-3">
    <Text
      testId="row-default"
      value="Status"
      backgroundColor="$color-surface-200"
      padding="$space-2"
    />
    <Text
      testId="row-explicit"
      width="fit-content"
      value="Status"
      backgroundColor="$color-primary-200"
      padding="$space-2"
    />
  </HStack>
</App>
```

So there is no general rule that horizontal layouts *need* `fit-content` and
vertical layouts do not. The practical rule is simpler: add it only when a box
is filling space that you want it to hug.

## The XMLUI-specific trap: a nested `VStack` in an `HStack`

There is one important exception to the usual `HStack` default. XMLUI treats a
widthless `VStack` or `CVStack` inside an `HStack` as a flexible column and
lets it expand across the row. That can squeeze a `width="*"` sibling even when
the column contains only a short label.

The first row shows that behavior. The second puts `width="fit-content"` on the
nested `VStack`, so the column hugs and the starred sibling receives the
remainder:

```xmlui-pg copy display name="Make a nested VStack hug" id="make-a-nested-vstack-hug" height="220px"
<App>
  <VStack gap="$space-3">
    <HStack gap="$space-2">
      <Text
        testId="nested-victim"
        width="*"
        value="star, squeezed"
        backgroundColor="$color-primary-200"
        padding="$space-2"
      />
      <VStack
        testId="nested-greedy"
        backgroundColor="$color-surface-200"
        padding="$space-2"
      >
        <Text value="Hi" />
      </VStack>
    </HStack>
    <HStack gap="$space-2">
      <Text
        testId="nested-restored"
        width="*"
        value="star, restored"
        backgroundColor="$color-primary-200"
        padding="$space-2"
      />
      <VStack
        testId="nested-hugged"
        width="fit-content"
        backgroundColor="$color-surface-200"
        padding="$space-2"
      >
        <Text value="Hi" />
      </VStack>
    </HStack>
  </VStack>
</App>
```

If a starred child unexpectedly collapses beside a nested column, this is the
first fix to try.

## Use `itemWidth` when every child should hug

`width` changes one component. `itemWidth` is the parent's shorthand for its
direct children. A child with its own explicit `width` still wins.

```xmlui-pg copy display name="Make every VStack child hug" id="make-every-vstack-child-hug" height="240px"
<App>
  <HStack gap="$space-4">
    <VStack width="*" gap="$space-1">
      <Text value="VStack default" />
      <Text testId="group-filled" value="fills" backgroundColor="$color-surface-200" padding="$space-1" />
      <Text value="also fills" backgroundColor="$color-surface-200" padding="$space-1" />
    </VStack>
    <VStack width="*" itemWidth="fit-content" gap="$space-1">
      <Text value="itemWidth=fit-content" />
      <Text testId="group-hugged" value="hugs" backgroundColor="$color-primary-200" padding="$space-1" />
      <Text value="also hugs" backgroundColor="$color-primary-200" padding="$space-1" />
    </VStack>
  </HStack>
</App>
```

## Decision guide

- If the component is wider than its content and should be compact, set
  `width="fit-content"` on that component.
- If all direct children should be compact, set `itemWidth="fit-content"` on
  their parent.
- If a child already hugs its content, omit `fit-content`; it is redundant.
- If the goal is to consume leftover space, use `width="*"` instead.
- If the content can become very wide, add wrapping, truncation, or `maxWidth`
  according to the design; `fit-content` is not a substitute for a width limit.

The height counterpart is literal: `height="fit-content"` hugs from top to
bottom. That is separate from whether the component is a `VStack` or an
`HStack`; those names describe where children are placed, not which dimension
the `fit-content` value controls.

## See also

- [Stop a `width="*"` element from collapsing](/docs/howto/keep-a-star-sized-element-from-collapsing)
- [Set the width of an input field in an HStack](/docs/howto/set-width-for-input-fields-in-a-horizontal-layout)
- [Fill remaining vertical space](/docs/howto/fill-remaining-vertical-space) — the `height="*"` counterpart
- [Layout](/docs/layout)
