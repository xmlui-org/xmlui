# Link [#link]

A `Link` component represents a navigation target within the app or a reference to an external web URL.

## Using Link [#using-link]

### `Link` Appearance [#link-appearance]

You can use the `label` and `icon` properties of a `Link` to set its text and icon to display. If you want a custom appearance, you can nest your visual representation into `Link`:

```xmlui-pg copy {1,6} display name="Example: custom Link content"
<App>
  <Link to="https://docs.xmlui.com/" target="_blank">
    <HStack verticalAlignment="center">
      <Stack width="16px" height="16px" backgroundColor="purple" />
      XMLUI introduction
    </HStack>
  </Link>
</App>
```

## Properties [#properties]

### `active (default: false)` [#active-default-false]

Indicates whether this link is active or not. If so, it will have a distinct visual appearance.

```xmlui-pg copy display name="Example: active"
<App>
  <Link>I'm an inactive link (by default)</Link>
  <Link active="true">I'm an active link</Link>
  <Link active="false">I'm an inactive link (explicit setting)</Link>
</App>
```

### `enabled (default: true)` [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled"
<App>
  <Link>I'm an enabled link (by default)</Link>
  <Link enabled="false">I'm a disabled link</Link>
  <Link enabled="true">I'm an enabled link (explicit setting)</Link>
</App>
```

### `icon` [#icon]

This property allows you to add an icon (specify the icon's name) to the link.

```xmlui-pg copy display name="Example: icon"
<App>
  <Link icon="home" label="Home" />
  <Link icon="drive">Drives</Link>
</App>
```

>[!INFO]
> If you want to specify paddings and gaps or put the icon to the right of the link text, use your custom link template (nest it into `Link`).

### `label` [#label]

This property sets the label of the component.

### `target (default: "_self")` [#target-default-self]

This property specifies where to open the link represented by the `Link`. This property accepts the following values (in accordance with the HTML standard):

Available values:

| Value | Description |
| --- | --- |
| `_self` | The link will open in the same frame as it was clicked. **(default)** |
| `_blank` | The link will open in a new window or tab. |
| `_parent` | The link will open in the parent frame. If no parent, behaves as _self. |
| `_top` | The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self. |
| `_unfencedTop` | Allows embedded fenced frames to navigate the top-level frame, i.e. traversing beyond the root of the fenced frame. |

The following sample opens its link in a new tab:

```xmlui-pg copy display name="Example: target"
<App>
  <Link to="https://docs.xmlui.com/" target="_blank">
    Open XMLUI overview in a new tab
  </Link>
</App>
```

### `to` [#to]

This property defines the URL of the link.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-Link | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](../styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)EndEndRadius-Link | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)EndStartRadius-Link | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)StartEndRadius-Link | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)StartStartRadius-Link | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| direction-Link | *none* | *none* |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-Link | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Link | inherit | inherit |
| [fontStretch](../styles-and-themes/common-units/#fontStretch)-Link | *none* | *none* |
| [fontStyle](../styles-and-themes/common-units/#fontStyle)-Link | *none* | *none* |
| fontVariant-Link | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Link | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-Link--active | $fontWeight-bold | $fontWeight-bold |
| [gap](../styles-and-themes/common-units/#size)-icon-Link | $gap-tight | $gap-tight |
| [letterSpacing](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| lineBreak-Link | *none* | *none* |
| [lineHeight](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [outlineColor](../styles-and-themes/common-units/#color)-Link--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](../styles-and-themes/common-units/#size)-Link--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle](../styles-and-themes/common-units/#border)-Link--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](../styles-and-themes/common-units/#size)-Link--focus | $outlineWidth--focus | $outlineWidth--focus |
| [padding](../styles-and-themes/common-units/#size)-icon-Link | $space-0_5 | $space-0_5 |
| [padding](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-icon-Link | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-icon-Link | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-icon-Link | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-icon-Link | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-icon-Link | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-icon-Link | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Link | *none* | *none* |
| textAlign-Link | *none* | *none* |
| textAlignLast-Link | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Link | $color-primary-500 | $color-primary-500 |
| [textColor](../styles-and-themes/common-units/#color)-Link--active | $color-primary-400 | $color-primary-400 |
| [textColor](../styles-and-themes/common-units/#color)-Link--hover | $color-primary-400 | $color-primary-400 |
| [textColor](../styles-and-themes/common-units/#color)-Link--hover--active | $textColor-Link--active | $textColor-Link--active |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Link | $color-primary-500 | $color-primary-500 |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Link--active | $color-primary-400 | $color-primary-400 |
| [textDecorationColor](../styles-and-themes/common-units/#color)-Link--hover | $color-primary-400 | $color-primary-400 |
| [textDecorationLine](../styles-and-themes/common-units/#textDecoration)-Link | underline | underline |
| [textDecorationStyle](../styles-and-themes/common-units/#textDecoration)-Link | solid | solid |
| [textDecorationThickness](../styles-and-themes/common-units/#textDecoration)-Link | *none* | *none* |
| textIndent-Link | *none* | *none* |
| textShadow-Link | *none* | *none* |
| [textTransform](../styles-and-themes/common-units/#textTransform)-Link | *none* | *none* |
| [textUnderlineOffset](../styles-and-themes/common-units/#size)-Link | $space-1 | $space-1 |
| wordBreak-Link | *none* | *none* |
| wordSpacing-Link | *none* | *none* |
| wordWrap-Link | *none* | *none* |
| writingMode-Link | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`gap-icon-Link`** | This property defines the size of the gap between the icon and the label. |
