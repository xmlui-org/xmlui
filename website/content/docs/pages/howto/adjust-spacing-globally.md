# Adjust spacing globally

Override gap, padding, and margin theme variables at the app root to tighten or loosen spacing everywhere.

Your designer wants a more compact, data-dense layout for an analytics dashboard — less padding inside Cards, smaller gaps between items, and a tighter overall feel. Instead of adding `padding` and `gap` overrides to every component, set the spacing tokens once on a `<Theme>` wrapper and the entire subtree tightens up.

```xmlui-pg copy display name="Default vs compact spacing"
---app display
<App>
  <HStack wrapContent itemWidth="50%">
    <VStack>
      <H4>Default spacing</H4>
      <Card title="Revenue">
        <Text>$12,400 this month</Text>
        <Badge value="On track" />
      </Card>
      <Card title="Users">
        <Text>3,210 active</Text>
        <Badge value="Growing" />
      </Card>
      <Button label="View report" variant="solid" themeColor="primary" />
    </VStack>

    <Theme
      gap-tight="$space-1"
      gap-normal="$space-2"
      gap-loose="$space-3"
      padding-tight="$space-1"
      padding-normal="$space-2"
      padding-Card="$space-2"
    >
      <VStack>
        <H4>Compact spacing</H4>
        <Card title="Revenue">
          <Text>$12,400 this month</Text>
          <Badge value="On track" />
        </Card>
        <Card title="Users">
          <Text>3,210 active</Text>
          <Badge value="Growing" />
        </Card>
        <Button label="View report" variant="solid" themeColor="primary" />
      </VStack>
    </Theme>
  </HStack>
</App>
```

## Key points

**Global gap tokens**: `gap-none`, `gap-tight`, `gap-normal`, and `gap-loose` are used by all [layout containers](/docs/styles-and-themes/layout-props) (`VStack`, `HStack`, `Card`, etc.). Changing `gap-normal` tightens every default gap in the subtree in one shot:

```xmlui
<Theme gap-normal="$space-2" gap-tight="$space-1">
  <!-- all VStacks, HStacks, and Cards use smaller gaps -->
</Theme>
```

**Global padding tokens**: `padding-none`, `padding-tight`, `padding-normal`, and `padding-loose` work the same way for internal spacing:

```xmlui
<Theme padding-normal="$space-2" padding-tight="$space-1">
  <!-- all components with default padding become more compact -->
</Theme>
```

**`space-base` scales everything**: The underlying unit defaults to `0.25em`. Tokens like [`$space-1` through `$space-96`](/docs/styles-and-themes/theme-variables#spacing) are multiples of `space-base`. Adjusting `space-base` scales the entire spacing system proportionally — a single value change that affects every gap, padding, and margin.

**Component-specific overrides**: When you want to tighten only one component type, use its specific variable. For example, `padding-Card` overrides the Card's internal padding while leaving `VStack` and `HStack` gaps at their global values:

```xmlui
<Theme padding-Card="$space-2" gap-Card="$space-1">
  <!-- only Cards are affected -->
</Theme>
```

**Side-by-side comparison**: Wrapping one section in `<Theme>` and leaving the adjacent section at defaults is a practical technique for previewing spacing changes during development — exactly what the demo above does.

---

**See also**
- [Spacing](/docs/styles-and-themes/theme-variables#spacing) — space tokens and the `space-base` unit
- [Spacing in Layout Containers](/docs/styles-and-themes/theme-variables#spacing-in-layout-containers) — `gap-tight`, `gap-normal`, `gap-loose` tokens
- [Layout Properties](/docs/styles-and-themes/layout-props) — complete layout and sizing property reference
- [Theme Variable Defaults](/docs/styles-and-themes/theme-variable-defaults) — all spacing token default values
