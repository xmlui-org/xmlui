# Button [#button]

`Button` is the primary interactive component for triggering actions like form submissions, navigation, opening modals, and API calls. It supports multiple visual styles and sizes to match different UI contexts and importance levels.

**Key features:**
- **Visual hierarchy**: Choose from `solid`, `outlined`, or `ghost` variants to indicate importance
- **Theme colors**: Use `primary`, `secondary`, or `attention` colors for different action types
- **Icon support**: Add icons before or after text, or create icon-only buttons
- **Form integration**: Automatically handles form submission when used in forms

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `autoFocus` [#autofocus]

-  default: **false**

Indicates if the button should receive focus when the page loads.

### `contentPosition` [#contentposition]

-  default: **"center"**

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

-  default: **true**

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

-  default: **"start"**

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

-  default: **"horizontal"**

This property sets the main axis along which the nested components are rendered.

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally **(default)** |
| `vertical` | The component will fill the available space vertically |

### `size` [#size]

-  default: **"sm"**

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

-  default: **"primary"**

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

-  default: **"button"**

This optional string describes how the Button appears in an HTML context. You rarely need to set this property explicitly.

Available values:

| Value | Description |
| --- | --- |
| `button` | Regular behavior that only executes logic if explicitly determined. **(default)** |
| `submit` | The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component. |
| `reset` | Resets all the controls to their initial values. Using it is ill advised for UX reasons. |

### `variant` [#variant]

-  default: **"solid"**

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
| [backgroundColor](../styles-and-themes/common-units/#color)-Button | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button--disabled | $backgroundColor--disabled | $backgroundColor--disabled |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention | $backgroundColor-attention | $backgroundColor-attention |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention--active | $color-danger-500 | $color-danger-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention--hover | $color-danger-400 | $color-danger-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-ghost--active | $color-danger-100 | $color-danger-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-ghost--hover | $color-danger-50 | $color-danger-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--active | $color-danger-100 | $color-danger-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--hover | $color-danger-50 | $color-danger-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-solid | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-solid--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-attention-solid--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary--active | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary--hover | $color-primary-400 | $color-primary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-ghost--active | $color-primary-100 | $color-primary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-ghost--hover | $color-primary-50 | $color-primary-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--active | $color-primary-100 | $color-primary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--hover | $color-primary-50 | $color-primary-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-solid | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-solid--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-primary-solid--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary | $color-secondary-500 | $color-secondary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary--active | $color-secondary-500 | $color-secondary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary--hover | $color-secondary-400 | $color-secondary-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-ghost--active | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-ghost--hover | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--active | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--hover | $color-secondary-50 | $color-secondary-50 |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-solid | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button | transparent | transparent |
| [borderColor](../styles-and-themes/common-units/#color)-Button--disabled | $borderColor--disabled | $borderColor--disabled |
| [borderColor](../styles-and-themes/common-units/#color)-Button--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention | $color-attention | $color-attention |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention-outlined | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention-solid | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention-solid--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-attention-solid--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary-outlined | $color-primary-600 | $color-primary-600 |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--hover | $color-primary-500 | $color-primary-500 |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary-solid | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary-solid--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-primary-solid--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary | $color-secondary-100 | $color-secondary-100 |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--hover | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary-solid | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--active | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--hover | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-attention-ghost | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-attention-outlined | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-attention-solid | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-primary-ghost | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-primary-outlined | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-primary-solid | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-secondary-ghost | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-secondary-outlined | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Button-secondary-solid | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button | solid | solid |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button--hover | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button-attention-outlined | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button-attention-solid | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button-primary-outlined | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button-primary-solid | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button-secondary-outlined | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Button-secondary-solid | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button | 1px | 1px |
| [borderWidth](../styles-and-themes/common-units/#size)-Button--hover | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-attention-ghost | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-attention-outlined | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-attention-solid | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-primary-ghost | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-primary-outlined | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-primary-solid | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-secondary-ghost | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-secondary-outlined | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Button-secondary-solid | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button--hover | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-attention-outlined | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-attention-solid | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-attention-solid--active | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-primary-outlined | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-primary-solid | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-primary-solid--active | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-secondary-outlined | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-secondary-solid | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Button-secondary-solid--active | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-attention-ghost | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-attention-outlined | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-attention-solid | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-primary-ghost | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-primary-outlined | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-primary-solid | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-secondary-ghost | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-secondary-outlined | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Button-secondary-solid | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button | $fontSize-sm | $fontSize-sm |
| [fontSize](../styles-and-themes/common-units/#size)-Button-attention-ghost | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-attention-outlined | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-attention-solid | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-primary-ghost | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-primary-outlined | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-primary-solid | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-secondary-ghost | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-secondary-outlined | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Button-secondary-solid | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Button | $fontStyle-normal | $fontStyle-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button | $fontWeight-medium | $fontWeight-medium |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-attention-ghost | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-attention-outlined | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-attention-solid | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-primary-ghost | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-primary-outlined | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-primary-solid | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-secondary-ghost | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-secondary-outlined | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Button-secondary-solid | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-Button | $space-2 | $space-2 |
| [height](../styles-and-themes/common-units/#size)-Button | fit-content | fit-content |
| [outlineColor](../styles-and-themes/common-units/#color)-Button--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-attention-ghost--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-attention-solid--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-primary-ghost--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-primary-solid--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-secondary-ghost--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--focus | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-attention-ghost--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-attention-outlined--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-attention-solid--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-primary-ghost--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-primary-outlined--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-primary-solid--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-secondary-ghost--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-secondary-outlined--focus | *none* | *none* |
| [outlineOffset](../styles-and-themes/common-units/#size)-Button-secondary-solid--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-attention-ghost--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-attention-outlined--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-attention-solid--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-primary-ghost--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-primary-outlined--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-primary-solid--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-secondary-ghost--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-secondary-outlined--focus | *none* | *none* |
| [outlineStyle](../styles-and-themes/common-units/#border)-Button-secondary-solid--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button--focus | $outlineWidth--focus | $outlineWidth--focus |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-attention-ghost--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-attention-outlined--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-attention-solid--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-primary-ghost--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-primary-outlined--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-primary-solid--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-secondary-ghost--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-secondary-outlined--focus | *none* | *none* |
| [outlineWidth](../styles-and-themes/common-units/#size)-Button-secondary-solid--focus | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Button | $space-2 $space-4 | $space-2 $space-4 |
| [padding](../styles-and-themes/common-units/#size)-Button-lg | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Button-md | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Button-sm | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Button-xs | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Button | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Button-lg | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Button-md | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Button-sm | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Button-xs | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Button | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Button-lg | $space-5 | $space-5 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Button-md | $space-4 | $space-4 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Button-sm | $space-4 | $space-4 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Button-xs | $space-1 | $space-1 |
| [paddingLeft](../styles-and-themes/common-units/#size)-Button | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Button-lg | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Button-md | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Button-sm | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Button-xs | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Button | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Button-lg | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Button-md | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Button-sm | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Button-xs | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Button | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Button-lg | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Button-md | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Button-sm | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Button-xs | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Button | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Button-lg | $space-4 | $space-4 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Button-md | $space-3 | $space-3 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Button-sm | $space-2 | $space-2 |
| [paddingVertical](../styles-and-themes/common-units/#size)-Button-xs | $space-0_5 | $space-0_5 |
| [textColor](../styles-and-themes/common-units/#color)-Button | $color-surface-950 | $color-surface-950 |
| [textColor](../styles-and-themes/common-units/#color)-Button--disabled | $textColor--disabled | $textColor--disabled |
| [textColor](../styles-and-themes/common-units/#color)-Button--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-ghost | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-ghost--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-ghost--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-outlined | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-outlined--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-solid | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-solid--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-attention-solid--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-ghost | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-ghost--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-ghost--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-outlined | $color-primary-900 | $color-primary-900 |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--active | $color-primary-900 | $color-primary-900 |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-outlined--hover | $color-primary-950 | $color-primary-950 |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-solid | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-solid--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-primary-solid--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-ghost | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-ghost--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-ghost--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-outlined--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-solid | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-secondary-solid--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Button-solid | $const-color-surface-50 | $const-color-surface-50 |
| [transition](../styles-and-themes/common-units/#transition)-Button | color 0.2s, background 0.2s | color 0.2s, background 0.2s |
| [transition](../styles-and-themes/common-units/#transition)-Button-attention-solid | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-Button-primary-solid | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-Button-secondary-solid | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-Button | fit-content | fit-content |
