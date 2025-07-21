%-DESC-START

**Key features:**
- **Custom actions**: Execute JavaScript code instead of navigation when using onClick handlers
- **Visual customization**: Support for icons, labels, and completely custom nested content
- **Accessibility support**: Proper focus management and keyboard navigation

## Using NavLink

### `NavLink` Appearance

You can use the `label` and `icon` properties of a `NavLink` to set its text and icon to display.
If you want a custom appearance, you can nest define custom visuals for the `NavLink` by nesting:

```xmlui-pg copy {6-14} display name="Example: NavLink appearance" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink to="/">
       <Stack width="16px" height="16px" backgroundColor="purple" />
       Home
    </NavLink>
    <NavLink to="/about">
       <Stack width="16px" height="16px" backgroundColor="green" />
       About
    </NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/about">About</Page>
  </Pages>
</App>
```

### Actions

By default, activating (clicking) a link navigates to the target URL.
However, you can create a link that executes an explicit action responding to the `click` event instead of the default navigation:

```xmlui-pg copy {7} display name="Example: custom NavLink action" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink to="/" label="Home" />
    <NavLink label="Danger!" onClick="toast('Be careful with this action!')" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

%-DESC-END

%-PROP-START label

```xmlui-pg copy display name="Example: label" height="250px"
<App layout="horizontal">
  <NavPanel>
    <NavLink to="/" label="Home" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

%-PROP-END

%-PROP-START vertical

Usually, you do not need to use this property.
However, if you create a custom navigation menu component that runs vertically,
you need to manually set this property for the active state to be displayed properly.

The default value for this property is `false`.

```xmlui-pg copy display name="Example: vertical" height="250px"
<App layout="horizontal">
  <NavPanel>
    <NavLink to="/" label="Home" vertical="true" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

%-PROP-END

%-PROP-START icon

```xmlui-pg copy {6-7} display name="Example: icon" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home" />
    <NavLink label="Drives" to="/drives" icon="drive" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/drives">Drives Page</Page>
  </Pages>
</App>
```

%-PROP-END

%-PROP-START displayActive

```xmlui-pg copy display name="Example: displayActive" height="250px"
<App layout="horizontal">
  <NavPanel>
    <NavLink to="/" label="Home" displayActive="false" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

%-PROP-END

%-PROP-START enabled

In the following app, the "Hotels" link is disabled:

```xmlui-pg copy {8} display name="Example: enabled" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyTravel App</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Flights" to="/flights" />
    <NavLink label="Hotels" to="/hotels" enabled="false" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/flights">Flights Page</Page>
    <Page url="/hotels">Hotels Page</Page>
  </Pages>
</App>
```

%-PROP-END

%-PROP-START target

The following example opens the "About XMLUI" link in a new tab:

```xmlui-pg copy {7} display name="Example: target" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="About XMLUI" to="https://docs.xmlui.org/" target="_blank" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/drives">Drives Page</Page>
  </Pages>
</App>
```

%-PROP-END

%-EVENT-START click

The following example shows a message and navigates to the "/status" link after closing the message window:

```xmlui-pg copy {7} display name="Example: click" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink to="/" label="Home" />
    <NavLink label="Check my status" onClick="
        toast('You will be redirected');
        Actions.navigate('/status');
    " />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/status">My Status</Page>
  </Pages>
</App>
```

%-EVENT-END
