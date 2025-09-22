%-DESC-START

**Key features:**

- **Hierarchical organization**: Creates nested menu structures by containing NavLinks and other NavGroups
- **Expand/collapse behavior**: Users can toggle visibility of grouped navigation items
- **Customizable icons**: Different icons for expanded/collapsed states and layout orientations
- **Flexible placement**: Works within NavPanel for app navigation or standalone for custom menus
- **Initial state control**: Configure whether groups start expanded or collapsed

## Using `NavGroup`

The primary use of a `NavGroup` is to create an application menu with submenus, as the following example shows:

```xmlui-pg copy display name="Example: NavGroup in App" height="280px"
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

```xmlui-pg copy display name="Example: NavGroup in a Stack" height="280px"
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

### Custom Icons

You can also provide custom icons for a specific NavGroup component via it's respective property:

- [iconHorizontalCollapsed](#iconHorizontalCollapsed)
- [iconHorizontalExpanded](#iconHorizontalExpanded)
- [iconVerticalCollapsed](#iconVerticalCollapsed)
- [iconVerticalExpanded](#iconVerticalExpanded)

See the following for an example of all variants:

```xmlui-pg copy display name="Example: custom icons in horizontal layout" height="250px"
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

%-DESC-END

%-PROP-START icon

Look at this example:

```xmlui-pg copy {3, 5} display name="Example: label and icon" height="280px"
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

%-PROP-END

%-PROP-START iconHorizontalCollapsed

For an example, see the [Custom Icons section](#custom-icons).

%-PROP-END

%-PROP-START iconHorizontalExpanded

For an example, see the [Custom Icons section](#custom-icons).

%-PROP-END

%-PROP-START iconVerticalCollapsed

For an example, see the [Custom Icons section](#custom-icons).

%-PROP-END

%-PROP-START iconVerticalExpanded

For an example, see the [Custom Icons section](#custom-icons).

%-PROP-END

%-PROP-START label

This property sets the text displayed as the name of the `NavGroup`.

For an example, see the [section on the icon property](#icon).

%-PROP-END
