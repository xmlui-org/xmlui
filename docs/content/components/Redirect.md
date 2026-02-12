# Redirect [#redirect]

`Redirect` immediately redirects the browser to the URL in its `to` property when it gets visible (its `when` property gets `true`). It works only within [App](/components/App), not externally.

## Using `Redirect` [#using-redirect]

The following app demonstrates two different patterns for using `Redirect`.

1. When you navigate to the "Redirect #1" page, it immediately redirects the app to the "Accounts" page. By default, the  `when` property of `Redirect` (and any other component) is "true", so redirection immediately happens.
2. The "Redirect #2" page expects you to click the button before redirecting. The button click sets the `when` property of `Redirect` to true, and redirection happens at that moment.

```xmlui-pg copy {14, 20} display name="Example: providing children" height="170px"
<App>
  <NavPanel>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/accounts">Accounts</NavLink>
    <NavLink to="/products">Products</NavLink>
    <NavLink to="/redirect1">Redirect #1</NavLink>
    <NavLink to="/redirect2">Redirect #2</NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/accounts">Accounts</Page>
    <Page url="/products">Products</Page>
    <Page url="/redirect1">
      <Redirect to="/accounts" />
      Redirecting to Accounts...
    </Page>
    <Page url="/redirect2">
      <Fragment var.clicked="{false}">
        <Button label="Click to redirect" onClick="clicked = true"/>
        <Redirect when="{clicked}" to="/accounts" />
        Redirecting to Accounts...
      </Fragment>
    </Page>
  </Pages>
</App>
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

### `replace` [#replace]

-  default: **false**

This boolean property indicates whether the redirect should replace the current history entry or create a new one.

### `to` [#to]

-  default: **""**

This property defines the URL to which this component is about to redirect requests.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
