# Override a component's theme vars

Use Theme with component-scoped variables to restyle one subtree.

You need Cards in one section of your dashboard to look different — a distinct background, rounder corners, a heavier border — without affecting Cards elsewhere on the page. Wrapping that section in a `<Theme>` with component-scoped theme variables applies the overrides only to the nested components.

```xmlui-pg copy display name="Component-scoped theme overrides"
---app display
<App>
  <VStack>
    <H3>Default Cards</H3>
    <HStack wrapContent itemWidth="50%">
      <Card title="Revenue">
        <Text>$12,400 this month</Text>
      </Card>
      <Card title="Users">
        <Text>3,210 active</Text>
      </Card>
    </HStack>

    <H3>Restyled Cards</H3>
    <Theme
      backgroundColor-Card="$color-primary-50"
      borderRadius-Card="16px"
      borderColor-Card="$color-primary-300"
      borderWidth-Card="2px"
    >
      <HStack wrapContent itemWidth="50%">
        <Card title="Revenue">
          <Text>$12,400 this month</Text>
        </Card>
        <Card title="Users">
          <Text>3,210 active</Text>
        </Card>
      </HStack>
    </Theme>

    <H3>Button with hover override</H3>
    <Theme
      backgroundColor-Button-primary-solid="#9b59b6"
      backgroundColor-Button-primary-solid--hover="#8e44ad"
    >
      <Button label="Custom purple button" variant="solid" themeColor="primary" />
    </Theme>
  </VStack>
</App>
```

## Key points

**Naming convention**: Component theme variables follow the pattern `{property}-{part}-{Component}[--{state}]`. The property is the CSS-like attribute (camelCase), the component name is PascalCase, and optional state suffixes start with `--`. The full list of supported property names is in [Theme Variables](/docs/styles-and-themes/theme-variables#property-names):

```xmlui
backgroundColor-Card              <!-- the Card background -->
borderRadius-Card                 <!-- the Card corner radius -->
borderColor-Button-secondary-outlined--hover  
                                  <!-- outlined secondary Button, hovered -->
```

**Only descendants are affected**: Placing `backgroundColor-Card` on a `<Theme>` only restyles `Card` components nested inside that `<Theme>`. Cards outside the wrapper keep their default look. This is what makes theme variables safe for scoped overrides.

**State suffixes for interactive styles**: Append `--hover`, `--focus`, `--active`, or `--disabled` to target a specific interaction state:

```xmlui
<Theme
  backgroundColor-Button-primary-solid="#9b59b6"
  backgroundColor-Button-primary-solid--hover="#8e44ad"
  backgroundColor-Button-primary-solid--active="#7d3c98"
>
  <Button label="Purple button" variant="solid" themeColor="primary" />
</Theme>
```

**Variant suffixes**: Components with variants (like `Button`) include the variant segments between the component name and the state. `Button` has both a `themeColor` and a `variant`, so the full pattern is `{property}-Button-{themeColor}-{variant}[--{state}]`.

**Multiple overrides on one `<Theme>`**: A single `<Theme>` tag can set variables for different components at once — Cards, Buttons, Badges, and more. This replaces CSS class stacking with a flat, declarative attribute list:

```xmlui
<Theme
  backgroundColor-Card="$color-primary-50"
  borderRadius-Card="16px"
  backgroundColor-Button-primary-solid="#9b59b6"
  borderColor-Badge="$color-primary-400"
>
  <!-- all nested Cards, Buttons, and Badges are restyled -->
</Theme>
```

---

**See also**
- [Theme component](/docs/reference/components/Theme) — full attribute reference
- [Theme Variables](/docs/styles-and-themes/theme-variables#property-names) — complete list of CSS-like property names
- [Color Values](/docs/styles-and-themes/common-units#color) — accepted colour values for colour properties
- [Border Rounding](/docs/styles-and-themes/common-units#border-rounding) — accepted values for `borderRadius` properties
