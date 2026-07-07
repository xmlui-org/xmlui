# Scope a theme to a card or section

Wrap a part of the UI in a Theme tag to apply a different tone or colors locally.

Your main page uses a light tone, but one card needs to stand out — a "Pro upgrade" promotional card with a dark background and a distinct accent colour. Wrap just that card in `<Theme>` to apply scoped styling while the rest of the page stays untouched.

```xmlui-pg copy display name="Scoped themes on pricing cards"
---app display
<App>
  <HStack wrapContent itemWidth="33%">
    <Card title="Free">
      <VStack>
        <Text variant="strong" fontSize="24px">$0</Text>
        <Text>5 projects</Text>
        <Text>1 GB storage</Text>
        <Text>Community support</Text>
        <Button label="Current plan" variant="outlined" themeColor="secondary" />
      </VStack>
    </Card>

    <Theme tone="dark" color-primary="#9b59b6">
      <Card title="Pro">
        <VStack>
          <Text variant="strong" fontSize="24px">$19/mo</Text>
          <Text>Unlimited projects</Text>
          <Text>50 GB storage</Text>
          <Text>Priority support</Text>
          <Button label="Upgrade" variant="solid" themeColor="primary" />
        </VStack>
      </Card>
    </Theme>

    <Theme tone="dark" color-primary="#e67e22">
      <Card title="Enterprise">
        <VStack>
          <Text variant="strong" fontSize="24px">Custom</Text>
          <Text>Unlimited everything</Text>
          <Text>Dedicated support</Text>
          <Text>SLA guarantee</Text>
          <Button label="Contact sales" variant="solid" themeColor="primary" />
        </VStack>
      </Card>
    </Theme>
  </HStack>
</App>
```

## Key points

**`<Theme>` as a scoping wrapper**: Everything inside the `<Theme>` tag inherits the overridden values. Everything outside stays completely untouched. This makes it safe to theme individual cards, sections, or panels without side effects:

```xmlui
<Theme tone="dark" color-primary="#9b59b6">
  <!-- only this Card gets the dark purple treatment -->
  <Card title="Pro">…</Card>
</Theme>
```

**Tone scoping**: `<Theme tone="dark">` flips only the enclosed subtree to the dark palette. Buttons, text, backgrounds — all components inside automatically use their dark-tone styles:

```xmlui
<Theme tone="dark">
  <VStack backgroundColor="$backgroundColor-primary">
    <Text>Dark section</Text>
  </VStack>
</Theme>
```

**Colour scoping**: `<Theme color-primary="#9b59b6">` replaces the primary colour and all its [generated shades (50–950)](/docs/styles-and-themes/theme-variables#colors-in-themes) only inside the wrapper. Other sections keep the app-wide primary colour.

**[`applyIf`](/docs/reference/components/Theme#applyif) for conditional scoping**: Toggle the theme on or off dynamically. For example, highlight only the recommended plan:

```xmlui
<Theme
  tone="dark"
  color-primary="#9b59b6"
  applyIf="{plan === 'recommended'}"
>
  <Card title="Pro">…</Card>
</Theme>
```

When `applyIf` evaluates to `false`, the children render without the theme wrapper — as if the `<Theme>` tag was not there.

**Nesting themes**: A `<Theme>` inside another `<Theme>` merges its overrides on top of the parent's. Only the explicitly set variables are replaced; everything else cascades down from the outer theme:

```xmlui
<Theme color-primary="#9b59b6">
  <!-- purple primary everywhere here -->
  <Theme tone="dark">
    <!-- still purple primary, but now in dark tone -->
    <Card title="Nested">…</Card>
  </Theme>
</Theme>
```

---

**See also**
- [Theme component](/docs/reference/components/Theme) — full attribute reference including `tone`, `color-*`, and `applyIf`
- [Colors in Themes](/docs/styles-and-themes/theme-variables#colors-in-themes) — how colour palettes and shades are generated
- [Themes intro](/docs/themes-intro) — introduction to the XMLUI theme system
