# Create a custom color theme

Define a new theme JSON, register it, and set it as default or let the user switch to it.

The default XMLUI theme uses a blue-tinted palette, but your brand may call for something different. Instead of overriding colors on every component, set the base color tokens once on a `<Theme>` wrapper and every nested component picks them up automatically.

```xmlui-pg copy display name="Custom color theme"
---app display
<App>
  <VStack>
    <H3>Custom warm palette</H3>
    <Theme
      color-primary="#d35400"
      color-secondary="#16a085"
      color-surface="#fdf6ec"
    >
      <VStack backgroundColor="$backgroundColor-primary">
        <HStack>
          <Button 
            label="Solid primary" 
            variant="solid" 
            themeColor="primary" 
          />
          <Button 
            label="Outlined secondary" 
            variant="outlined" 
            themeColor="secondary" 
          />
        </HStack>
        <HStack>
          <Badge value="Active" />
          <Badge value="Archived" variant="pill" />
        </HStack>
        <ProgressBar value="0.65" />
        <HStack>
          <Checkbox 
            initialValue="{true}" 
            label="Agree to terms" 
            labelPosition="start"
          />
          <Switch 
            initialValue="{true}" 
            label="Notifications" 
            labelPosition="start"
          />
        </HStack>
        <HStack>
          <Text value="Success" color="$color-success" />
          <Text value="Warning" color="$color-warn" />
          <Text value="Danger" color="$color-danger" />
        </HStack>
      </VStack>
    </Theme>

    <H3>Built-in green variant</H3>
    <Theme themeId="xmlui-green">
      <VStack backgroundColor="$backgroundColor-primary">
        <HStack>
          <Button 
            label="Solid primary" 
            variant="solid" 
            themeColor="primary" 
          />
          <Button
            label="Outlined secondary" 
            variant="outlined" 
            themeColor="secondary" 
          />
        </HStack>
        <HStack>
          <Badge value="Active" />
          <Badge value="Archived" variant="pill" />
        </HStack>
        <ProgressBar value="0.65" />
      </VStack>
    </Theme>
  </VStack>
</App>
```

## Key points

**`color-primary`, `color-secondary`, `color-surface`**: These three attributes on `<Theme>` override the base hues for the entire subtree. XMLUI generates [all 11 shades](/docs/styles-and-themes/theme-variables#colors-in-themes) (50, 100, 200, …, 900, 950) from the value you supply — which becomes the 500 shade:

```xmlui
<Theme
  color-primary="#d35400"
  color-secondary="#16a085"
  color-surface="#fdf6ec"
>
  <!-- every component here uses these colors -->
</Theme>
```

**Pick a mid-tone for shade 500**: The base color you supply is used as the middle shade. If you choose a very dark or very light value, most of the generated scale will be too similar to be useful. Aim for a colour that works well as a button background.

**Semantic color tokens**: Besides the three base colors, you can also override `color-warn`, `color-danger`, `color-success`, and `color-info` to match your brand's signal colours:

```xmlui
<Theme
  color-primary="#d35400"
  color-warn="#f39c12"
  color-danger="#c0392b"
  color-success="#27ae60"
  color-info="#2980b9"
>
```

**`themeId` switches to a built-in variant**: XMLUI ships with `xmlui` (default), `xmlui-green`, `xmlui-gray`, `xmlui-orange`, `xmlui-purple`, `xmlui-cyan`, and `xmlui-red`. Setting `themeId` applies the entire pre-built palette without specifying individual colours:

```xmlui
<Theme themeId="xmlui-red">
  <!-- red-tinted primary, surface, and secondary -->
</Theme>
```

**Global vs. scoped**: Wrapping `<App>` in a single `<Theme>` sets the palette for the entire application. Wrapping just one section creates a localised override — a technique covered in more depth in the *Scope a theme to a card or section* article.

---

**See also**
- [Theme component](/docs/reference/components/Theme) — all supported attributes including `themeId`, `tone`, and `applyIf`
- [Colors in Themes](/docs/styles-and-themes/theme-variables#colors-in-themes) — how the 11-shade colour palette is generated and named
- [Theme Variables](/docs/styles-and-themes/theme-variables) — full list of overridable colour tokens
- [Themes intro](/docs/themes-intro) — overview of the XMLUI theme system
