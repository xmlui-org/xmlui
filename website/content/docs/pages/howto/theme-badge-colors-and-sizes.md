# Theme Badge colors and sizes

Customize background, text, border-radius, and padding per Badge variant.

Badge renders as a small label, either rectangular (`shape="badge"`) or pill-shaped (`shape="pill"`). Both shapes share the same property-component naming convention, with `Badge` or `Badge-pill` as the component segment. Override padding, border-radius, text color, and font size independently for each shape to build a consistent tagging system.

```xmlui-pg copy display name="Badge shape and color theming"
---app display
<App>
  <Theme
    backgroundColor-Badge="$color-primary-100"
    textColor-Badge="$color-primary-700"
    borderRadius-Badge="4px"
    paddingHorizontal-Badge="$space-2"
    paddingVertical-Badge="$space-0_5"
    fontSize-Badge="0.7rem"
    fontWeight-Badge="600"
    backgroundColor-Badge-pill="$color-success-100"
    textColor-Badge-pill="$color-success-700"
    paddingHorizontal-Badge-pill="$space-3"
    paddingVertical-Badge-pill="$space-0_5"
    fontSize-Badge-pill="0.7rem"
    fontWeight-Badge-pill="500"
  >
    <VStack>
      <HStack>
        <Text>Rectangular badges:</Text>
        <Badge value="New" />
        <Badge value="Beta" />
        <Badge value="Deprecated" />
      </HStack>
      <HStack>
        <Text>Pill badges:</Text>
        <Badge value="Active" variant="pill" />
        <Badge value="Online" variant="pill" />
        <Badge value="Verified" variant="pill" />
      </HStack>
    </VStack>
  </Theme>
</App>
```

## Key points

**Rectangular and pill shapes have independent theme vars**: Variables for the rectangular shape use `Badge` as the component segment. Variables for the pill shape use `Badge-pill`. Both shapes support the same set of typography, padding, and border properties.

**`borderRadius-Badge` controls corner rounding of the rectangular shape**: Pill shape always uses a 9999 px radius (hardcoded), so `borderRadius-Badge-pill` has no effect. Only `borderRadius-Badge` rounds rectangular badge corners.

**Padding vars control internal whitespace**: `paddingHorizontal-Badge` and `paddingVertical-Badge` control how much space surrounds the label text. Use `$space-*` tokens to keep padding consistent with the rest of the design system.

**`fontSize-Badge` and `fontWeight-Badge` define the label typography**: Badge text is typically small (`0.7rem`–0.75rem`) and slightly bold. Adjust these alongside `textColor-Badge` to give the badge label good legibility against its background.

**`backgroundColor-Badge` is set directly via theme vars**: Unlike some components that derive their background from a `themeColor` prop, Badge's background is fully customizable via `backgroundColor-Badge` and `backgroundColor-Badge-pill`. Use `$color-*` token references to stay in sync with your palette.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Define custom Text variants in a theme](/docs/howto/define-custom-text-variants-in-a-theme) — create pill-style Text variants as an alternative to Badge
- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — use `colorMap` to dynamically set Badge themeColor
