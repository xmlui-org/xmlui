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
| Publish/Subscribe | `subscribeToTopic` |
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
| [alignment](/docs/styles-and-themes/common-units/#alignment)-content-AppHeader | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-AppHeader | $color-surface-raised | $color-surface-raised |
| [border](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-AppHeader | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-AppHeader | 0px | 0px |
| [borderRight](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-AppHeader | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-AppHeader | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-AppHeader | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-AppHeader | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | *none* | *none* |
| [height](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $space-14 | $space-14 |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $maxWidth-App | $maxWidth-App |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $maxWidth-content-App | $maxWidth-content-App |
| [padding](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $paddingTop-AppHeader $paddingRight-AppHeader $paddingBottom-AppHeader $paddingLeft-AppHeader | $paddingTop-AppHeader $paddingRight-AppHeader $paddingBottom-AppHeader $paddingLeft-AppHeader |
| [padding](/docs/styles-and-themes/common-units/#size-values)-drawerToggle-AppHeader | $space-0_5 | $space-0_5 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $paddingTop-logo-AppHeader $paddingRight-logo-AppHeader $paddingBottom-logo-AppHeader $paddingLeft-logo-AppHeader | $paddingTop-logo-AppHeader $paddingRight-logo-AppHeader $paddingBottom-logo-AppHeader $paddingLeft-logo-AppHeader |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $paddingVertical-AppHeader | $paddingVertical-AppHeader |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $paddingVertical-logo-AppHeader | $paddingVertical-logo-AppHeader |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $space-4 | $space-4 |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $space-0 | $space-0 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $paddingHorizontal-AppHeader | $paddingHorizontal-AppHeader |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $paddingHorizontal-logo-AppHeader | $paddingHorizontal-logo-AppHeader |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $paddingHorizontal-AppHeader | $paddingHorizontal-AppHeader |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $paddingHorizontal-logo-AppHeader | $paddingHorizontal-logo-AppHeader |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $paddingVertical-AppHeader | $paddingVertical-AppHeader |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $paddingVertical-logo-AppHeader | $paddingVertical-logo-AppHeader |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-AppHeader | $space-0 | $space-0 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | $space-0 | $space-0 |
| [width](/docs/styles-and-themes/common-units/#size-values)-logo-AppHeader | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`padding‑logo‑AppHeader`** | This theme variable sets the padding of the logo in the app header (including all `padding` variants, such as `paddingLeft-logo-AppHeader` and others). |
| **`width‑logo‑AppHeader`** | Sets the width of the displayed logo |
