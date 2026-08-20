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

### `avatarSize` [#avatarsize]

This prop sets the size of the avatar. The default value is `sm`.

Available values: `xs`, `sm`, `md`, `lg`

### `avatarUrl` [#avatarurl]

The url for an avarar image. If not specified, but [`showAvatar`](#showAvatar) is true, Card will show the first letters of the [`title`](#title).

### `horizontalAlignment` [#horizontalalignment]

> [!DEF]  default: **"start"**

Manages the horizontal content alignment for each child element in the Card.

Available values: `start` **(default)**, `center`, `end`

### `linkTo` [#linkto]

This optional property wraps the title in a `Link` component that is clickable to navigate.

### `orientation` [#orientation]

> [!DEF]  default: **"vertical"**

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

### `showAvatar` [#showavatar]

> [!DEF]  default: **false**

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

### `verticalAlignment` [#verticalalignment]

> [!DEF]  default: **"start"**

Manages the vertical content alignment for each child element in the Card.

Available values: `start` **(default)**, `center`, `end`

## Events [#events]

### `click` [#click]

This event is triggered when the Card is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

This event is triggered when the `Card` is clicked.

```xmlui-pg copy display name="Example: click"
<App>
  <Card maxWidth="300px" onClick="toast.success('Clicked!')">
    <HStack verticalAlignment="center">
      <Icon name="info" />
      <Text value="Information" variant="strong" />
    </HStack>
    <Text value="This is an example text" />
  </Card>
</App>
```

### `contextMenu` [#contextmenu]

This event is triggered when the Card is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `doubleClick` [#doubleclick]

This event is triggered when the Card is double-clicked.

**Signature**: `doubleClick(event: MouseEvent): void`

- `event`: The mouse event object.

This event is triggered when the `Card` is double-clicked. When both `onClick` and `onDoubleClick` are used together, only the first click of the double-click fires `onClick`, so `onClick` is not called twice.

```xmlui-pg copy display name="Example: doubleClick"
<App>
  <Card maxWidth="300px" onDoubleClick="toast('Double-clicked!')">
    <HStack verticalAlignment="center">
      <Icon name="info" />
      <Text value="Double-click me" variant="strong" />
    </HStack>
    <Text value="This is an example text" />
  </Card>
</App>
```

## Exposed Methods [#exposed-methods]

### `scrollToBottom` [#scrolltobottom]

Scrolls the Card container to the bottom. Works when the Card has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToEnd` [#scrolltoend]

Scrolls the Card container to the end (right in LTR, left in RTL). Works when the Card has an explicit width and overflowX is set to 'scroll'.

**Signature**: `scrollToEnd(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToStart` [#scrolltostart]

Scrolls the Card container to the start (left in LTR, right in RTL). Works when the Card has an explicit width and overflowX is set to 'scroll'.

**Signature**: `scrollToStart(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToTop` [#scrolltotop]

Scrolls the Card container to the top. Works when the Card has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`avatar`**: The avatar displayed within the card, if any.
- **`subtitle`**: The subtitle of the card.
- **`title`**: The title of the card.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Card](/docs/styles-and-themes/common-units/#color) | $color-surface-raised | $color-surface-raised |
| [backgroundColor-Card--hover](/docs/styles-and-themes/common-units/#color) | $color-surface-raised | $color-surface-raised |
| [border-Card](/docs/styles-and-themes/common-units/#border) | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottom-Card](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-Card](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Card](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-Card](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-Card](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-Card](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-Card](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-Card](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Card](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-Card](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-Card](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-Card](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-Card](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-Card](/docs/styles-and-themes/common-units/#boxShadow) | none | none |
| [gap-avatar-Card](/docs/styles-and-themes/common-units/#size) | $gap-normal | $gap-normal |
| [gap-Card](/docs/styles-and-themes/common-units/#size) | var(--stack-gap-default) | var(--stack-gap-default) |
| [gap-title-Card](/docs/styles-and-themes/common-units/#size) | $gap-none | $gap-none |
| [horizontalAlignment-title-Card](/docs/styles-and-themes/common-units/#alignment) | *none* | *none* |
| [padding-Card](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingBottom-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Card](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [verticalAlignment-title-Card](/docs/styles-and-themes/common-units/#alignment) | center | center |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`backgroundColor-Card--hover`** | The background color of the Card when hovered. |
| **`gap-Card`** | The gap between the component's children. |
| **`gap-title-Card`** | The gap between the title and the subtitle |
| **`gap-avatar-Card`** | The gap between the avatar and the title panel |
| **`horizontalAlignment-title-Card`** | The horizontal alignment of panel with the title and subtitle |
| **`verticalAlignment-title-Card`** | The vertical alignment of the title and subtitle to the avatar |
