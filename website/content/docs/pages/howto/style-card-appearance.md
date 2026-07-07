# Style Card appearance

Override Card theme vars for shadow, hover state, padding, and section spacing.

Card provides a styled surface for grouping related content. It supports hover states (useful when used as a clickable item) and gap control for its internal sections. All variables can be scoped to a specific section by wrapping it in a `<Theme>`.

```xmlui-pg copy display name="Card appearance theming"
---app display
<App>
  <Theme
    backgroundColor-Card="white"
    borderRadius-Card="12px"
    boxShadow-Card="0 1px 4px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.06)"
    backgroundColor-Card--hover="$color-primary-50"
    paddingHorizontal-Card="$space-5"
    paddingVertical-Card="$space-4"
    gap-Card="$space-3"
  >
    <HStack wrapContent>
      <Card title="Revenue">
        <Text>$12,400 this month</Text>
      </Card>
      <Card title="Users">
        <Text>3,210 active</Text>
      </Card>
    </HStack>
  </Theme>
</App>
```

## Key points

**`boxShadow-Card` is the primary depth cue**: A layered box-shadow value combining a tight ambient shadow with a wider diffuse one creates a realistic drop shadow without a visible border. Replace it with `borderWidth-Card` + `borderColor-Card` for a flat outlined style.

**`backgroundColor-Card--hover` enables clickable card affordance**: Setting a hover background makes the card visually respond to cursor entry — pair it with an `onClick` handler on the Card to create interactive summary cards. Without an `onClick`, the hover state has no effect.

**`gap-Card` controls spacing between card sections**: When a Card has a `title` and body content, `gap-Card` controls the vertical gap between them. Use `gap-title-Card` for the gap within the title row (between an avatar and title text).

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — use Card in an item repeater
- [Theme Badge colors and sizes](/docs/howto/theme-badge-colors-and-sizes) — style the status indicators often shown inside Cards
