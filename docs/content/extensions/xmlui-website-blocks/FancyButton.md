# FancyButton [#fancybutton]

`FancyButton` is an enhanced interactive component for triggering actions with advanced styling options. It provides rounded and square variants for different design aesthetics while maintaining all standard button functionality.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `autoFocus`

> [!DEF]  default: **false**

Indicates if the button should receive focus when the page loads.

### `contentPosition`

> [!DEF]  default: **"center"**

This optional value determines how the label and icon (or nested children) should be placedinside the FancyButton component.

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle **(default)** |
| `start` | Justify the content to the left (to the right if in right-to-left) |
| `end` | Justify the content to the right (to the left if in right-to-left) |

### `contextualLabel`

This optional value is used to provide an accessible name for the FancyButton in the context of its usage.

### `enabled`

> [!DEF]  default: **true**

The value of this property indicates whether the button accepts actions (`true`) or does not react to them (`false`).

### `icon`

This string value denotes an icon name. The framework will render an icon if XMLUI recognizes the icon by its name. If no label is specified and an icon is set, the FancyButton displays only that icon.

### `iconPosition`

> [!DEF]  default: **"start"**

This optional string determines the location of the icon in the FancyButton.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) **(default)** |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) |

### `label`

This property is an optional string to set a label for the FancyButton. If no label is specified and an icon is set, the FancyButton will modify its styling to look like a small icon button. When the FancyButton has nested children, it will display them and ignore the value of the `label` prop.

### `size`

> [!DEF]  default: **"md"**

Sets the size of the button.

Available values:

| Value | Description |
| --- | --- |
| `xs` | Extra small |
| `sm` | Small |
| `md` | Medium **(default)** |
| `lg` | Large |
| `xl` | Extra large |

### `type`

> [!DEF]  default: **"button"**

This optional string describes how the FancyButton appears in an HTML context. You rarely need to set this property explicitly.

Available values:

| Value | Description |
| --- | --- |
| `button` | Regular behavior that only executes logic if explicitly determined. **(default)** |
| `submit` | The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component. |
| `reset` | Resets all the controls to their initial values. Using it is ill advised for UX reasons. |

### `variant`

> [!DEF]  default: **"rounded"**

The button variant determines the visual style and corner treatment.

Available values:

| Value | Description |
| --- | --- |
| `rounded` | Rounded variant with soft corners **(default)** |
| `square` | Square variant with sharp corners |
| `pill` | Pill variant with fully rounded edges |
| `outlinedPill` | Outlined pill variant with fully rounded edges |

## Events

### `click`

This event is triggered when the FancyButton is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

### `gotFocus`

This event is triggered when the FancyButton has received the focus.

**Signature**: `gotFocus(): void`

### `lostFocus`

This event is triggered when the FancyButton has lost the focus.

**Signature**: `lostFocus(): void`

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
