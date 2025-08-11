%-DESC-START

**Key features:**
- **No CSS required**: Change component appearance using theme variables instead of custom stylesheets
- **Brand consistency**: Maintain design system compliance while allowing contextual variations
- **Scoped styling**: Apply theme changes only to nested components without affecting the global design
- **Variable overrides**: Modify colors, spacing, typography, and other design variables declaratively
- **Nested contexts**: Stack multiple `Theme` components for granular control with automatic specificity rules

See [this guide](/themes-intro) and [these references](/styles-and-themes/layout-props) for details.

## Using `Theme`

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

%-DESC-END

%-PROP-START themeId

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

%-PROP-END

%-PROP-START tone

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

%-PROP-END

%-PROP-START root

If so, it will set a number of important settings for the app:
- what favicon to use
- sets up font links
- specifies the base css
- sets up the root for the toast notification system

Otherwise, the `Theme` component will just provide the theme context to its children.

%-PROP-END

%-STYLE-START

The `Theme` component is a styling wrapper that influences the nested components' visual appearance. It cannot be styled.

%-STYLE-END
