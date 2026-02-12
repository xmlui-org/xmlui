# Logo [#logo]

`Logo` displays your application's brand symbol by automatically loading logo images defined in the app manifest. While logos are typically configured using App-level properties (`logo`, `logo-dark`), this component provides direct control when you need custom logo placement or templating.

Most apps use `logo="path/to/logo.svg"` on the App component rather than using `<Logo>` directly. Use this component when you need custom logo positioning or want to combine logos with other elements in a `logoTemplate`.

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

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `alt` [#alt]

-  default: **"Logo"**

Alternative text for the logo image for accessibility.

### `inline` [#inline]

-  default: **false**

When set to true, the image will be displayed as an inline element instead of a block element.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
