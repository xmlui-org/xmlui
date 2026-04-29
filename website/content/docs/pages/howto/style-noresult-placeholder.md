# Style NoResult placeholder

Override NoResult theme vars for icon size, gap, background, and padding.

NoResult displays when a list or search has nothing to show. It exposes vars for the placeholder icon size, the gap beneath it, the container background, and vertical padding so the empty state occupies its space gracefully.

```xmlui-pg copy display name="NoResult placeholder theming"
---app display
<App>
  <Theme
    size-icon-NoResult="64px"
    gap-icon-NoResult="$space-4"
    backgroundColor-NoResult="$color-surface-50"
    paddingVertical-NoResult="$space-10"
  >
    <NoResult
      label="No results found"
      description="Try adjusting your search filters."
    />
  </Theme>
</App>
```

## Key points

**NoResult icon size and position are controlled separately**: `size-icon-NoResult` sets the placeholder icon's width and height as a square. `gap-icon-NoResult` sets the margin below the icon, before the label text. Scale the empty-state illustration up or down with these two vars.

**`backgroundColor-NoResult` and `paddingVertical-NoResult` set the empty-state container**: A subtle background and generous vertical padding help NoResult occupy its space gracefully. Use `$color-surface-50` for a very light off-white that distinguishes it from a plain white page background.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Style Card appearance](/docs/howto/style-card-appearance) — theme the container surface that often wraps lists
- [Theme Badge colors and sizes](/docs/howto/theme-badge-colors-and-sizes) — style status indicators shown alongside results
