# Customize Link focus & decoration

Set icon gap, padding, border, focus outline, and text decoration vars for Link.

Link theming covers three areas: text decoration (underline style, color, and thickness), hover and active color states, and the focus-visible ring for keyboard navigation. When a Link includes an icon, `gap-icon-Link` controls the space between the icon and label text. All variables can be scoped to a specific section by wrapping it in a `<Theme>`.

```xmlui-pg copy display name="Custom Link focus and decoration"
---app display
<App>
  <Theme
    textColor-Link="$color-primary-600"
    textColor-Link--hover="$color-primary-800"
    textColor-Link--active="$color-primary-900"
    textDecorationLine-Link="underline"
    textDecorationColor-Link="$color-primary-300"
    textDecorationColor-Link--hover="$color-primary-600"
    textDecorationStyle-Link="solid"
    textDecorationThickness-Link="1px"
    textUnderlineOffset-Link="3px"
    outlineWidth-Link--focus="2px"
    outlineColor-Link--focus="$color-primary-400"
    outlineStyle-Link--focus="solid"
    outlineOffset-Link--focus="2px"
    gap-icon-Link="0.4em"
  >
    <VStack>
      <Link to="https://example.com" label="External link with underline" />
      <Link to="https://example.com" label="Link with icon" icon="external" />
      <Text>Inline <Link label="link inside text" to="/docs" /> looks correct.</Text>
    </VStack>
  </Theme>
</App>
```

## Key points

**`textDecorationLine-Link`, `textDecorationColor-Link`, and `textDecorationThickness-Link` form the underline**: All three must be set together for a visible underline. `textUnderlineOffset-Link` lifts the line away from the baseline. Use `textDecorationStyle-Link` (`solid`, `dashed`, `dotted`, `wavy`) for decorative effects.

**`textDecorationColor-Link--hover` changes the underline color on hover independently**: Set this separately from `textColor-Link--hover` so the underline color can shift without changing the label text color. `textDecorationColor-Link--active` applies the same way on click.

**The focus ring is fully customizable**: `outlineWidth-Link--focus`, `outlineColor-Link--focus`, `outlineStyle-Link--focus`, and `outlineOffset-Link--focus` control the visible focus ring shown on keyboard navigation. Use a high-contrast color to meet WCAG 2.1 AA requirements.

**`gap-icon-Link` spaces the icon from the label**: When a Link has an `icon` attribute, this var controls the horizontal space between icon and text. Use an `em`-relative value so the gap scales with the font size.

**`textColor-Link--active` highlights the current route**: When a `Link` points to the current route, XMLUI applies the `--active` state. Set `textColor-Link--active` to a distinct color to visually identify the current page.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Theme multi-level NavGroup nesting](/docs/howto/theme-multi-level-navgroup-nesting) — style nav links in NavPanel
- [Customize Tooltip appearance](/docs/howto/customize-tooltip-appearance) — focus-ring and border theming for hover-triggered elements
