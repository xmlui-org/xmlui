# ModalDialog [#modaldialog]

`ModalDialog` creates overlay dialogs that appear on top of the main interface, ideal for forms, confirmations, detailed views, or any content that requires focused user attention. Dialogs are programmatically opened using the `open()` method and can receive parameters for dynamic content.

**Key features:**
- **Overlay presentation**: Appears above existing content with backdrop dimming
- **Programmatic control**: Open and close via exposed methods like `open()` and `close()`
- **Parameter passing**: Accept data when opened for dynamic dialog content
- **Focus management**: Automatically handles focus trapping and accessibility
- **Form integration**: When containing Form components, automatically closes on form submission or cancellation (unless overridden)

## Using the Component [#using-the-component]

>[!INFO]
> When using the examples in this article, pop them out to the full screen to check how they work.

Opening and closing the modal dialog can be done in two ways depending on circumstances.

### With Imperative API [#with-imperative-api]

Event-driven display of the `ModalDialog` dialog is also possible using imperative API.

This method is a good way to toggle the display of the `ModalDialog` if no deep linking is necessary.
It also lends to itself that these events can be triggered programmatically from codebehind.

Note the `id` property of the `ModalDialog` in the example below and how it is used to call the [`open`](#open-api) and [`close`](#close-api)
operations of the component in the `onClick` event handlers.

```xmlui-pg copy display name="Example: imperative API" height="220px"
<App>
  <ModalDialog id="dialog" title="Example Dialog">
    <Button label="Close Dialog" onClick="dialog.close()" />
  </ModalDialog>
  <Button label="Open Dialog" onClick="dialog.open()" />
</App>
```

>[!INFO]
> The imperative approach is perhaps the most intuitive way to display and hide modal dialogs.

### With `when` [#with-when]

The `when` property accepts a primitive boolean or a binding expression resolving to a boolean value to toggle the display of a component.

Using the `when` property in a `ModalDialog` dialog component is commonly used with deep linking:
showing the modal in conjunction with an updated URL so that the opened state of the modal dialog is referable.

```xmlui-pg height="220px"
---app copy display name="Example: when"
<App>
  <variable name="isDialogShown" value="{false}"/>
  <Button label="Open Dialog" onClick="isDialogShown = true" />
  <ModalDialog 
    when="{isDialogShown}" 
    title="Example Dialog" 
    onClose="isDialogShown = false" />
</App>
---desc
Click on the button in the demo below to open the modal dialog. Click anywhere outside the opened dialog or the close button to close it.
```

Setting the `when` property is the most straightforward way for deep-linked modals. If you use deep links with query parameters to show a particular dialog, you can set the `when` property to show or hide the dialog according to parameter values.

### The `ModalDialog` as a Container [#the-modaldialog-as-a-container]

The `ModalDialog` component is also a container such as the [`Card`](/components/Card), that it also accepts child components.

```xmlui-pg copy {3-8} display name="Example: children" height="340px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Dialog">
    <Form data="{{ firstName: 'Billy', lastName: 'Bob' }}">
      <FormItem bindTo="firstName" required="true" />
      <FormItem bindTo="lastName" required="true" />
    </Form>
  </ModalDialog>
</App>
```

>[!INFO]
> When a form is nested into a modal dialog, closing the form (canceling it or completing its submit action) automatically closes the dialog.

**Context variables available during execution:**

- `$param`: First parameter passed to the `open()` method
- `$params`: Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.)

## Properties [#properties]

### `closeButtonVisible` (default: true) [#closebuttonvisible-default-true]

Shows (`true`) or hides (`false`) the visibility of the close button on the dialog.

```xmlui-pg height="220px"
---app copy display name="Example: closeButtonVisible"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" closeButtonVisible="false" title="Example Dialog" />
</App>
---desc
Click outside the dialog to close it.
```

### `fullScreen` (default: false) [#fullscreen-default-false]

Toggles whether the dialog encompasses the whole UI (`true`) or not and has a minimum width and height (`false`).

```xmlui-pg height="220px"
---app copy display name="Example: fullScreen"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" fullScreen="true" title="Example Dialog" />
</App>
---desc
Click the button to display a full-screen dialog. The icon at the top-right corner of the dialog allows you to close it.
```

### `title` [#title]

Provides a prestyled heading to display the intent of the dialog.

```xmlui-pg copy {3} display name="Example: title" height="220px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Title" />
</App>
```

## Events [#events]

### `close` [#close]

This event is fired when the close button is pressed or the user clicks outside the `ModalDialog`.

In this example, the `close` event counts how many times you closed the dialog:

```xmlui-pg height="220px"
---app copy {6-8} display name="Example: open/close events"
<App>
  <Button label="Open Dialog" onClick="myDialog.open()" />
  <ModalDialog
    id="myDialog"
    title="Example Dialog"
    var.counter="{0}"
    onClose="counter++">
    <Text value="Dialog closed {counter} number of times." />
  </ModalDialog>
</App>
---desc
Open and close the dialog several times to test that it changes the counter.
```

### `open` [#open]

This event is fired when the `ModalDialog` is opened either via a `when` or an imperative API call (`open()`).

In this example, the `open` event counts how many times you opened the dialog:

```xmlui-pg height="220px"
---app copy {6-8} display name="Example: open/close events"
<App>
  <Button label="Open Dialog" onClick="myDialog.open()" />
  <ModalDialog
    id="myDialog"
    title="Example Dialog"
    var.counter="{0}"
    onOpen="counter++">
    <Text value="Dialog opened {counter} number of times." />
  </ModalDialog>
</App>
---desc
Open and close the dialog several times to test that it changes the counter.
```

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method is used to close the `ModalDialog`. Invoke it using `modalId.close()` where `modalId` refers to a `ModalDialog` component.

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

### `open` [#open]

This method imperatively opens the modal dialog. You can pass an arbitrary number of parameters to the method. In the `ModalDialog` instance, you can access those with the `$paramq` and `$params` context values.

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ModalDialog | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-ModalDialog | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-overlay-ModalDialog | $backgroundColor-overlay | $backgroundColor-overlay |
| [backgroundColor](../styles-and-themes/common-units/#color)-overlay-ModalDialog | $backgroundColor-overlay | $backgroundColor-overlay |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ModalDialog | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ModalDialog | $borderRadius | $borderRadius |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-ModalDialog | $fontFamily | $fontFamily |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-ModalDialog | $fontFamily | $fontFamily |
| [marginBottom](../styles-and-themes/common-units/#size)-title-ModalDialog | 0 | 0 |
| [marginBottom](../styles-and-themes/common-units/#size)-title-ModalDialog | 0 | 0 |
| [maxWidth](../styles-and-themes/common-units/#size)-ModalDialog | 450px | 450px |
| [maxWidth](../styles-and-themes/common-units/#size)-ModalDialog | 450px | 450px |
| [minWidth](../styles-and-themes/common-units/#size)-ModalDialog | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-ModalDialog | $space-7 | $space-7 |
| [padding](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-ModalDialog | $paddingVertical-ModalDialog | $paddingVertical-ModalDialog |
| [paddingBottom](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-ModalDialog | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-ModalDialog | $paddingHorizontal-ModalDialog | $paddingHorizontal-ModalDialog |
| [paddingLeft](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-ModalDialog | $paddingHorizontal-ModalDialog | $paddingHorizontal-ModalDialog |
| [paddingRight](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-ModalDialog | $paddingVertical-ModalDialog | $paddingVertical-ModalDialog |
| [paddingTop](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-ModalDialog | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-overlay-ModalDialog | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-ModalDialog | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-ModalDialog | $textColor-primary | $textColor-primary |
