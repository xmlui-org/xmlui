%-DESC-START

**Key features:**

- **Logo customization**: Use `logoTemplate` to create rich logo designs beyond simple images
- **Profile menu**: Add user authentication displays, settings menus, or action buttons via `profileMenuTemplate`
- **Layout integration**: Automatically positioned and styled based on your App's `layout` property

%-DESC-END

%-PROP-START logoTemplate

This property defines the template to use for the logo.
With this property, you can construct your custom logo instead of using a single image.

```xmlui-pg copy display {3-8} name="Example: logoTemplate" height="150px"
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

%-PROP-END

%-PROP-START profileMenuTemplate

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

%-PROP-END
