# Style text with custom variants

Define Text or Heading variants in theme variables to reuse branded typography across the app.

Your brand guidelines specify a `pageTitle` style (large, bold, coloured), a `sectionLabel` (uppercase, small, wide letter-spacing), and a `caption` (italic, muted). Rather than repeating inline `fontSize`, `fontWeight`, and `color` on every `Text`, define custom variants once in `<Theme>` and apply them with `variant="pageTitle"`.

```xmlui-pg copy display name="Custom Text variants and Heading overrides"
---app display
<App>
  <Theme
    textColor-Text-pageTitle="$color-primary-600"
    fontSize-Text-pageTitle="28px"
    fontWeight-Text-pageTitle="bold"
    letterSpacing-Text-pageTitle="1px"

    textColor-Text-sectionLabel="$color-secondary-600"
    fontSize-Text-sectionLabel="12px"
    fontWeight-Text-sectionLabel="600"
    textTransform-Text-sectionLabel="uppercase"
    letterSpacing-Text-sectionLabel="2px"

    textColor-Text-caption="$color-surface-500"
    fontSize-Text-caption="13px"
    fontStyle-Text-caption="italic"
  >
    <VStack>
      <Text variant="pageTitle">Dashboard Overview</Text>
      <Text variant="sectionLabel">Key Metrics</Text>
      <Card title="Revenue">
        <Text>$48,200 this quarter</Text>
        <Text variant="caption">Updated 5 minutes ago</Text>
      </Card>
      <Text variant="sectionLabel">Recent Activity</Text>
      <Card title="Deployments">
        <Text>12 successful this week</Text>
        <Text variant="caption">Last deploy: today at 14:32</Text>
      </Card>
    </VStack>
  </Theme>

  <H3>Per-level Heading overrides</H3>
  <Theme
    textColor-H1="$color-primary-700"
    textColor-H2="$color-secondary-600"
    fontWeight-H3="normal"
  >
    <VStack>
      <Heading level="h1" value="H1 — primary colour" />
      <Heading level="h2" value="H2 — secondary colour" />
      <Heading level="h3" value="H3 — normal weight" />
    </VStack>
  </Theme>
</App>
```

## Key points

**`{cssProperty}-Text-{variantName}`**: This naming pattern defines a custom variant. Any [CSS text property](/docs/styles-and-themes/theme-variables#property-names) works — `textColor`, `fontSize`, `fontWeight`, `fontFamily`, `textDecoration`, `lineHeight`, `textTransform`, `letterSpacing`, and more:

```xmlui
<Theme
  textColor-Text-pageTitle="$color-primary-600"
  fontSize-Text-pageTitle="28px"
  fontWeight-Text-pageTitle="bold"
>
```

**Apply with `variant="…"`**: Once the theme variables are defined, any `<Text>` in the scope can use them by setting the `variant` attribute:

```xmlui
<Text variant="pageTitle">Dashboard Overview</Text>
<Text variant="caption">Updated 5 minutes ago</Text>
```

**[Heading](/docs/reference/components/Heading) per-level variables**: Use `textColor-H1`, `fontSize-H2`, `fontWeight-H3`, `letterSpacing-H4` (up to H6) to style heading levels independently without creating custom components:

```xmlui
<Theme
  textColor-H1="$color-primary-700"
  textColor-H2="$color-secondary-600"
  fontWeight-H3="normal"
>
```

**Scoping**: Variants are resolved from the closest enclosing `<Theme>`. A deeply nested `<Theme>` can redefine the same variant name with different values — useful for sections that need a different typographic palette.

**Hover state is supported for interactive variants**: Add `textColor-Text-myVariant--hover` (double dash before `hover`) to make a variant respond to cursor entry — useful for clickable badge-style text or inline labels.

**Define in `config.json` for app-wide reuse**: Add the same vars to the `themeVars` object in your `config.json` theme file to make them available throughout the entire app without a `<Theme>` wrapper at every use site.

**Custom variants coexist with built-in variants**: Defining `textColor-Text-pageTitle` does not affect `textColor-Text-caption` or any other built-in variant. Each variant's vars are namespaced by variant name and are completely independent.

---

**See also**
- [Text component](/docs/reference/components/Text) — predefined variants and custom variant documentation
- [Heading component](/docs/reference/components/Heading) — per-level H1–H6 theme variables
- [Theme Variables](/docs/styles-and-themes/theme-variables#property-names) — full list of supported CSS-like property names
