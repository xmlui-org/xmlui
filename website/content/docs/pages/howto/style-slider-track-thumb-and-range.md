# Style Slider track, thumb, and range

Override track color, thumb size, and range fill for normal, hover, and disabled states.

Slider theming splits into three named regions: `track` (the background bar), `range` (the filled active portion), and `thumb` (the draggable handle). Each region has its own set of vars, and the thumb exposes the richest set — including `--hover`, `--focus`, `--active`, and `--disabled` state variants — to provide clear visual feedback throughout interaction.

```xmlui-pg copy display name="Slider track, thumb, and range theming"
---app display
<App>
  <HStack gap="$space-8">
    <VStack width="*">
      <Text variant="strong">Default</Text>
      <Slider label="Volume" min="0" max="100" value="60" />
      <Slider label="Disabled" min="0" max="100" value="40" enabled="false" />
    </VStack>
    <VStack width="*">
      <Text variant="strong">Themed</Text>
      <Theme
        backgroundColor-track-Slider="$color-surface-200"
        backgroundColor-range-Slider="$color-success-500"
        backgroundColor-thumb-Slider="white"
        borderColor-thumb-Slider="$color-success-500"
        borderWidth-thumb-Slider="2px"
        borderStyle-thumb-Slider="solid"
        boxShadow-thumb-Slider="0 1px 4px rgba(0,0,0,0.2)"
        backgroundColor-thumb-Slider--hover="$color-success-50"
        boxShadow-thumb-Slider--hover="0 0 0 6px $color-success-100"
        boxShadow-thumb-Slider--focus="0 0 0 6px $color-success-200"
        backgroundColor-range-Slider--disabled="$color-surface-300"
        backgroundColor-track-Slider--disabled="$color-surface-100"
      >
        <Slider label="Volume" min="0" max="100" value="60" />
        <Slider label="Disabled" min="0" max="100" value="40" enabled="false" />
      </Theme>
    </VStack>
  </HStack>
</App>
```

## Key points

**Three independent regions: track, range, and thumb**: `backgroundColor-track-Slider` colors the inactive background bar; `backgroundColor-range-Slider` colors the filled portion up to the thumb; `backgroundColor-thumb-Slider` colors the draggable handle. Style them independently.

**Thumb border gives it a distinct outline**: Use `borderColor-thumb-Slider`, `borderWidth-thumb-Slider`, and `borderStyle-thumb-Slider` to draw a contrasting ring around the thumb — especially useful when the thumb and range share similar colors.

**`boxShadow-thumb-Slider--hover` and `--focus` create a halo effect**: A `box-shadow` with `0 0 0 6px` creates a soft circular ring around the circular thumb. Use it for hover feedback and a visible keyboard focus indicator.

**Disabled state vars override all interactions**: `backgroundColor-range-Slider--disabled` and `backgroundColor-track-Slider--disabled` override the active colors when the slider is disabled. Set these to desaturated values to visually communicate the inert state.

**Validation state borders wrap the track**: `borderColor-Slider--error`, `boxShadow-Slider--warning`, and similar vars apply to the track wrapper element, not the thumb. Use them to show form validation status on the Slider alongside other form fields.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Theme form inputs for all states](/docs/howto/theme-form-inputs-for-all-states) — state theming for TextBox, NumberBox, TextArea
- [Theme DatePicker calendar items](/docs/howto/theme-datepicker-calendar-items) — another interactive form component with state theming
