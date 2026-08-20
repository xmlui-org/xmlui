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

```xmlui-pg name="With when" height="220px"
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

The `ModalDialog` component is also a container such as the [`Card`](/docs/reference/components/Card), that it also accepts child components.

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

### Preventing Accidental Close [#preventing-accidental-close]

Use `setDirty(true)` when dialog content changes. When a dirty dialog is about to close, `ModalDialog` shows a confirmation prompt using `confirmCloseTitle`, `canCloseMessage`, `confirmCloseLabel`, and `cancelCloseLabel`.

When the dialog hosts a `Form`, form field edits automatically count as dialog dirty state. The `dirtyChanged` event fires whenever this combined dirty state changes, so you can update labels, badges, or commands without polling `getDirty()`. Set `skipDirtyConfirmation="true"` when dirty state should still be tracked but closing should not ask for confirmation. If you define `willClose`, that event controls closing instead: returning an explicit `false` prevents the close and skips the dirty confirmation flow.

```xmlui-pg name="Prevent Accidental Close" height="520px"
---app copy display name="Example: prevent accidental close"
<App var.dirtyStatus="clean" var.allowGuardedClose="{false}">
  <HStack gap="$space-2">
    <Button label="Edit Draft" onClick="draftDialog.open()" />
    <Button label="Open Guarded Dialog" onClick="guardedDialog.open()" />
  </HStack>

  <ModalDialog
    id="draftDialog"
    title="Edit Draft"
    confirmCloseTitle="Unsaved Draft"
    canCloseMessage="Discard your unsaved changes?"
    confirmCloseLabel="Discard"
    cancelCloseLabel="Keep Editing"
    onDirtyChanged="(dirty) => dirtyStatus = dirty ? 'dirty' : 'clean'">
    <Form id="draftForm" data="{{ title: 'Quarterly plan', estimate: 12 }}">
      <TextBox label="Title" bindTo="title" />
      <NumberBox label="Estimate" bindTo="estimate" />
    </Form>
    <Text>State: {dirtyStatus}</Text>
    <HStack gap="$space-2">
      <Button
        label="Mark Clean"
        onClick="draftForm.setDirty(false)" />
      <Button label="Close" onClick="draftDialog.close()" />
    </HStack>
  </ModalDialog>

  <ModalDialog
    id="guardedDialog"
    title="Guarded Dialog"
    onWillClose="return allowGuardedClose">
    <Text>{allowGuardedClose
      ? 'This dialog can close now.' : 'Close is currently blocked.'}
    </Text>
    <Button
      label="{allowGuardedClose ? 'Block Close' : 'Allow Close'}"
      onClick="allowGuardedClose = !allowGuardedClose" />
  </ModalDialog>
</App>
---desc
Edit the draft dialog and then close it to see the confirmation prompt. The guarded dialog uses `willClose`, so it stays open while closing is blocked.
```

**Context variables available during execution:**

- `$param`: First parameter passed to the `open()` method
- `$params`: Array of all parameters passed to `open()` method (access with `$params[0]`, `$params[1]`, etc.)

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `cancelCloseLabel` [#cancelcloselabel]

> [!DEF]  default: **"Cancel"**

The label of the confirmation dialog button that keeps a dirty modal dialog open.

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

### `canCloseMessage` [#canclosemessage]

> [!DEF]  default: **"You have unsaved changes. Are you sure you want to close this dialog?"**

The confirmation message shown when the dialog is dirty and the user attempts to close it.

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

### `closeButtonVisible` [#closebuttonvisible]

> [!DEF]  default: **true**

Shows (`true`) or hides (`false`) the visibility of the close button on the dialog.

```xmlui-pg name="The ModalDialog as a Container 2" height="220px"
---app copy display name="Example: closeButtonVisible"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" closeButtonVisible="false" title="Example Dialog" />
</App>
---desc
Click outside the dialog to close it.
```

### `closeOnClickAway` [#closeonclickaway]

> [!DEF]  default: **true**

When `true`, clicking outside the dialog closes it.

```xmlui-pg name="Close on Click Away" height="220px"
---app copy display name="Example: closeOnClickAway"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" closeOnClickAway="false" title="Example Dialog">
    <Text>Clicking outside leaves this dialog open.</Text>
  </ModalDialog>
</App>
---desc
Use the close button to close the dialog.
```

### `confirmCloseLabel` [#confirmcloselabel]

> [!DEF]  default: **"Close"**

The label of the confirmation dialog button that closes a dirty modal dialog.

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

### `confirmCloseTitle` [#confirmclosetitle]

> [!DEF]  default: **"Unsaved changes"**

The title shown in the confirmation dialog when a dirty modal dialog is about to close.

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

### `fullScreen` [#fullscreen]

> [!DEF]  default: **false**

Toggles whether the dialog encompasses the whole UI (`true`) or not and has a minimum width and height (`false`).

```xmlui-pg name="The ModalDialog as a Container" height="220px"
---app copy display name="Example: fullScreen"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" fullScreen="true" title="Example Dialog" />
</App>
---desc
Click the button to display a full-screen dialog. The icon at the top-right corner of the dialog allows you to close it.
```

### `skipDirtyConfirmation` [#skipdirtyconfirmation]

> [!DEF]  default: **false**

When `true`, dirty modal dialogs close without showing the unsaved-changes confirmation prompt.

Set this property to `true` for short or low-risk dialogs where dirty state should still be tracked, but closing the dialog should not show the unsaved-changes confirmation prompt.

See [Preventing Accidental Close](#preventing-accidental-close) for context.

### `title` [#title]

Provides a prestyled heading to display the intent of the dialog.

```xmlui-pg copy {3} display name="Example: title" height="220px"
<App>
  <Button label="Open Dialog" onClick="dialog.open()" />
  <ModalDialog id="dialog" title="Example Title" />
