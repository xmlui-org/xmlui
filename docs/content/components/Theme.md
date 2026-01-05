# Theme [#theme]

`Theme` creates styling contexts to customize the appearance of nested components without using CSS.

**Key features:**
- **No CSS required**: Change component appearance using theme variables instead of custom stylesheets
- **Brand consistency**: Maintain design system compliance while allowing contextual variations
- **Scoped styling**: Apply theme changes only to nested components without affecting the global design
- **Variable overrides**: Modify colors, spacing, typography, and other design variables declaratively
- **Nested contexts**: Stack multiple `Theme` components for granular control with automatic specificity rules

See [this guide](/themes-intro) and [these references](/styles-and-themes/layout-props) for details.

## Using `Theme` [#using-theme]

In contrast to other components, `Theme` accepts theme variables as properties.
You can define specific styles for components nested in `Theme` using these theme variables.

The following example specifies a dark tone for the current theme
and sets several theme variables to style the `ProgressBar` component:

```xmlui-pg copy {3-8} display name="Example: using Theme"
<App>
  <Theme
    tone="dark"
    backgroundColor-ProgressBar="cyan"
    color-indicator-ProgressBar="purple"
    thickness-ProgressBar="12px"
    borderRadius-indicator-ProgressBar="12px"
    borderRadius-Progressbar="4px"
  >
    <VStack backgroundColor="$backgroundColor-primary">
      <ProgressBar value="0"/>
      <ProgressBar value="0.2"/>
      <ProgressBar value="0.6"/>
      <ProgressBar value="1.0"/>
    </VStack>
  </Theme>
</App>
```

## Properties [#properties]

### `applyIf` (default: "auto") [#applyif-default-auto]

This property controls whether the theme wrapper is applied. When true, the theme wraps the children. When false, children are rendered unwrapped. If not explicitly set, defaults to true only when the Theme has meaningful properties (themeId, tone, themeVars, or disableInlineStyle); otherwise defaults to false to avoid unnecessary wrapper elements.

The `applyIf` property controls whether the theme is conditionally applied to its children. When set to `false`, the children are rendered without the theme wrapper, effectively bypassing the theme styling.

```xmlui-pg copy {2,9,16} display name="Example: applyIf"
<App var.apply="{false}">
  <Theme backgroundColor-Button="rgb(255, 100, 100)" applyIf="true">
    <VStack>
      <H3>Theme Applied (applyIf="true"):</H3>
      <Button>Themed Button</Button>
    </VStack>
  </Theme>
  <Theme backgroundColor-Button="rgb(255, 100, 100)" applyIf="false">
    <VStack>
      <H3>Theme Not Applied (applyIf="false"):</H3>
      <Button>Default Button</Button>
    </VStack>
  </Theme>
  <Theme backgroundColor-Button="rgb(100, 192, 100)" applyIf="{apply}">
    <VStack>
      <H3>Conditional Theme (dynamic):</H3>
      <Button onClick="apply = !apply">
        {apply ? 'Themed' : 'Default'} - Click to Toggle
      </Button>
    </VStack>
  </Theme>
</App>
```

This property is particularly useful for:
- **Conditional styling**: Apply themes based on user preferences, feature flags, or application state
- **Theme debugging**: Temporarily disable themes during development
- **Progressive enhancement**: Provide fallback styling when themes fail to load
- **Dynamic theming**: Switch themes on and off based on user interactions or data conditions

### `disableInlineStyle` [#disableinlinestyle]

This property controls whether inline styles are disabled for components within this theme. When undefined, uses the appGlobals.disableInlineStyle setting.

### `root` (default: false) [#root-default-false]

This property indicates whether the component is at the root of the application.

If so, it will set a number of important settings for the app:
- what favicon to use
- sets up font links
- specifies the base css
- sets up the root for the toast notification system

Otherwise, the `Theme` component will just provide the theme context to its children.

### `themeId` [#themeid]

This property specifies which theme to use by setting the theme's id.

```xmlui-pg copy {2, 9, 16} display name="Example: themeId"
<App>
  <Theme themeId="xmlui">
    <VStack backgroundColor="$backgroundColor-primary">
      <H3>Use 'xmlui' theme:</H3>
      <ProgressBar value="0"/>
      <ProgressBar value="0.6"/>
    </VStack>
  </Theme>
  <Theme themeId="xmlui-green">
    <VStack backgroundColor="$backgroundColor-primary">
      <H3>Use 'xmlui-green' theme:</H3>
      <ProgressBar value="0"/>
      <ProgressBar value="0.6"/>
    </VStack>
  </Theme>
  <Theme themeId="xmlui-red">
    <VStack backgroundColor="$backgroundColor-primary">
      <H3>Use the 'xmlui-red' theme:</H3>
      <ProgressBar value="0"/>
      <ProgressBar value="0.6"/>
    </VStack>
  </Theme>
</App>
```

### `tone` (default: "light") [#tone-default-light]

This property allows the setting of the current theme's tone.

Available values: `light` **(default)**, `dark`

```xmlui-pg copy {2,9} display name="Example: tone"
<App>
  <Theme tone="light">
    <VStack backgroundColor="$backgroundColor-primary" >
      <H3>Use the light tone of the base theme:</H3>
      <ProgressBar value="0"/>
      <ProgressBar value="0.6"/>
    </VStack>
  </Theme>
  <Theme tone="dark">
    <VStack backgroundColor="$backgroundColor-primary">
      <H3>Use the dark tone of the base theme:</H3>
      <ProgressBar value="0"/>
      <ProgressBar value="0.6"/>
    </VStack>
  </Theme>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The `Theme` component is a styling wrapper that influences the nested components' visual appearance. It cannot be styled.
