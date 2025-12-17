# Card [#card]

`Card` is a versatile container that groups related content with a visual boundary, typically featuring background color, padding, borders, and rounded corners. It's ideal for organizing information, creating sections, and establishing visual hierarchy in your interface.

**Key features:**
- **Pre-styled elements**: Built-in support for `title`, `subtitle`, and `avatarUrl` properties
- **Flexible layout**: Choose `vertical` (default) or `horizontal` orientation
- **Visual grouping**: Automatic styling with background, borders, and spacing
- **Clickable areas**: Supports click events for interactive cards
## Using Card [#using-card]

`Card` is a container; it does not have any explicit properties.
You can nest the card's content into the `<Card>` tag:

```xmlui-pg copy display name="Example: using Card"
<App>
  <Card maxWidth="200px">
    <HStack verticalAlignment="center">
      <Icon name="info" />
      <Text value="Information" variant="strong" />
    </HStack>
    <Text value="This is an example text" />
  </Card>
</App>
```

There are also prestyled properties one can make use of, detailed in the [Properties section](#properties).
Prestyled elements always appear above other children.

```xmlui-pg copy display name="Example: using Card with prestyled elements"
<App>
  <Card
    avatarUrl="https://i.pravatar.cc/100"
    title="Example Title"
    subtitle="Predefined subtitle"
    maxWidth="300px">
    <HStack verticalAlignment="center">
      <Icon name="info"/>
      This is a card
    </HStack>
  </Card>
</App>
```

## Properties [#properties]

### `avatarSize` [#avatarsize]

This prop sets the size of the avatar. The default value is `sm`.

Available values: `xs`, `sm`, `md`, `lg`

### `avatarUrl` [#avatarurl]

The url for an avarar image. If not specified, but [`showAvatar`](#showAvatar) is true, Card will show the first letters of the [`title`](#title).

### `linkTo` [#linkto]

This optional property wraps the title in a `Link` component that is clickable to navigate.

### `orientation` (default: "vertical") [#orientation-default-vertical]

An optional property that governs the Card's orientation (whether the Card lays out its children in a row or a column). If the orientation is set to `horizontal`, the Card will display its children in a row, except for its [`title`](#title) and [`subtitle`](#subtitle).

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally |
| `vertical` | The component will fill the available space vertically **(default)** |

```xmlui-pg copy display name="Example: orientation"
<App>
  <Card title="Example Title" subtitle="Example Subtitle" orientation="horizontal">
    <SpaceFiller />
    <Text>Text child #1</Text>
    <Text>Text child #2</Text>
    <Button label="Button Child" />
  </Card>
</App>
```

### `showAvatar` (default: false) [#showavatar-default-false]

Indicates whether the avatar should be displayed

Note that in the demo below if the `avatarUrl` is specified, `showAvatar` is automatically set to true but can still be hidden.

```xmlui-pg copy display name="Example: showAvatar"
<App>
  <Card maxWidth="300px" avatarUrl="https://i.pravatar.cc/100" />
  <Card maxWidth="300px" showAvatar="true" title="Example Card" />
  <Card maxWidth="300px" showAvatar="true" />
</App>
```

### `subtitle` [#subtitle]

This prop sets the pre-styled subtitle. If the property is not set, no subtitle is displayed in the Card.

This prop sets the prestyled subtitle.

```xmlui-pg copy display name="Example: subtitle"
<App>
  <Card maxWidth="300px" subtitle="Example Subtitle" />
</App>
```

### `title` [#title]

This prop sets the pre-styled title. If the property is not set, no title is displayed in the Card.

This prop sets the prestyled title.

```xmlui-pg copy display name="Example: title"
<App>
  <Card maxWidth="300px" title="Example Title" />
</App>
```

## Events [#events]

### `click` [#click]

This event is triggered when the Card is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

This event is triggered when the `Card` is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <Card maxWidth="300px" onClick="toast('Clicked!')">
    <HStack verticalAlignment="center">
      <Icon name="info" />
      <Text value="Information" variant="strong" />
    </HStack>
    <Text value="This is an example text" />
  </Card>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`avatar`**: The avatar displayed within the card, if any.
- **`subtitle`**: The subtitle of the card.
- **`title`**: The title of the card.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Card | $color-surface-raised | $color-surface-raised |
| [border](../styles-and-themes/common-units/#border)-Card | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottom](../styles-and-themes/common-units/#border)-Card | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Card | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Card | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Card | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Card | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Card | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-Card | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Card | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Card | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Card | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Card | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Card | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Card | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-Card | none | none |
| [gap](../styles-and-themes/common-units/#size)-avatar-Card | $gap-normal | $gap-normal |
| [gap](../styles-and-themes/common-units/#size)-Card | var(--stack-gap-default) | var(--stack-gap-default) |
| [gap](../styles-and-themes/common-units/#size)-title-Card | $gap-none | $gap-none |
| [horizontalAlignment](../styles-and-themes/common-units/#alignment)-title-Card | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-Card | $space-4 | $space-4 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Card | *none* | *none* |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-title-Card | center | center |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`gap-Card`** | The gap between the component's children. |
| **`gap-title-Card`** | The gap between the title and the subtitle |
| **`gap-avatar-Card`** | The gap between the avatar and the title panel |
| **`horizontalAlignment-title-Card`** | The horizontal alignment of panel with the title and subtitle |
| **`verticalAlignment-title-Card`** | The vertical alignment of the title and subtitle to the avatar |
