# Theme form inputs for all states

Set TextBox, NumberBox, and TextArea vars for error, warning, success, disabled, focus, and hover states.

TextBox, NumberBox, and TextArea share an identical theme variable structure. Every interaction state has its own set of border, background, shadow, and text color vars. The validation states support compound suffixes: `--error--hover` styles the hover appearance of an input that is currently in error state, letting you define a complete visual specification for every state combination.

```xmlui-pg copy display name="Form input state theming"
---app display
<App>
  <Theme
    borderRadius-TextBox="6px"
    borderColor-TextBox="$color-surface-300"
    borderColor-TextBox--hover="$color-primary-400"
    borderColor-TextBox--focus="$color-primary-500"
    outlineColor-TextBox--focus="$color-primary-200"
    outlineWidth-TextBox--focus="3px"
    outlineStyle-TextBox--focus="solid"
    borderColor-TextBox--error="$color-danger-500"
    backgroundColor-TextBox--error="hsl(356,100%,98%)"
    borderColor-TextBox--error--focus="$color-danger-600"
    outlineColor-TextBox--error--focus="$color-danger-200"
    borderColor-TextBox--warning="$color-warn-400"
    backgroundColor-TextBox--warning="hsl(45,100%,98%)"
    borderColor-TextBox--success="$color-success-500"
    backgroundColor-TextBox--success="hsl(142,76%,98%)"
    backgroundColor-TextBox--disabled="$color-surface-50"
    textColor-TextBox--disabled="$color-surface-400"
    borderColor-TextBox--disabled="$color-surface-200"
  >
    <VStack>
      <TextBox label="Default input" placeholder="Focus me..." />
      <TextBox 
        label="Error state" 
        validationStatus="error" 
        validationMessage="This field is required." 
      />
      <TextBox 
        label="Warning state" 
        validationStatus="warning" 
        validationMessage="Value may be incorrect." 
      />
      <TextBox 
        label="Success state" 
        validationStatus="valid" 
        validationMessage="Looks good!" 
      />
      <TextBox 
        label="Disabled input" 
        enabled="false" 
        value="Cannot edit" 
      />
    </VStack>
  </Theme>
</App>
```

## Key points

**Default, hover, and focus are three independent layers**: `borderColor-TextBox` sets the resting border, `borderColor-TextBox--hover` fires on cursor entry, and `borderColor-TextBox--focus` activates when the field has keyboard focus. Combine these with `outlineColor-TextBox--focus` and `outlineWidth-TextBox--focus` for an accessible focus ring.

**Validation states compound with interaction states**: `borderColor-TextBox--error--focus` targets an input that is simultaneously in error state and focused. The pattern extends to all four combinations: each of `--error`, `--warning`, `--success` can combine with `--hover` and `--focus`.

**Background color reinforces state**: Setting `backgroundColor-TextBox--error` to a faint red tint and `backgroundColor-TextBox--warning` to pale amber gives users a secondary color cue beyond the border — useful for users with color-contrast needs.

**TextBox, NumberBox, and TextArea share the same variable names**: Swap the component name in any var (`borderColor-NumberBox--focus`, `backgroundColor-TextArea--error`) and the same state system applies. Define all three in one `<Theme>` block to keep form input styling consistent.

**Disabled vars override all states**: A disabled field never shows hover or focus styles. Set `backgroundColor-TextBox--disabled`, `textColor-TextBox--disabled`, and `borderColor-TextBox--disabled` to clearly communicate that the field is inert.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Customize Select & AutoComplete menus](/docs/howto/customize-select-and-autocomplete-menus) — same state pattern for dropdown components
- [Style Slider track, thumb, and range](/docs/howto/style-slider-track-thumb-and-range) — state theming for the Slider form control
