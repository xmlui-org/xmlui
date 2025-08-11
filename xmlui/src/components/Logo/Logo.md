%-DESC-START

Most apps use `logo="path/to/logo.svg"` on the App component rather than using `<Logo>` directly. Use this component when you need custom logo positioning or want to combine logos with other elements in a `logoTemplate`.

## Using Logo

The framework checks the application manifest for a logo resource (SVG file).
If found, it loads and displays it in the Logo component.

This is a sample manifest that shows a logo definition:

```json copy {5}
{
  "name": "Tutorial",
  "version": "0.0.1",
  "resources": {
    "logo": "resources/xmlui-logo.svg",
    "favicon": "resources/favicon.ico"
  }
}
```

In the following example, you can see a custom logo definition in the `AppHeader` via templating.
There is a `Heading` with the title text "MyApp" before the logo.
It also uses the `Logo` component within the template definition:

```xmlui-pg
---app copy display name="Example: using Logo" {6} height="200px"
<App layout="horizontal">
  <AppHeader>
    <property name="logoTemplate">
       <Fragment>
         <Heading level="h2" value="MyApp"/>
         <Logo/>
       </Fragment>
    </property>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <CHStack>
        (Sample content)
      </CHStack>
    </Page>
  </Pages>
</App>
---desc
The markup displays the app's logo:
```

%-DESC-END
