# Button [#button]

`Button` is the primary interactive component for triggering actions like form submissions, navigation, opening modals, and API calls. It supports multiple visual styles and sizes to match different UI contexts and importance levels.

**Key features:**
- **Visual hierarchy**: Choose from `solid`, `outlined`, or `ghost` variants to indicate importance
- **Theme colors**: Use `primary`, `secondary`, or `attention` colors for different action types
- **Icon support**: Add icons before or after text, or create icon-only buttons
- **Form integration**: Automatically handles form submission when used in forms

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

Indicates if the button should receive focus when the page loads.

### `busyOnClick` [#busyonclick]

> [!DEF]  default: **false**

When `true`, the Button auto-disables itself while its `onClick` handler is running, preventing accidental double-submits. Combine with `handlerPolicy:click="single-flight"` for full dispatcher-level deduplication of rapid repeated clicks.

### `contentPosition` [#contentposition]

> [!DEF]  default: **"center"**

This optional value determines how the label and icon (or nested children) should be placedinside the Button component.

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle **(default)** |
| `start` | Justify the content to the left (to the right if in right-to-left) |
| `end` | Justify the content to the right (to the left if in right-to-left) |

```xmlui-pg copy display name="Example: content position"
<App>
  <Button width="200px" icon="drive" label="Button" contentPosition="center" />
  <Button width="200px" icon="drive" label="Button" contentPosition="start" />
  <Button width="200px" icon="drive" label="Button" contentPosition="end" />
  <Button width="200px" contentPosition="end">
    This is a nested text
  </Button>
</App>
```

### `contextualLabel` [#contextuallabel]

This optional value is used to provide an accessible name for the Button in the context of its usage.

### `enabled` [#enabled]

> [!DEF]  default: **true**

