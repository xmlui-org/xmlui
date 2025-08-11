%-DESC-START

**Key features:**

- **Layout adaptation**: Automatically positions navigation horizontally or vertically based on App layout
- **Navigation organization**: Contains NavLink and NavGroup components to build structured menus
- **Logo integration**: Supports custom logo templates in vertical layouts via logoTemplate property
- **Drawer mode**: Can optionally display navigation in a collapsible drawer interface
- **Theme integration**: Inherits styling from the app's theme system for consistent appearance

%-DESC-END

%-PROP-START logoTemplate

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

%-PROP-END
