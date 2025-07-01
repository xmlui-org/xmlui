# NavPanel [#navpanel]

`NavPanel` defines the navigation structure within an App, serving as a container for NavLink and NavGroup components that create your application's primary navigation menu. Its appearance and behavior automatically adapt based on the App's layout configuration.

**Key features:**

- **Layout adaptation**: Automatically positions navigation horizontally or vertically based on App layout
- **Navigation organization**: Contains NavLink and NavGroup components to build structured menus
- **Logo integration**: Supports custom logo templates in vertical layouts via logoTemplate property
- **Drawer mode**: Can optionally display navigation in a collapsible drawer interface
- **Theme integration**: Inherits styling from the app's theme system for consistent appearance

## Properties [#properties]

### `inDrawer (default: false)` [#indrawer-default-false]

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

| Variable                                                                              | Default Value (Light)        | Default Value (Dark)         |
| ------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------- |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavPanel                  | $backgroundColor             | $backgroundColor             |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavPanel-horizontal       | $backgroundColor-AppHeader   | $backgroundColor-AppHeader   |
| [border](../styles-and-themes/common-units/#border)-NavPanel                          | 0px solid $borderColor       | 0px solid $borderColor       |
| [borderBottom](../styles-and-themes/common-units/#border)-NavPanel                    | _none_                       | _none_                       |
| [borderBottomColor](../styles-and-themes/common-units/#color)-NavPanel                | _none_                       | _none_                       |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-NavPanel         | _none_                       | _none_                       |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-NavPanel                 | _none_                       | _none_                       |
| [borderColor](../styles-and-themes/common-units/#color)-NavPanel                      | _none_                       | _none_                       |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel     | _none_                       | _none_                       |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel   | _none_                       | _none_                       |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NavPanel                | _none_                       | _none_                       |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-NavPanel            | _none_                       | _none_                       |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-NavPanel     | _none_                       | _none_                       |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-NavPanel             | _none_                       | _none_                       |
| [borderLeft](../styles-and-themes/common-units/#border)-NavPanel                      | _none_                       | _none_                       |
| [color](../styles-and-themes/common-units/#color)-NavPanel                            | _none_                       | _none_                       |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-NavPanel           | _none_                       | _none_                       |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-NavPanel                   | _none_                       | _none_                       |
| [borderRight](../styles-and-themes/common-units/#border)-NavPanel                     | _none_                       | _none_                       |
| [color](../styles-and-themes/common-units/#color)-NavPanel                            | _none_                       | _none_                       |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-NavPanel          | _none_                       | _none_                       |
| [borderRightWidth](../styles-and-themes/common-units/#size)-NavPanel                  | _none_                       | _none_                       |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel   | _none_                       | _none_                       |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-NavPanel | _none_                       | _none_                       |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NavPanel               | _none_                       | _none_                       |
| [borderTop](../styles-and-themes/common-units/#border)-NavPanel                       | _none_                       | _none_                       |
| [borderTopColor](../styles-and-themes/common-units/#color)-NavPanel                   | _none_                       | _none_                       |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-NavPanel            | _none_                       | _none_                       |
| [borderTopWidth](../styles-and-themes/common-units/#size)-NavPanel                    | _none_                       | _none_                       |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NavPanel                | _none_                       | _none_                       |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-NavPanel              | _none_                       | _none_                       |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-NavPanel       | _none_                       | _none_                       |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-NavPanel               | _none_                       | _none_                       |
| [borderWidth](../styles-and-themes/common-units/#size)-NavPanel                       | _none_                       | _none_                       |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NavPanel                    | _none_                       | _none_                       |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-NavPanel-vertical           | 4px 0 4px 0 rgb(0 0 0 / 10%) | 4px 0 4px 0 rgb(0 0 0 / 10%) |
| [horizontalAlignment](../styles-and-themes/common-units/#alignment)-logo-NavPanel     | center                       | center                       |
| [marginBottom](../styles-and-themes/common-units/#size)-logo-NavPanel                 | $space-4                     | $space-4                     |
| [padding](../styles-and-themes/common-units/#size)-logo-NavPanel                      | _none_                       | _none_                       |
| [padding](../styles-and-themes/common-units/#size)-NavPanel                           | _none_                       | _none_                       |
| [paddingBottom](../styles-and-themes/common-units/#size)-logo-NavPanel                | _none_                       | _none_                       |
| [paddingBottom](../styles-and-themes/common-units/#size)-NavPanel                     | _none_                       | _none_                       |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-logo-NavPanel            | $space-4                     | $space-4                     |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-NavPanel                 | 0                            | 0                            |
| [paddingLeft](../styles-and-themes/common-units/#size)-logo-NavPanel                  | _none_                       | _none_                       |
| [paddingLeft](../styles-and-themes/common-units/#size)-NavPanel                       | _none_                       | _none_                       |
| [paddingRight](../styles-and-themes/common-units/#size)-logo-NavPanel                 | _none_                       | _none_                       |
| [paddingRight](../styles-and-themes/common-units/#size)-NavPanel                      | _none_                       | _none_                       |
| [paddingTop](../styles-and-themes/common-units/#size)-logo-NavPanel                   | _none_                       | _none_                       |
| [paddingTop](../styles-and-themes/common-units/#size)-NavPanel                        | _none_                       | _none_                       |
| [paddingVertical](../styles-and-themes/common-units/#size)-logo-NavPanel              | $space-4                     | $space-4                     |
| [paddingVertical](../styles-and-themes/common-units/#size)-NavPanel                   | _none_                       | _none_                       |
