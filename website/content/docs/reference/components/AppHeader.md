# AppHeader [#appheader]

`AppHeader` defines the top navigation bar of your application within the [`App`](/docs/reference/components/App) component. It automatically handles logo placement, application title, and user profile areas with built-in responsive behavior.

**Key features:**

- **Logo customization**: Use `logoTemplate` to create rich logo designs beyond simple images
- **Profile menu**: Add user authentication displays, settings menus, or action buttons via `profileMenuTemplate`
- **Layout integration**: Automatically positioned and styled based on your App's `layout` property

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `logoTemplate` [#logotemplate]

This property defines the template to use for the logo. With this property, you can construct your custom logo instead of using a single image.

This property defines the template to use for the logo.
With this property, you can construct your custom logo instead of using a single image.

```xmlui-pg copy display {3-8} name="Example: logoTemplate" height="170px"
<App>
  <AppHeader>
  <property name="logoTemplate">
    <H3>
      <Icon name="drive" />
      DriveDiag
    </H3>
  </property>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="Page 1" to="/page1"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <Text value="Home" />
    </Page>
    <Page url="/page1">
      <Text value="Page 1" />
    </Page>
  </Pages>
</App>
```

### `profileMenuTemplate` [#profilemenutemplate]

This property makes the profile menu slot of the `AppHeader` component customizable.

This property makes the profile menu slot of the `AppHeader` component customizable.
It accepts component definitions.

```xmlui-pg copy display {3-9} name="Example: profileMenuTemplate" height="150px"
<App>
  <AppHeader>
    <property name="profileMenuTemplate">
      <DropdownMenu>
        <property name="triggerTemplate">
          <Avatar name="Joe" size="xs" borderRadius="50%"/>
        </property>
      </DropdownMenu>
    </property>
  </AppHeader>
</App>
```

### `showLogo` [#showlogo]

> [!DEF]  default: **true**

Show the logo in the header

### `title` [#title]

Title for the application logo

### `titleTemplate` [#titletemplate]

This property defines the template to use for the title. With this property, you can construct your custom title instead of using a single image.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [alignment-content-AppHeader](/docs/styles-and-themes/common-units/#alignment) | *none* | *none* |
| [backgroundColor-AppHeader](/docs/styles-and-themes/common-units/#color) | $color-surface-raised | $color-surface-raised |
| [border-AppHeader](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-AppHeader](/docs/styles-and-themes/common-units/#border) | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottomColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-AppHeader](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-AppHeader](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-AppHeader](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-AppHeader](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-AppHeader](/docs/styles-and-themes/common-units/#border-rounding) | 0px | 0px |
| [borderRight-AppHeader](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-AppHeader](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-AppHeader](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-AppHeader](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-AppHeader](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-AppHeader](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-AppHeader](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [height-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-14 | $space-14 |
| [maxWidth-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $maxWidth-App | $maxWidth-App |
| [maxWidth-content-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $maxWidth-content-App | $maxWidth-content-App |
| [padding-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingTop-AppHeader $paddingRight-AppHeader $paddingBottom-AppHeader $paddingLeft-AppHeader | $paddingTop-AppHeader $paddingRight-AppHeader $paddingBottom-AppHeader $paddingLeft-AppHeader |
| [padding-drawerToggle-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [padding-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingTop-logo-AppHeader $paddingRight-logo-AppHeader $paddingBottom-logo-AppHeader $paddingLeft-logo-AppHeader | $paddingTop-logo-AppHeader $paddingRight-logo-AppHeader $paddingBottom-logo-AppHeader $paddingLeft-logo-AppHeader |
| [paddingBottom-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingVertical-AppHeader | $paddingVertical-AppHeader |
| [paddingBottom-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingVertical-logo-AppHeader | $paddingVertical-logo-AppHeader |
| [paddingHorizontal-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingHorizontal-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [paddingLeft-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingHorizontal-AppHeader | $paddingHorizontal-AppHeader |
| [paddingLeft-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingHorizontal-logo-AppHeader | $paddingHorizontal-logo-AppHeader |
| [paddingRight-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingHorizontal-AppHeader | $paddingHorizontal-AppHeader |
| [paddingRight-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingHorizontal-logo-AppHeader | $paddingHorizontal-logo-AppHeader |
| [paddingTop-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingVertical-AppHeader | $paddingVertical-AppHeader |
| [paddingTop-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $paddingVertical-logo-AppHeader | $paddingVertical-logo-AppHeader |
| [paddingVertical-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [paddingVertical-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [size-drawerToggle-AppHeader](/docs/styles-and-themes/common-units/#size-values) | $space-12 | $space-12 |
| [width-logo-AppHeader](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`padding‑logo‑AppHeader`** | This theme variable sets the padding of the logo in the app header (including all `padding` variants, such as `paddingLeft-logo-AppHeader` and others). |
| **`width‑logo‑AppHeader`** | Sets the width of the displayed logo |
