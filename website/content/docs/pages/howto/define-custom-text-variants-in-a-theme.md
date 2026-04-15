# Define custom Text variants in a theme

Use the cssProperty-Text-variantName pattern to create reusable branded text styles.

Any value you pass to `<Text variant="...">` is a theme variant key. Built-in variants like `caption`, `strong`, and `code` are pre-defined; any other name becomes a custom variant that the framework styles using theme variables matching `{cssProperty}-Text-{variantName}`. Define these vars in a `<Theme>` wrapper or in your `themeVars` object in `config.json` to create a reusable branded type system.

```xmlui-pg copy display name="Custom Text variants via theme"
---app display
<App>
  <Theme
    textColor-Text-tagPill="$color-primary-700"
    backgroundColor-Text-tagPill="$color-primary-50"
    borderRadius-Text-tagPill="9999px"
    paddingHorizontal-Text-tagPill="$space-3"
    paddingVertical-Text-tagPill="$space-0_5"
    fontSize-Text-tagPill="0.75rem"
    fontWeight-Text-tagPill="500"
    textColor-Text-heroTitle="$color-surface-900"
    fontSize-Text-heroTitle="2.25rem"
    fontWeight-Text-heroTitle="800"
    fontSize-Text-legalNote="0.7rem"
    textColor-Text-legalNote="$color-surface-400"
    fontStyle-Text-legalNote="italic"
  >
    <VStack>
      <Text variant="heroTitle">Welcome to the platform</Text>
      <HStack>
        <Text variant="tagPill">Design</Text>
        <Text variant="tagPill">Developer</Text>
        <Text variant="tagPill">Open source</Text>
      </HStack>
      <Text variant="legalNote">
        * Terms and conditions apply. See footer for details.
      </Text>
    </VStack>
  </Theme>
</App>
```

## Key points

**Any custom variant name is automatically wired up**: Use `<Text variant="heroTitle">` and add `fontSize-Text-heroTitle` and `fontWeight-Text-heroTitle` to your theme — the framework maps them automatically. No registration step is needed.

**The property set mirrors standard CSS properties in camelCase**: Supported properties include `fontSize`, `fontWeight`, `fontFamily`, `fontStyle`, `textColor`, `backgroundColor`, `borderRadius`, `paddingHorizontal`, `paddingVertical`, `lineHeight`, `letterSpacing`, `textTransform`, and more.

**Hover state is supported for interactive variants**: Add `textColor-Text-myVariant--hover` to make a variant respond to cursor entry — useful for clickable badge-style text or inline labels.

**Define in theme JSON for app-wide reuse**: Add the same vars to the `themeVars` object in your `config.json` theme file to make them available throughout the entire app without a `<Theme>` wrapper at every use site.

**Custom variants coexist with built-in variants**: Defining `textColor-Text-tagPill` does not affect `textColor-Text-caption` or any other built-in variant. Each variant's vars are namespaced by variant name and are completely independent.

---

## See also

- [Override a component's theme vars](/docs/howto/override-a-components-theme-vars) — how `<Theme>` scoping works
- [Style per-level Heading sizes](/docs/howto/style-per-level-heading-sizes) — typed heading theming with the same property-component pattern
- [Theme Badge colors and sizes](/docs/howto/theme-badge-colors-and-sizes) — style the Badge component for pill-like labels
