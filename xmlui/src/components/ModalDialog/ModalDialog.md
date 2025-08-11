%-DESC-START

**Key features:**
- **Overlay presentation**: Appears above existing content with backdrop dimming
- **Programmatic control**: Open and close via exposed methods like `open()` and `close()`
- **Parameter passing**: Accept data when opened for dynamic dialog content
- **Focus management**: Automatically handles focus trapping and accessibility
- **Form integration**: When containing Form components, automatically closes on form submission or cancellation (unless overridden)

## Using the Component

>[!INFO]
> When using the examples in this article, pop them out to the full screen to check how they work.

Opening and closing the modal dialog can be done in two ways depending on circumstances.

### With Imperative API

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

### With `when`

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

### The `ModalDialog` as a Container

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

%-DESC-END

%-PROP-START fullScreen

```xmlui-pg height="220px"
---app copy display name="Example: fullScreen"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" fullScreen="true" title="Example Dialog" />
</App>
---desc
Click the button to display a full-screen dialog. The icon at the top-right corner of the dialog allows you to close it.
```

%-PROP-END

%-PROP-START title

```xmlui-pg copy {3} display name="Example: title" height="220px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Title" />
</App>
```

%-PROP-END

%-PROP-START closeButtonVisible

```xmlui-pg height="220px"
---app copy display name="Example: closeButtonVisible"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" closeButtonVisible="false" title="Example Dialog" />
</App>
---desc
Click outside the dialog to close it.
```

%-PROP-END

%-EVENT-START close

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

%-EVENT-END

%-EVENT-START open

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

%-EVENT-END

%-API-START open

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

%-API-END

%-API-START close

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

%-API-END
