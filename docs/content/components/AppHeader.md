# AppHeader [#appheader]

`AppHeader` defines the top navigation bar of your application within the [`App`](/components/App) component. It automatically handles logo placement, application title, and user profile areas with built-in responsive behavior.

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
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

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
| [alignment](../styles-and-themes/common-units/#alignment)-content-AppHeader | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-AppHeader | $color-surface-raised | $color-surface-raised |
| [border](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-AppHeader | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottomColor](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-AppHeader | 0px | 0px |
| [borderRight](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-AppHeader | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-AppHeader | $space-14 | $space-14 |
| [maxWidth](../styles-and-themes/common-units/#size)-AppHeader | $maxWidth-App | $maxWidth-App |
| [maxWidth-content](../styles-and-themes/common-units/#size)-AppHeader | $maxWidth-content-App | $maxWidth-content-App |
| [padding](../styles-and-themes/common-units/#size)-AppHeader | $paddingTop-AppHeader $paddingRight-AppHeader $paddingBottom-AppHeader $paddingLeft-AppHeader | $paddingTop-AppHeader $paddingRight-AppHeader $paddingBottom-AppHeader $paddingLeft-AppHeader |
| [padding](../styles-and-themes/common-units/#size)-drawerToggle-AppHeader | $space-0_5 | $space-0_5 |
| [padding](../styles-and-themes/common-units/#size)-logo-AppHeader | $paddingTop-logo-AppHeader $paddingRight-logo-AppHeader $paddingBottom-logo-AppHeader $paddingLeft-logo-AppHeader | $paddingTop-logo-AppHeader $paddingRight-logo-AppHeader $paddingBottom-logo-AppHeader $paddingLeft-logo-AppHeader |
| [paddingBottom](../styles-and-themes/common-units/#size)-AppHeader | $paddingVertical-AppHeader | $paddingVertical-AppHeader |
| [paddingBottom](../styles-and-themes/common-units/#size)-logo-AppHeader | $paddingVertical-logo-AppHeader | $paddingVertical-logo-AppHeader |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-AppHeader | $space-4 | $space-4 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-logo-AppHeader | $space-0 | $space-0 |
| [paddingLeft](../styles-and-themes/common-units/#size)-AppHeader | $paddingHorizontal-AppHeader | $paddingHorizontal-AppHeader |
| [paddingLeft](../styles-and-themes/common-units/#size)-logo-AppHeader | $paddingHorizontal-logo-AppHeader | $paddingHorizontal-logo-AppHeader |
| [paddingRight](../styles-and-themes/common-units/#size)-AppHeader | $paddingHorizontal-AppHeader | $paddingHorizontal-AppHeader |
| [paddingRight](../styles-and-themes/common-units/#size)-logo-AppHeader | $paddingHorizontal-logo-AppHeader | $paddingHorizontal-logo-AppHeader |
| [paddingTop](../styles-and-themes/common-units/#size)-AppHeader | $paddingVertical-AppHeader | $paddingVertical-AppHeader |
| [paddingTop](../styles-and-themes/common-units/#size)-logo-AppHeader | $paddingVertical-logo-AppHeader | $paddingVertical-logo-AppHeader |
| [paddingVertical](../styles-and-themes/common-units/#size)-AppHeader | $space-0 | $space-0 |
| [paddingVertical](../styles-and-themes/common-units/#size)-logo-AppHeader | $space-0 | $space-0 |
| [width](../styles-and-themes/common-units/#size)-logo-AppHeader | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`padding‑logo‑AppHeader`** | This theme variable sets the padding of the logo in the app header (including all `padding` variants, such as `paddingLeft-logo-AppHeader` and others). |
| **`width‑logo‑AppHeader`** | Sets the width of the displayed logo |
