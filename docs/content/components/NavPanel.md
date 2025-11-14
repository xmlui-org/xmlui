# NavPanel [#navpanel]

`NavPanel` defines the navigation structure within an App, serving as a container for NavLink and NavGroup components that create your application's primary navigation menu. Its appearance and behavior automatically adapt based on the App's layout configuration.

**Key features:**

- **Layout adaptation**: Automatically positions navigation horizontally or vertically based on App layout
- **Navigation organization**: Contains NavLink and NavGroup components to build structured menus
- **Logo integration**: Supports custom logo templates in vertical layouts via logoTemplate property
- **Drawer mode**: Can optionally display navigation in a collapsible drawer interface
- **Theme integration**: Inherits styling from the app's theme system for consistent appearance

## Properties [#properties]

### `inDrawer` (default: false) [#indrawer-default-false]

This property determines if the navigation panel is displayed in a drawer.

### `logoTemplate` [#logotemplate]

This property defines the logo template to display in the navigation panel with the `vertical` and `vertical-sticky` layout.

```xmlui-pg copy {3-8} display name="Example: logoTemplate" height={250}
<App layout="vertical">
  <NavPanel>
    <property name="logoTemplate">
       <H3>
         <Icon name="drive" />
         DriveDiag (Nav)
       </H3>
    </property>
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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavPanel | $backgroundColor | $backgroundColor |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavPanel-horizontal | $backgroundColor-AppHeader | $backgroundColor-AppHeader |
| [border](../styles-and-themes/common-units/#border)-NavPanel | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](../styles-and-themes/common-units/#border)-NavPanel | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NavPanel | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-NavPanel | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-NavPanel | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-NavPanel-vertical | 1px solid $borderColor | 1px solid $borderColor |
| [color](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-NavPanel | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NavPanel | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-NavPanel | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-NavPanel | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NavPanel | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NavPanel-vertical | 4px 0 4px 0 rgb(0 0 0 / 10%) | 4px 0 4px 0 rgb(0 0 0 / 10%) |
| [horizontalAlignment](../styles-and-themes/common-units/#alignment)-logo-NavPanel | center | center |
| [marginBottom](../styles-and-themes/common-units/#size)-logo-NavPanel | $space-4 | $space-4 |
| [padding](../styles-and-themes/common-units/#size)-logo-NavPanel | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-logo-NavPanel | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-logo-NavPanel | $space-4 | $space-4 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-NavPanel | 0 | 0 |
| [paddingLeft](../styles-and-themes/common-units/#size)-logo-NavPanel | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-logo-NavPanel | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-logo-NavPanel | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-NavPanel | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-logo-NavPanel | $space-4 | $space-4 |
| [paddingVertical](../styles-and-themes/common-units/#size)-NavPanel | $space-5 | $space-5 |
