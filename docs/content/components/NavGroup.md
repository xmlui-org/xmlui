# NavGroup [#navgroup]

`NavGroup` creates collapsible containers for organizing related navigation items into hierarchical menu structures. It groups `NavLink` components and other `NavGroup` components, providing expandable submenus with customizable icons and states.

**Key features:**

- **Hierarchical organization**: Creates nested menu structures by containing NavLinks and other NavGroups
- **Expand/collapse behavior**: Users can toggle visibility of grouped navigation items
- **Customizable icons**: Different icons for expanded/collapsed states and layout orientations
- **Flexible placement**: Works within NavPanel for app navigation or standalone for custom menus
- **Initial state control**: Configure whether groups start expanded or collapsed

## Using `NavGroup` [#using-navgroup]

The primary use of a `NavGroup` is to create an application menu with submenus, as the following example shows:

```xmlui-pg copy display name="Example: NavGroup in App" height="230px"
---app
<App layout="condensed">
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
    <NavGroup label="Pages">
      <NavLink label="Page 1" to="/page/1"/>
      <NavGroup label="Page 2-4">
        <NavLink label="Page 2" to="/page/2"/>
        <NavLink label="Page 3" to="/page/3"/>
        <NavLink label="Page 4" to="/page/4"/>
      </NavGroup>
      <NavLink label="Page 5" to="/page/5"/>
      <NavLink label="Page Other" to="/page/Other"/>
    </NavGroup>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      Home
    </Page>
    <Page url="/page/:id">
      <Text value="Page {$routeParams.id}" />
    </Page>
  </Pages>
</App>
---desc
Here, the highlighted `NavGroup` element nests other `NavLink` and `NavGroup` elements to create a hierarchical menu:
```

You do not have to use `NavGroup` within `NavPanel`; you can nest it into other components to represent a menu, like in the following example:

```xmlui-pg copy display name="Example: NavGroup in a Stack" height="230px"
<App>
  <HStack verticalAlignment="center">
    <Text>Use this menu:</Text>
    <NavGroup label="Pages">
      <NavLink label="Page 1" />
      <NavGroup label="Page 2-4">
        <NavLink label="Page 2" />
        <NavLink label="Page 3" />
        <NavLink label="Page 4" />
      </NavGroup>
      <NavLink label="Page 5" />
      <NavLink label="Page Other" />
    </NavGroup>
  </HStack>
</App>
```

### Custom Icons [#custom-icons]

You can also provide custom icons for a specific NavGroup component via it's respective property:

- [iconHorizontalCollapsed](#iconHorizontalCollapsed)
- [iconHorizontalExpanded](#iconHorizontalExpanded)
- [iconVerticalCollapsed](#iconVerticalCollapsed)
- [iconVerticalExpanded](#iconVerticalExpanded)

See the following for an example of all variants:

```xmlui-pg copy display name="Example: custom icons in horizontal layout" height="200px"
<App layout="horizontal">
  <NavGroup icon="email" label="Send To"
    iconVerticalExpanded="arrowup" iconVerticalCollapsed="arrowbottom">
    <NavLink icon="arrowup" label="Boss" />
    <NavGroup icon="users" label="Team"
      iconHorizontalExpanded="arrowleft" iconHorizontalCollapsed="arrowright">
      <NavLink label="Jane" />
      <NavLink label="Will" />
    </NavGroup>
    <NavLink icon="cube" label="Support" />
  </NavGroup>
</App>
```

## Properties [#properties]

### `enabled` (default: true) [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `icon` [#icon]

This property defines an optional icon to display along with the `NavGroup` label.

This property defines an optional icon to display along with the `NavGroup` label.

Look at this example:

```xmlui-pg copy {3, 5} display name="Example: label and icon" height="230px"
<App>
  <HStack verticalAlignment="center">
    <NavGroup icon="email" label="Send To" >
      <NavLink icon="arrowup" label="Boss" />
      <NavGroup icon="users" label="Team">
        <NavLink label="Jane" />
        <NavLink label="Will" />
        <NavLink label="Sandra" />
      </NavGroup>
      <NavLink icon="cube" label="Support" />
    </NavGroup>
  </HStack>
</App>
```

### `iconHorizontalCollapsed` (default: "chevronright") [#iconhorizontalcollapsed-default-chevronright]

Set a custom icon to display when the navigation menu is collapsed, is in a **horizontal** app layout, and is in a navigation submenu.

For an example, see the [Custom Icons section](#custom-icons).

### `iconHorizontalExpanded` (default: "chevronright") [#iconhorizontalexpanded-default-chevronright]

Set a custom icon to display when the navigation menu is expanded, is in a **horizontal** app layout, and is in a navigation submenu.

For an example, see the [Custom Icons section](#custom-icons).

### `iconVerticalCollapsed` (default: "chevronright") [#iconverticalcollapsed-default-chevronright]

Set a custom icon to display when the navigation menu is collapsed, is in a **vertical** app layout, or is in a **horizontal** layout and is the top-level navigation item in the menu.

For an example, see the [Custom Icons section](#custom-icons).

### `iconVerticalExpanded` (default: "chevrondown") [#iconverticalexpanded-default-chevrondown]

Set a custom icon to display when the navigation menu is expanded, is in a **vertical** app layout, or is in a **horizontal** layout and is the top-level navigation item in the menu.

For an example, see the [Custom Icons section](#custom-icons).

### `initiallyExpanded` [#initiallyexpanded]

This property defines whether the group is initially expanded or collapsed. If not defined, the group is collapsed by default.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

This property sets the text displayed as the name of the `NavGroup`.

For an example, see the [section on the icon property](#icon).

### `to` [#to]

This property defines an optional navigation link.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-dropdown-NavGroup | $backgroundColor-primary | $backgroundColor-primary |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-dropdown-NavGroup | $borderRadius | $borderRadius |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-dropdown-NavGroup | $boxShadow-spread | $boxShadow-spread |
