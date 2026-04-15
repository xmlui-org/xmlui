# Style Card and NoResult placeholders

Override Card and NoResult theme vars for consistent empty and container styling.

Card provides a styled surface for grouping related content; NoResult displays when a list or search has nothing to show. Card supports hover states (useful when used as a clickable item) and gap control for its internal sections. NoResult exposes icon size and gap vars for the placeholder illustration.

```xmlui-pg copy display name="Card and NoResult placeholder theming"
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
    size-icon-NoResult="64px"
    gap-icon-NoResult="$space-4"
    backgroundColor-NoResult="$color-surface-50"
    paddingVertical-NoResult="$space-10"
  >
    <VStack>
      <HStack wrapContent>
        <Card title="Revenue">
          <Text>$12,400 this month</Text>
        </Card>
        <Card title="Users">
          <Text>3,210 active</Text>
        </Card>
      </HStack>
      <NoResult
        label="No results found"
        description="Try adjusting your search filters."
      />
    </VStack>
  </Theme>
</App>
```

## Key points

**`boxShadow-Card` is the primary depth cue**: A layered box-shadow value combining a tight ambient shadow with a wider diffuse one creates realistic card elevation without a visible border. Replace it with `borderWidth-Card` + `borderColor-Card` for a flat outlined style.

**`backgroundColor-Card--hover` enables clickable card affordance**: Setting a hover background makes the card visually respond to cursor entry — pair it with an `onClick` handler on the Card to create interactive summary cards. Without an `onClick`, the hover state has no effect.

**`gap-Card` controls spacing between card sections**: When a Card has a `title` and body content, `gap-Card` controls the vertical gap between them. Use `gap-title-Card` for the gap within the title row (between an avatar and title text).

**NoResult icon size and position are controlled separately**: `size-icon-NoResult` sets the placeholder icon's width and height as a square. `gap-icon-NoResult` sets the margin below the icon, before the label text. Scale the empty-state illustration up or down with these two vars.

**`backgroundColor-NoResult` and `paddingVertical-NoResult` set the empty-state container**: A subtle background and generous vertical padding help NoResult occupy its space gracefully. Use `$color-surface-50` for a very light off-white that distinguishes it from a plain white page background.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — use Card in an item repeater
- [Theme Badge colors and sizes](/docs/howto/theme-badge-colors-and-sizes) — style the status indicators often shown inside Cards
