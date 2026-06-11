# FocusScope [#focusscope]

`FocusScope` traps Tab navigation inside its subtree and restores focus when the subtree unmounts. Use it for custom popovers, drawers, and modal surfaces.

Use `FocusScope` when you build a custom overlay, popover-like panel, or inline
editor that should temporarily own keyboard focus. Built-in components such as
`ModalDialog` and `Drawer` already manage their own focus behavior; `FocusScope`
is for custom surfaces assembled from lower-level components.

To try the example, tab through the controls. Focus cycles inside the scoped
panel instead of moving to the button after it.

```xmlui-pg copy display height="320px" name="Example: trap focus in a panel"
<App>
  <VStack gap="$space-4">
    <FocusScope>
      <VStack padding="$space-4" gap="$space-3" border="1px solid $borderColor">
        <H3>Edit status</H3>
        <Select initialValue="open">
          <Option value="open" label="Open" />
          <Option value="closed" label="Closed" />
        </Select>
        <HStack>
          <Button label="Cancel" />
          <Button label="Save" />
        </HStack>
      </VStack>
    </FocusScope>

    <Button label="Outside scope" />
  </VStack>
</App>
```

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

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

When true, the first focusable child receives focus after mount.

### `restore` [#restore]

> [!DEF]  default: **true**

When true, focus returns to the previously focused element on unmount.

Click **Edit customer**, then click **Cancel** or **Save**. Focus returns to
the button that opened the scope.

```xmlui-pg copy display height="360px" name="Example: restore focus on close"
<App>
  <Fragment var.editing="{false}">
    <Button label="Edit customer" onClick="editing = true" />

    <FocusScope when="{editing}" restore="true">
      <VStack padding="$space-4" gap="$space-3" border="1px solid $borderColor">
        <H3>Edit customer</H3>
        <TextBox label="Name" initialValue="Ada Lovelace" />
        <TextBox label="Email" initialValue="ada@example.com" />
        <HStack>
          <Button label="Cancel" onClick="editing = false" />
          <Button label="Save" onClick="editing = false" />
        </HStack>
      </VStack>
    </FocusScope>
  </Fragment>
</App>
```

### `trap` [#trap]

> [!DEF]  default: **true**

When true, Tab and Shift+Tab cycle inside the scope.

```xmlui-pg copy display height="260px" name="Example: focus without trapping"
<App>
  <VStack gap="$space-4">
    <FocusScope trap="false" autoFocus="true" restore="true">
      <VStack padding="$space-4" border="1px solid $borderColor">
        <TextBox label="Quick note" />
        <Button label="Add note" />
      </VStack>
    </FocusScope>

    <Button label="Outside scope" />
  </VStack>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
