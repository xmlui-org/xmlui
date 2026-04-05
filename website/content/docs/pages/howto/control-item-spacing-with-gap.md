# Control Item Spacing with Gap

Use the `gap` property on `HStack`, `VStack`, or `Stack` to adjust the space between child items, or set it to `0` to remove gaps entirely.

A tight button toolbar and a spacious card section live on the same page. Both use `HStack`, but the toolbar needs compact spacing while the card section needs breathing room. The `gap` property lets each container set its own inter-item spacing without affecting the other.

```xmlui-pg copy display name="Compact toolbar vs spacious cards"
---app display
<App>
  <HStack 
    gap="$gap-tight" 
    padding="$space-2" 
    backgroundColor="$color-surface-100"
  >
    <Button label="Bold" icon="bold" />
    <Button label="Italic" icon="italic" />
    <Button label="Underline" icon="underline" />
  </HStack>
  <HStack gap="$gap-loose" padding="$space-4">
    <Card width="*" title="Revenue" />
    <Card width="*" title="Costs" />
    <Card width="*" title="Profit" />
  </HStack>
</App>
```

## Key points

**Predefined gap tokens keep spacing consistent**: Instead of hard-coded pixel values use theme variables that scale with the active theme. XMLUI provides several built-in gap tokens:

| Token | Typical use |
|---|---|
| `$gap-tight` | Dense toolbars, chip lists, badge rows |
| `$gap-normal` | Default gap for most containers |
| `$gap-loose` | Card grids, spacious sections |

```xmlui-pg copy display name="Comparing gap tokens"
---app display
<App>
  <VStack>
    <Text>gap="$gap-tight"</Text>
    <HStack gap="$gap-tight">
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </HStack>
    <Text>gap="$gap-normal" (default)</Text>
    <HStack gap="$gap-normal">
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </HStack>
    <Text>gap="$gap-loose"</Text>
    <HStack gap="$gap-loose">
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </HStack>
  </VStack>
</App>
```

**`gap="0"` removes all space between items**: Useful for tab bars, segmented controls, or adjacent bordered panels that should share borders rather than sit apart:

```xmlui-pg copy display name="Items with no gap"
---app display
<App>
  <HStack gap="0">
    <Button label="Day" />
    <Button label="Week" />
    <Button label="Month" />
  </HStack>
</App>
```

**Gap affects percentage sizing**: When children use percentage widths that sum to 100%, the default gap causes overflow because it adds extra space. Set `gap="0"` to eliminate the overflow:

```xmlui-pg copy display name="Percentage widths without gap overflow"
---app display
<App>
  <VStack>
    <Text>With explicit gap (overflows)</Text>
    <HStack gap="$gap-loose" border="4px dotted $color-warn" height="40px">
      <Stack height="100%" backgroundColor="$color-info-200" width="50%" />
      <Stack height="100%" backgroundColor="$color-success-200" width="50%" />
    </HStack>
    <Text>With gap="0" (no overflow)</Text>
    <HStack gap="0" border="4px dotted $color-success" height="40px">
      <Stack height="100%" backgroundColor="$color-info-200" width="50%" />
      <Stack height="100%" backgroundColor="$color-success-200" width="50%" />
    </HStack>
  </VStack>
</App>
```

**An explicit pixel or rem value works too**: When a design calls for a specific spacing that does not map neatly to a predefined token, any CSS length is accepted:

```xmlui
<HStack gap="12px">…</HStack>
<VStack gap="1.5rem">…</VStack>
```

---

**See also**
- [Layout Properties](/docs/styles-and-themes/layout-props) — full list of spacing props including `gap`, `padding`, and `margin`
- [Adjust spacing globally](/docs/howto/adjust-spacing-globally) — overriding gap theme variables for the whole app
- [Wrap items across multiple rows](/docs/howto/wrap-items-across-multiple-rows) — `wrapContent` with gap control
