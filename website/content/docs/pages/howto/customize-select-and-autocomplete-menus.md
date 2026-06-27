# Customize Select & AutoComplete menus

Style menu, badges, items, and disabled states via component-specific theme vars.

Select and AutoComplete share the same variable structure — every var that references `Select` has an identical `AutoComplete` counterpart. Style the dropdown menu container with `backgroundColor-menu-Select` and `borderRadius-menu-Select`, individual items with `backgroundColor-item-Select--hover`, and multi-select badge chips with the `Select-badge` family of vars.

```xmlui-pg copy display name="Custom Select and AutoComplete menus"
---app display
<App>
  <Theme
    borderRadius-Select="8px"
    borderColor-Select="$color-primary-300"
    borderColor-Select--hover="$color-primary-500"
    outlineColor-Select--focus="$color-primary-400"
    borderRadius-menu-Select="8px"
    backgroundColor-menu-Select="white"
    boxShadow-menu-Select="0 8px 24px rgba(0,0,0,0.12)"
    backgroundColor-item-Select--hover="$color-primary-50"
    backgroundColor-item-Select--active="$color-primary-100"
    backgroundColor-Select-badge="$color-primary-100"
    textColor-Select-badge="$color-primary-700"
    borderRadius-Select-badge="4px"
  >
    <VStack>
      <Select label="Single select" initialValue="b">
        <Option value="a">Option A</Option>
        <Option value="b">Option B</Option>
        <Option value="c">Option C</Option>
      </Select>
      <Select label="Multi-select with badges" multiSelect="true">
        <Option value="a">Alpha</Option>
        <Option value="b">Beta</Option>
        <Option value="c">Gamma</Option>
      </Select>
    </VStack>
  </Theme>
</App>
```

## Key points

**Trigger input and dropdown menu are themed independently**: The trigger respects `borderColor-Select`, `backgroundColor-Select`, and `borderRadius-Select`. The dropdown uses the `-menu-` infix: `backgroundColor-menu-Select`, `borderRadius-menu-Select`, `boxShadow-menu-Select`.

**Item states use the `-item-` infix with `--hover` and `--active`**: `backgroundColor-item-Select--hover` styles items on mouse-over; `backgroundColor-item-Select--active` styles the currently selected or keyboard-focused item. Disabled items use `textColor-item-Select--disabled`.

**Multi-select badges use the `-badge` suffix family**: The chip tags inside the input for multi-select use `backgroundColor-Select-badge`, `textColor-Select-badge`, `borderRadius-Select-badge`, `paddingHorizontal-Select-badge`, and `fontSize-Select-badge`. A `--hover` state is also available.

**AutoComplete has an identical variable set**: Replace `Select` with `AutoComplete` in every variable name to target the AutoComplete component. The two sets are completely independent, so you can style them differently in a single `<Theme>`.

**Validation states follow the `--error`/`--warning`/`--success` pattern**: `borderColor-Select--error`, `backgroundColor-Select--error--hover`, and `outlineColor-Select--error--focus` let you re-color the trigger for each validation state.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Theme form inputs for all states](/docs/howto/theme-form-inputs-for-all-states) — TextBox, NumberBox, TextArea state theming
- [Theme DatePicker calendar items](/docs/howto/theme-datepicker-calendar-items) — same menu-infix pattern for the calendar dropdown