The value of this property indicates whether the button accepts actions (`true`) or does not react to them (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <HStack>
    <Button label="I am enabled (by default)" />
    <Button label="I am enabled explicitly" enabled="true" />
    <Button label="I am not enabled" enabled="false" />
  </HStack>
</App>
```

### `icon` [#icon]

This string value denotes an icon name. The framework will render an icon if XMLUI recognizes the icon by its name. If no label is specified and an icon is set, the Button displays only that icon.

```xmlui-pg copy display name="Example: icon"
<App>
  <HStack>
    <Button icon="drive" label="Let there be drive" />
    <Button icon="drive" />
  </HStack>
</App>
```

### `iconPosition` [#iconposition]

> [!DEF]  default: **"start"**

This optional string determines the location of the icon in the Button.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) **(default)** |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) |

```xmlui-pg copy display name="Example: icon position"
<App>
  <HStack>
    <Button icon="drive" label="Left" />
    <Button icon="drive" label="Right" iconPosition="right" />
  </HStack>
  <HStack>
    <Button icon="drive" label="Start" iconPosition="start" />
    <Button icon="drive" label="End" iconPosition="end" />
  </HStack>
  <HStack>
    <Button 
      icon="drive" 
      label="Start (right-to-left)" 
      iconPosition="start" 
      direction="rtl" />
    <Button 
      icon="drive" 
      label="End (right-to-left)" 
      iconPosition="end" 
      direction="rtl" />
  </HStack>
</App>
```

### `label` [#label]

This property is an optional string to set a label for the Button. If no label is specified and an icon is set, the Button will modify its styling to look like a small icon button. When the Button has nested children, it will display them and ignore the value of the `label` prop.

```xmlui-pg copy display name="Example: label"
<App>
  <Button label="I am the button label" />
  <Button />
  <Button label="I am the button label">
    <Icon name="trash" />
    I am a text nested into Button
  </Button>
</App>
```

### `orientation` [#orientation]

> [!DEF]  default: **"horizontal"**

This property sets the main axis along which the nested components are rendered.

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally **(default)** |
| `vertical` | The component will fill the available space vertically |

### `size` [#size]

> [!DEF]  default: **"sm"**

Sets the size of the button.

Available values:

| Value | Description |
| --- | --- |
| `xs` | Extra small |
| `sm` | Small **(default)** |
| `md` | Medium |
| `lg` | Large |
| `xl` | Extra large |

```xmlui-pg copy display name="Example: size"
<App>
  <HStack>
    <Button icon="drive" label="default" />
    <Button icon="drive" label="extra-small" size="xs" />
    <Button icon="drive" label="small" size="sm" />
    <Button icon="drive" label="medium" size="md" />
    <Button icon="drive" label="large" size="lg" />
  </HStack>
  <HStack>
    <Button label="default" />
    <Button label="extra-small" size="xs" />
    <Button label="small" size="sm" />
    <Button label="medium" size="md" />
    <Button label="large" size="lg" />
  </HStack>
</App>
```

### `themeColor` [#themecolor]

> [!DEF]  default: **"primary"**

Sets the button color scheme defined in the application theme.

Available values:

| Value | Description |
| --- | --- |
| `attention` | Attention state theme color |
| `primary` | Primary theme color **(default)** |
| `secondary` | Secondary theme color |

```xmlui-pg copy display name="Example: theme colors"
<App>
  <HStack>
    <Button label="Button" themeColor="primary" />
    <Button label="Button" themeColor="secondary" />
    <Button label="Button" themeColor="attention" />
  </HStack>
</App>  
```

### `type` [#type]

> [!DEF]  default: **"button"**

This optional string describes how the Button appears in an HTML context. You rarely need to set this property explicitly.

Available values:

| Value | Description |
| --- | --- |
| `button` | Regular behavior that only executes logic if explicitly determined. **(default)** |
| `submit` | The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component. |
| `reset` | Resets all the controls to their initial values. Using it is ill advised for UX reasons. |

### `variant` [#variant]

> [!DEF]  default: **"solid"**

The button variant determines the level of emphasis the button should possess.

Available values:

| Value | Description |
| --- | --- |
| `solid` | A button with a border and a filled background. **(default)** |
| `outlined` | The button is displayed with a border and a transparent background. |
| `ghost` | A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked. |

```xmlui-pg copy display name="Example: variant"
<App>
  <HStack>
    <Button label="default (solid)" />
    <Button label="solid" variant="solid" />
    <Button label="outlined" variant="outlined" />
    <Button label="ghost" variant="ghost" />
  </HStack>
</App>
```

> The `outlined` border color of a `primary` Button resolves to the shared `borderColor-outlined` theme token. Form inputs that opt into `variant="outlined"` (for example `Select variant="outlined"`) read from the same token, so an outlined Button and an outlined Select sitting next to each other always share the same border color.

## Events [#events]

### `click` [#click]

This event is triggered when the Button is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

```xmlui-pg copy display name="Example: click"
<App>
  <Button label="Click me!" onClick="toast('Button clicked')" />
</App>
```

### `contextMenu` [#contextmenu]

This event is triggered when the Button is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `gotFocus` [#gotfocus]

This event is triggered when the Button has received the focus.

**Signature**: `gotFocus(): void`

```xmlui-pg copy display name="Example: gotFocus"
<App var.text="No event" >
  <HStack verticalAlignment="center" >
    <Button label="First, click me!" 
      onGotFocus="text = 'Focus received'" 
      onLostFocus="text = 'Focus lost'" />
    <Text value="Then, me!"/>
  </HStack>
  <Text value="{text}" />
</App>
```

### `lostFocus` [#lostfocus]

This event is triggered when the Button has lost the focus.

**Signature**: `lostFocus(): void`

(See the example above)

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`icon`**: The icon displayed within the button, if any.

## Styling [#styling]

### Fixed width and height [#fixed-width-and-height]

Using a set of buttons with a fixed width or height is often helpful. So `Button` supports these theme variables:
- `width-Button`
- `height-Button`

Avoid setting the `width-Button` and `height-Button` styles in the theme definition. Instead, wrap the affected button group into a `Theme` component as in the following example:

```xmlui-pg copy name="Example: Buttons with fixed width"
<App>
  <HStack>
    <Theme width-Button="120px">
      <Button label="Short" />
      <Button label="Longer" />
      <Button label="Longest" />
      <Button label="Disabled" enabled="false" />
      <Button label="Outlined" variant="outlined" />
    </Theme>
  </HStack>
</App>
```

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Button](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-Button--disabled](/docs/styles-and-themes/common-units/#color) | $backgroundColor--disabled | $backgroundColor--disabled |
| [backgroundColor-Button--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-attention](/docs/styles-and-themes/common-units/#color) | $backgroundColor-attention | $backgroundColor-attention |
| [backgroundColor-Button-attention--active](/docs/styles-and-themes/common-units/#color) | $color-danger-500 | $color-danger-500 |
| [backgroundColor-Button-attention--hover](/docs/styles-and-themes/common-units/#color) | $color-danger-400 | $color-danger-400 |
| [backgroundColor-Button-attention-ghost--active](/docs/styles-and-themes/common-units/#color) | $color-danger-100 | $color-danger-100 |
| [backgroundColor-Button-attention-ghost--hover](/docs/styles-and-themes/common-units/#color) | $color-danger-50 | $color-danger-50 |
| [backgroundColor-Button-attention-outlined--active](/docs/styles-and-themes/common-units/#color) | $color-danger-100 | $color-danger-100 |
| [backgroundColor-Button-attention-outlined--hover](/docs/styles-and-themes/common-units/#color) | $color-danger-50 | $color-danger-50 |
| [backgroundColor-Button-attention-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-attention-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-attention-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-primary](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-Button-primary--active](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [backgroundColor-Button-primary--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-400 |
| [backgroundColor-Button-primary-ghost--active](/docs/styles-and-themes/common-units/#color) | $color-primary-100 | $color-primary-100 |
| [backgroundColor-Button-primary-ghost--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-50 | $color-primary-50 |
| [backgroundColor-Button-primary-outlined--active](/docs/styles-and-themes/common-units/#color) | $color-primary-100 | $color-primary-100 |
| [backgroundColor-Button-primary-outlined--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-50 | $color-primary-50 |
| [backgroundColor-Button-primary-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-primary-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-primary-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-secondary](/docs/styles-and-themes/common-units/#color) | $color-secondary-500 | $color-secondary-500 |
| [backgroundColor-Button-secondary--active](/docs/styles-and-themes/common-units/#color) | $color-secondary-500 | $color-secondary-500 |
| [backgroundColor-Button-secondary--hover](/docs/styles-and-themes/common-units/#color) | $color-secondary-400 | $color-secondary-400 |
| [backgroundColor-Button-secondary-ghost--active](/docs/styles-and-themes/common-units/#color) | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor-Button-secondary-ghost--hover](/docs/styles-and-themes/common-units/#color) | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor-Button-secondary-outlined--active](/docs/styles-and-themes/common-units/#color) | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor-Button-secondary-outlined--hover](/docs/styles-and-themes/common-units/#color) | $color-secondary-50 | $color-secondary-50 |
| [backgroundColor-Button-secondary-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-secondary-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-Button-secondary-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [borderColor-Button--disabled](/docs/styles-and-themes/common-units/#color) | $borderColor--disabled | $borderColor--disabled |
| [borderColor-Button--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-attention](/docs/styles-and-themes/common-units/#color) | $color-attention | $color-attention |
| [borderColor-Button-attention-outlined](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-attention-outlined--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-attention-outlined--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-attention-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-attention-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-attention-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-primary](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [borderColor-Button-primary-outlined](/docs/styles-and-themes/common-units/#color) | $borderColor-outlined | $borderColor-outlined |
| [borderColor-Button-primary-outlined--active](/docs/styles-and-themes/common-units/#color) | $borderColor-outlined--active | $borderColor-outlined--active |
| [borderColor-Button-primary-outlined--hover](/docs/styles-and-themes/common-units/#color) | $borderColor-outlined--hover | $borderColor-outlined--hover |
| [borderColor-Button-primary-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-primary-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-primary-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-secondary](/docs/styles-and-themes/common-units/#color) | $color-secondary-100 | $color-secondary-100 |
| [borderColor-Button-secondary-outlined](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-secondary-outlined--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-secondary-outlined--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-secondary-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-secondary-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Button-secondary-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRadius-Button](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-Button-attention-ghost](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-attention-outlined](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-attention-solid](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-primary-ghost](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-primary-outlined](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-primary-solid](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-secondary-ghost](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-secondary-outlined](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderRadius-Button-secondary-solid](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Button](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderStyle-Button--hover](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Button-attention-outlined](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Button-attention-solid](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Button-primary-outlined](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Button-primary-solid](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Button-secondary-outlined](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Button-secondary-solid](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderWidth-Button](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [borderWidth-Button--hover](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-attention-ghost](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-attention-outlined](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-attention-solid](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-primary-ghost](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-primary-outlined](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-primary-solid](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-secondary-ghost](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-secondary-outlined](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Button-secondary-solid](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-Button](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button--hover](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-attention-outlined](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-attention-solid](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-attention-solid--active](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-primary-outlined](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-primary-solid](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-primary-solid--active](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-secondary-outlined](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-secondary-solid](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-Button-secondary-solid--active](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [fontFamily-Button](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-attention-ghost](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-attention-outlined](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-attention-solid](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-primary-ghost](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-primary-outlined](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-primary-solid](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-secondary-ghost](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-secondary-outlined](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-Button-secondary-solid](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-Button](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontSize-Button-attention-ghost](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-attention-outlined](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-attention-solid](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-primary-ghost](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-primary-outlined](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-primary-solid](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-secondary-ghost](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-secondary-outlined](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-Button-secondary-solid](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontStyle-Button](/docs/styles-and-themes/common-units/#fontStyle) | $fontStyle-normal | $fontStyle-normal |
| [fontWeight-Button](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-medium | $fontWeight-medium |
| [fontWeight-Button-attention-ghost](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-attention-outlined](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-attention-solid](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-primary-ghost](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-primary-outlined](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-primary-solid](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-secondary-ghost](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-secondary-outlined](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Button-secondary-solid](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [gap-Button](/docs/styles-and-themes/common-units/#size) | $space-2 | $space-2 |
| [gap-Button-vertical](/docs/styles-and-themes/common-units/#size) | $space-1 | $space-1 |
| [height-Button](/docs/styles-and-themes/common-units/#size-values) | fit-content | fit-content |
| [height-Button-vertical](/docs/styles-and-themes/common-units/#size-values) | fit-content | fit-content |
| [outlineColor-Button--focus](/docs/styles-and-themes/common-units/#color) | $outlineColor--focus | $outlineColor--focus |
| [outlineColor-Button-attention-ghost--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Button-attention-outlined--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Button-attention-solid--focus](/docs/styles-and-themes/common-units/#color) | $color-primary-300 | $color-primary-300 |
| [outlineColor-Button-primary-ghost--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Button-primary-outlined--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Button-primary-solid--focus](/docs/styles-and-themes/common-units/#color) | $color-primary-300 | $color-primary-300 |
| [outlineColor-Button-secondary-ghost--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Button-secondary-outlined--focus](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [outlineColor-Button-secondary-solid--focus](/docs/styles-and-themes/common-units/#color) | $color-primary-300 | $color-primary-300 |
| [outlineOffset-Button--focus](/docs/styles-and-themes/common-units/#size-values) | -1px | -1px |
| [outlineOffset-Button-attention-ghost--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-attention-outlined--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-attention-solid--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-primary-ghost--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-primary-outlined--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-primary-solid--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-secondary-ghost--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-secondary-outlined--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineOffset-Button-secondary-solid--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineStyle-Button--focus](/docs/styles-and-themes/common-units/#border) | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle-Button-attention-ghost--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-attention-outlined--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-attention-solid--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-primary-ghost--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-primary-outlined--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-primary-solid--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-secondary-ghost--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-secondary-outlined--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineStyle-Button-secondary-solid--focus](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [outlineWidth-Button--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth-Button-attention-ghost--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-attention-outlined--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-attention-solid--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-primary-ghost--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-primary-outlined--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-primary-solid--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-secondary-ghost--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-secondary-outlined--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineWidth-Button-secondary-solid--focus](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Button](/docs/styles-and-themes/common-units/#size-values) | $space-2 $space-4 | $space-2 $space-4 |
| [padding-Button-lg](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Button-md](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Button-sm](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-Button-xs](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Button](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Button-lg](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Button-md](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Button-sm](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Button-xs](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Button](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Button-lg](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [paddingHorizontal-Button-md](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingHorizontal-Button-sm](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingHorizontal-Button-xs](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingLeft-Button](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Button-lg](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Button-md](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Button-sm](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Button-xs](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Button](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Button-lg](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Button-md](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Button-sm](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Button-xs](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Button](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Button-lg](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Button-md](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Button-sm](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Button-xs](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Button](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Button-lg](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingVertical-Button-md](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingVertical-Button-sm](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-Button-xs](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [textColor-Button](/docs/styles-and-themes/common-units/#color) | $color-surface-950 | $color-surface-950 |
| [textColor-Button--disabled](/docs/styles-and-themes/common-units/#color) | $textColor--disabled | $textColor--disabled |
| [textColor-Button--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-ghost](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-ghost--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-ghost--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-outlined](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-outlined--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-outlined--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-attention-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-primary-ghost](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-primary-ghost--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-primary-ghost--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-primary-outlined](/docs/styles-and-themes/common-units/#color) | $color-primary-900 | $color-primary-900 |
| [textColor-Button-primary-outlined--active](/docs/styles-and-themes/common-units/#color) | $color-primary-900 | $color-primary-900 |
| [textColor-Button-primary-outlined--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-950 | $color-primary-950 |
| [textColor-Button-primary-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-primary-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-primary-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-ghost](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-ghost--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-ghost--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-outlined](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-outlined--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-outlined--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-solid](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-solid--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-secondary-solid--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-Button-solid](/docs/styles-and-themes/common-units/#color) | $const-color-surface-50 | $const-color-surface-50 |
| [transition-Button](/docs/styles-and-themes/common-units/#transition) | color 0.2s, background 0.2s | color 0.2s, background 0.2s |
| [transition-Button-attention-solid](/docs/styles-and-themes/common-units/#transition) | *none* | *none* |
| [transition-Button-primary-solid](/docs/styles-and-themes/common-units/#transition) | *none* | *none* |
| [transition-Button-secondary-solid](/docs/styles-and-themes/common-units/#transition) | *none* | *none* |
| [width-Button](/docs/styles-and-themes/common-units/#size-values) | fit-content | fit-content |
| [width-Button-vertical](/docs/styles-and-themes/common-units/#size-values) | fit-content | fit-content |
