# Theme DatePicker calendar items

Style calendar grid, selected day, disabled dates, range highlights, and menu via DatePicker vars.

DatePicker shares the same trigger-input variables as TextBox and Select (`borderColor-DatePicker`, `borderRadius-DatePicker`, etc.) and adds a calendar-specific layer for the dropdown popup. The calendar item vars — `backgroundColor-item-DatePicker--active` for the selected day and `backgroundColor-item-DatePicker--hover` for hovered cells — control the visual state of individual day cells.

```xmlui-pg copy display name="DatePicker calendar item theming" height="570px"
---app display
<App>
  <HStack gap="$space-8" alignItems="flex-start">
    <VStack flex="1">
      <Text variant="strong">Default</Text>
      <DatePicker label="Pick a date" />
    </VStack>
    <VStack flex="1">
      <Text variant="strong">Themed</Text>
      <Theme
        borderRadius-DatePicker="12px"
        borderColor-DatePicker="$color-primary-300"
        borderColor-DatePicker--hover="$color-primary-500"
        outlineColor-DatePicker--focus="$color-primary-300"
        backgroundColor-menu-DatePicker="lightyellow"
        boxShadow-menu-DatePicker="0 8px 24px rgba(0,0,0,0.12)"
        borderRadius-menu-DatePicker="8px"
        backgroundColor-item-DatePicker--active="$color-primary-500"
        textColor-value-DatePicker="white"
        backgroundColor-item-DatePicker--hover="$color-primary-50"
        borderColor-selectedItem-DatePicker="$color-primary-500"
      >
        <DatePicker label="Pick a date" />
      </Theme>
    </VStack>
  </HStack>
</App>
```

## Key points

**Trigger input vars are identical to TextBox and Select**: `borderColor-DatePicker`, `borderRadius-DatePicker`, `backgroundColor-DatePicker`, and all their hover/focus/validation variants follow the same naming pattern as other form components. Style the trigger first, then layer in calendar-specific vars.

**`backgroundColor-item-DatePicker--active` highlights the selected day cell**: This colors the background of the currently selected date. Pair it with `textColor-value-DatePicker` (the text color inside the selected cell) to ensure readable contrast.

**`backgroundColor-item-DatePicker--hover` styles day cells on mouse-over**: This applies to any day cell the cursor enters, regardless of selection state. Use a lighter tint of your primary color to preview what the user is about to select.

**`borderColor-selectedItem-DatePicker` draws a ring around the selected day**: Add a visible selection border on top of or instead of the background fill — useful for high-contrast or outlined calendar styles.

**Calendar menu vars use the `-menu-` infix**: `backgroundColor-menu-DatePicker`, `boxShadow-menu-DatePicker`, and `borderRadius-menu-DatePicker` style the floating calendar popup container — separate from both the trigger input and the individual day cells.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Theme form inputs for all states](/docs/howto/theme-form-inputs-for-all-states) — style the trigger input with the same state system
- [Customize Select & AutoComplete menus](/docs/howto/customize-select-and-autocomplete-menus) — the `-menu-` and `-item-` infix pattern