</App>
```

### `titleTemplate` [#titletemplate]

A custom template to render the dialog title.

## Events [#events]

### `close` [#close]

This event is fired when the close button is pressed or the user clicks outside the `ModalDialog`.

**Signature**: `close(): void`

In this example, the `close` event counts how many times you closed the dialog:

```xmlui-pg name="The ModalDialog as a Container 3" height="220px"
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

### `dirtyChanged` [#dirtychanged]

Fires when the ModalDialog's dirty state changes. The event receives the new dirty state.

**Signature**: `dirtyChanged(dirty: boolean): void`

- `dirty`: The new dirty state of the ModalDialog.

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

### `open` [#open]

This event is fired when the `ModalDialog` is opened either via a `when` or an imperative API call (`open()`).

**Signature**: `open(...params: any[]): void`

- `params`: Parameters passed to the open() method, accessible via $param and $params context variables.

In this example, the `open` event counts how many times you opened the dialog:

```xmlui-pg name="The ModalDialog as a Container 4" height="220px"
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

### `willClose` [#willclose]

This event is fired before the `ModalDialog` closes. Return an explicit `false` value to prevent the dialog from closing. When this event is defined, dirty-state confirmation is skipped.

**Signature**: `willClose(): boolean | void`

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method is used to close the `ModalDialog`. Invoke it using `modalId.close()` where `modalId` refers to a `ModalDialog` component.

**Signature**: `close(): void`

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

### `getDirty` [#getdirty]

This method returns whether the modal dialog is currently marked dirty.

**Signature**: `getDirty(): boolean`

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

### `open` [#open]

This method imperatively opens the modal dialog. You can pass an arbitrary number of parameters to the method. In the `ModalDialog` instance, you can access those with the `$param` and `$params` context values.

**Signature**: `open(...params: any[]): void`

- `params`: An arbitrary number of parameters that can be used to pass data to the dialog.

See the [\`With Imperative API\`](#with-imperative-api) subsection for an example.

### `setDirty` [#setdirty]

This method marks the modal dialog as dirty or clean. Dirty dialogs ask for confirmation before closing unless `willClose` is defined.

**Signature**: `setDirty(dirty: boolean): void`

- `dirty`: When `true`, the dialog is marked dirty; when `false`, it is marked clean.

See [Preventing Accidental Close](#preventing-accidental-close) for an example.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`content`**: The main content area of the modal dialog.
- **`title`**: The title area of the modal dialog.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | $backgroundColor-primary | $backgroundColor-primary |
| [backgroundColor-overlay-ModalDialog](/docs/styles-and-themes/common-units/#color) | $backgroundColor-overlay | $backgroundColor-overlay |
| [backgroundColor-title-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-ModalDialog](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-ModalDialog](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-ModalDialog](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-ModalDialog](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-ModalDialog](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-ModalDialog](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-ModalDialog](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [direction-title-ModalDialog](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-ModalDialog](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily | $fontFamily |
| [fontFamily-title-ModalDialog](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-title-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | $fontSize-2xl | $fontSize-2xl |
| [fontStretch-title-ModalDialog](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-title-ModalDialog](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontVariant-title-ModalDialog](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-title-ModalDialog](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [letterSpacing-title-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-title-ModalDialog](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-title-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [marginBottom-title-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [maxHeight-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | 100% | 100% |
| [maxWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | 450px | 450px |
| [minWidth-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | $space-7 | $space-7 |
| [padding-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | $paddingVertical-ModalDialog | $paddingVertical-ModalDialog |
| [paddingBottom-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | $paddingHorizontal-ModalDialog | $paddingHorizontal-ModalDialog |
| [paddingLeft-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | $paddingHorizontal-ModalDialog | $paddingHorizontal-ModalDialog |
| [paddingRight-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | $paddingVertical-ModalDialog | $paddingVertical-ModalDialog |
| [paddingTop-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-overlay-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textAlign-title-ModalDialog](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-title-ModalDialog](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-ModalDialog](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-title-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-title-ModalDialog](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-title-ModalDialog](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-title-ModalDialog](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-title-ModalDialog](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-title-ModalDialog](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-title-ModalDialog](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-title-ModalDialog](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textUnderlineOffset-title-ModalDialog](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [wordBreak-title-ModalDialog](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-title-ModalDialog](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-title-ModalDialog](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-title-ModalDialog](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
