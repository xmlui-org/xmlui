# SCSS variable mapping: Gauge

The simplest form of theme bridging: the third-party library already uses CSS custom properties, so you just assign XMLUI design tokens to them in SCSS.

## The bridge

Smart UI's Gauge component reads `--smart-background`, `--smart-primary`, and `--smart-surface` for all its internal styling -- labels, ticks, digital display, needle color. The SCSS bridge maps three XMLUI tokens to these properties:

```scss
:global(smart-gauge) {
  --smart-background: #{$backgroundColor-Gauge};
  --smart-background-color: #{$textColor-Gauge};
  --smart-primary: #{$primaryColor-Gauge};
}
```

That's the entire bridge. Three assignments. Smart UI handles everything else internally -- it reads these variables and applies them to all its child elements. The bridge is declarative and has zero runtime cost.

There's one wrinkle: Smart UI bakes some values into inline SVG attributes at render time, so CSS variable changes (e.g., tone/theme switch) don't take effect on the needle and track. The SCSS works around this with `!important` on those specific SVG selectors.

## Demo

```xmlui-pg
---app display
<App var.gaugeVal="42">
  <HStack alignItems="center" gap="2rem" padding="1rem">
    <Gauge
      id="g1"
      aria-label="Demo gauge"
      minValue="0"
      maxValue="100"
      initialValue="42"
      analogDisplayType="needle"
      digitalDisplay="{true}"
      onDidChange="{(v) => gaugeVal = v}" />
    <VStack>
      <Text>Value: {gaugeVal}</Text>
      <HStack gap="0.5rem">
        <Button size="sm" onClick="{g1.setValue(0)}">Set 0</Button>
        <Button size="sm" onClick="{g1.setValue(50)}">Set 50</Button>
        <Button size="sm" onClick="{g1.setValue(100)}">Set 100</Button>
      </HStack>
    </VStack>
  </HStack>
</App>
```

## When this pattern works

SCSS variable mapping works when the library was designed with CSS custom properties as its theming API. You're mapping between two systems that already speak the same language -- CSS variables. The bridge is a one-time cost at the SCSS layer; the render component doesn't need to know about theming at all.

Smart UI, Shoelace, and other web-component-based libraries typically expose CSS custom properties. For libraries that don't -- like react-big-calendar with its class-based CSS -- you need the runtime approach shown on the [Calendar](/docs/guides/wrap-component/calendar-theme) page.

## Orthogonal to wrapping

This theming bridge lives entirely in the SCSS file. The `wrapCompound` config doesn't mention theming. The render component (`GaugeRender.tsx`) is pure React -- it doesn't import `useTheme()` or know anything about XMLUI's design token system. The separation is clean: the wrapper handles props and events, the SCSS handles theming.
