# Make a child fill the remaining vertical space

Give a `VStack` child `height="*"` and it takes the **remaining** vertical
space — the parent's height minus the siblings that have a definite or natural
height. It is the vertical mirror of `width="*"` in a row.

> [!IMPORTANT]
> `height="*"` only works if the height chain is **bounded at the top**. If no
> ancestor has a real height, "available height" is just content height, nothing
> is left over, and the starred child collapses to its content — the number-one
> reason `height="*"` "does nothing." Bound the top with `App`
> `scrollWholePage="false"` (fills the viewport), `height="100vh"`, or an
> explicit container height.

## The pattern

A header and footer keep their natural height. Give the body `height="*"` and it
fills everything they leave — flip it to `auto` or a fixed height with the
buttons and watch the fill disappear:

```xmlui-pg copy display name="Body height: * vs auto vs a fixed value" height="520px"
---app display
<App scrollWholePage="false" var.bh="*">
  <VStack padding="$space-3" gap="$space-3">
    <HStack verticalAlignment="center" gap="$space-2">
      <Text variant="strong">Body height:</Text>
      <Button 
        label="*" 
        variant="{bh === '*' ? 'solid' : 'outlined'}" 
        onClick="bh = '*'" 
      />
      <Button 
        label="auto" 
        variant="{bh === 'auto' ? 'solid' : 'outlined'}" 
        onClick="bh = 'auto'" 
      />
      <Button 
        label="160px" 
        variant="{bh === '160px' ? 'solid' : 'outlined'}" 
        onClick="bh = '160px'" 
      />
    </HStack>
    <VStack 
      height="380px" 
      gap="0" 
      borderWidth="1px" 
      borderColor="$color-surface-300"
    >
      <HStack padding="$space-3" backgroundColor="$color-primary-100">
        <Text variant="strong">Header — natural height</Text>
      </HStack>
      <VStack
        height="{bh}"
        padding="$space-3"
        gap="$space-2"
        verticalAlignment="center"
        backgroundColor="$color-surface-100"
        borderVertical="2px dashed $color-primary-300">
        <Text variant="strong">Body — height="{bh}"</Text>
        <Text>
          Only "*" pushes the footer to the bottom. "auto" shrinks to 
          this text and "160px" is a fixed slab — either way the rows 
          bunch at the top and the leftover height falls below.
        </Text>
      </VStack>
      <HStack padding="$space-3" backgroundColor="$color-primary-100">
        <Text variant="strong">Footer — natural height</Text>
      </HStack>
    </VStack>
  </VStack>
</App>
```

The inner `VStack` is a fixed-height bounded container (`height="380px"`). With
the body at `height="*"` it consumes whatever the header and footer leave, so the
footer sits on the bottom edge. Switch the body to `auto` (hug its text) or
`160px` (a fixed slab) and it no longer fills — the three rows collapse to the top
and the leftover height opens up below the footer. Only `*` expands to take the
remainder. (Remove the container's `height` entirely and even `*` collapses —
with no bounded parent there is nothing to divide.)

## Key points

**Bound the height chain at the top — this is the usual bug.** `height="*"`
divides *available* height among star-sized children. "Available" is only real if
some ancestor has a definite height: the `App` with `scrollWholePage="false"`, a
`height="100vh"`/`height="100%"` container, or an explicit pixel/`rem` height.
Without it there is nothing to divide and `height="*"` looks like it does
nothing.

**Siblings take their height first; the star gets the rest.** Exactly like
`width="*"`: the starred child receives the parent's height minus the siblings
with a definite or natural height. Give a fixed panel a real height (or let it
size to content) so the starred region has a stable remainder.

**Multiple `height="*"` children split the space.** Two starred siblings share
the leftover height proportionally (`height="*"` each = 50/50), the same
proportional rule as star widths. Change the top region's height to compare an
even split, a weighted split, and a fixed value against the always-starred bottom:

```xmlui-pg copy display name="Top region: equal star, weighted star, or fixed" height="440px"
---app display
<App scrollWholePage="false" var.top="*">
  <VStack padding="$space-3" gap="$space-3">
    <HStack verticalAlignment="center" gap="$space-2">
      <Text variant="strong">Top region height:</Text>
      <Button 
        label="*" 
        variant="{top === '*' ? 'solid' : 'outlined'}" 
        onClick="top = '*'" 
      />
      <Button 
        label="2*" 
        variant="{top === '2*' ? 'solid' : 'outlined'}" 
        onClick="top = '2*'" 
      />
      <Button 
        label="80px" 
        variant="{top === '80px' ? 'solid' : 'outlined'}" 
        onClick="top = '80px'" 
      />
    </HStack>
    <VStack 
      height="320px" 
      gap="0" 
      borderWidth="1px" 
      borderColor="$color-surface-300"
    >
      <HStack padding="$space-3" backgroundColor="$color-primary-100">
        <Text variant="strong">Header — natural height</Text>
      </HStack>
      <VStack 
        height="{top}" 
        backgroundColor="$color-primary-50" 
        verticalAlignment="center" 
        horizontalAlignment="center"
      >
        <Text variant="strong">Top — height="{top}"</Text>
      </VStack>
      <VStack 
        height="*" 
        backgroundColor="$color-surface-200" 
        verticalAlignment="center" 
        horizontalAlignment="center"
      >
        <Text variant="strong">Bottom — height="*"</Text>
      </VStack>
    </VStack>
  </VStack>
</App>
```

`*` vs `*` splits evenly; `2*` makes the top twice the bottom (weights, like star
widths); `80px` drops the top out of the star math entirely — it takes a fixed
slab and the bottom `*` absorbs the rest.

**It is the vertical mirror of `width="*"`.** The star rule is identical on both
axes — remaining space after definite-size siblings, inside a bounded parent. If
a `width="*"` how-to already solves your row, the same shape solves your column.

---

## See also

- [Stop a `width="*"` element from collapsing next to a flexible sibling](/docs/howto/keep-a-star-sized-element-from-collapsing) — the horizontal mirror and the "starred child squeezed to a sliver" trap
- [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout) — when the filled region should scroll internally
- [Center content vertically in a filled container](/docs/howto/center-content-vertically-in-a-filled-container) — why vertical centering depends on a filled region
- [Center content on the page](/docs/howto/center-content-on-the-page) — centering a full-page card or panel
- [Stack component](/docs/reference/components/Stack) — `height`, star sizing, and alignment
- [Layout Properties](/docs/styles-and-themes/layout-props) — sizing units including `*`
