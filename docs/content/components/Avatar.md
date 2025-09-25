# Avatar [#avatar]

`Avatar` displays a user or entity's profile picture as a circular image, with automatic fallback to initials when no image is provided. It's commonly used in headers, user lists, comments, and anywhere you need to represent a person or organization.

**Key features:**
- **Automatic fallback**: Shows initials when no image URL is provided or image fails to load
- **Multiple sizes**: From `xs` (extra small) to `lg` (large) to fit different contexts
- **Clickable**: Supports click events for profile actions, modals, or navigation
- **Accessible**: Automatically generates appropriate alt text from the name

## Properties [#properties]

### `name` [#name]

This property sets the name value the Avatar uses to display initials. If neither this property nor `url` is defined, an empty avatar is displayed.

```xmlui-pg copy display name="Example: name"
<App>
  <Avatar name="John, Doe" />
</App>
```

### `size` (default: "sm") [#size-default-sm]

This property defines the display size of the Avatar.

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
    <Avatar name="Dorothy Ellen Fuller" />
    <Avatar name="Xavier Schiller" size="xs" />
    <Avatar name="Sebastien Moore" size="sm" />
    <Avatar name="Molly Dough" size="md" />
    <Avatar name="Lynn Gilbert" size="lg" />
  </HStack>
</App>
```

### `url` [#url]

This property specifies the URL of the image to display in the Avatar. If neither this property nor `name` is defined, an empty avatar is displayed.

```xmlui-pg copy display name="Example: url"
<App>
  <Avatar url="https://i.pravatar.cc/100" size="md" />
</App>
```

## Events [#events]

### `click` [#click]

This event is triggered when the avatar is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <HStack verticalAlignment="center">
    <Avatar name="Molly Dough" size="md" onClick="toast('Avatar clicked')" />
    Click the avatar!
  </HStack>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Avatar | $color-surface-100 | $color-surface-100 |
| [border](../styles-and-themes/common-units/#border)-Avatar | 0px solid $color-surface-400A80 | 0px solid $color-surface-400A80 |
| [borderBottom](../styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Avatar | 4px | 4px |
| [borderRight](../styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Avatar | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Avatar | inset 0 0 0 1px rgba(4,32,69,0.1) | inset 0 0 0 1px rgba(4,32,69,0.1) |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Avatar | $fontWeight-bold | $fontWeight-bold |
| [textColor](../styles-and-themes/common-units/#color)-Avatar | $textColor-secondary | $textColor-secondary |
