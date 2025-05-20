import xmluiLogo from  "../../component-samples/Logo/xmlui-logo.svg";

# Logo [#logo]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `Logo` component represents a logo or a brand symbol. Usually, you use this component in the [`AppHeader`](./AppHeader.mdx#logotemplate).

You can learn more about using logos in application layouts in the [App Component](/learning/using-components/app-component/) article.

## Using Logo [#using-logo]

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
  <Pages defaultRoute="/">
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

## Properties [#properties]

This component does not have any properties.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
