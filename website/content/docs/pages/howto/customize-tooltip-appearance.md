# Customize Tooltip appearance

Adjust animation, arrow, typography, and background via Tooltip theme vars.

Tooltip exposes variables for its background, text, border, padding, arrow SVG fill and stroke, and slide-in animation timing. The arrow automatically points in the correct direction based on placement — style it with `fill-arrow-Tooltip` (matching `backgroundColor-Tooltip`) and `stroke-arrow-Tooltip` (matching `borderColor-Tooltip`) so the arrow blends seamlessly with the container.

```xmlui-pg copy display name="Custom Tooltip appearance"
---app display
<App>
  <Theme
    backgroundColor-Tooltip="#1e293b"
    textColor-Tooltip="#f1f5f9"
    fontSize-Tooltip="12px"
    borderRadius-Tooltip="6px"
    paddingHorizontal-Tooltip="10px"
    paddingVertical-Tooltip="6px"
    boxShadow-Tooltip="0 4px 16px rgba(0,0,0,0.3)"
    fill-arrow-Tooltip="#1e293b"
    stroke-arrow-Tooltip="#1e293b"
    animationDuration-Tooltip="0.15s"
  >
    <HStack gap="16px" padding="24px">
      <Button 
        label="Hover me (top)" 
        tooltip="Appears above" 
        tooltipOptions="top"
      />
      <Button 
        label="Hover me (right)" 
        tooltip="Appears to the right" 
        tooltipOptions="right"
      />
      <SpaceFiller />
      <Button 
        label="Hover me (left)" 
        tooltip="Appears to the left"
        tooltipOptions="left"
      />
    </HStack>
  </Theme>
</App>
```

## Key points

**`backgroundColor-Tooltip` and `fill-arrow-Tooltip` must match**: The arrow is an SVG shape filled independently of the tooltip container. Set both to the same color so the arrow appears seamless. Similarly, `borderColor-Tooltip` and `stroke-arrow-Tooltip` should match for a bordered tooltip.

**`strokeWidth-arrow-Tooltip` controls arrow border thickness**: When you set a visible `stroke-arrow-Tooltip` color, `strokeWidth-arrow-Tooltip` determines how thick that stroke is. Set it to `"0"` to eliminate the arrow border entirely.

**`animationDuration-Tooltip` controls slide-in speed**: The tooltip slides in from the placement side. Set `animationDuration-Tooltip` to `"0.15s"` for a snappy feel. `animation-Tooltip` sets the cubic-bezier timing function. Set duration to `"0s"` to disable the animation entirely.

**Padding adjusts readability without affecting placement**: `paddingHorizontal-Tooltip` and `paddingVertical-Tooltip` add internal whitespace. Placement is handled by Radix UI, so adding padding does not push the tooltip out of the viewport.

**Border props enable an outlined style**: Add `borderWidth-Tooltip`, `borderColor-Tooltip`, and `borderStyle-Tooltip` (e.g. `"1px"`, `"#94a3b8"`, `"solid"`) for a bordered tooltip. Match `stroke-arrow-Tooltip` to `borderColor-Tooltip` so the arrow border aligns with the container border.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Theme ExpandableItem transitions](/docs/howto/theme-expandableitem-transitions) — another animation-duration theming example
- [Customize Link focus & decoration](/docs/howto/customize-link-focus-and-decoration) — focus-ring theming for interactive elements
