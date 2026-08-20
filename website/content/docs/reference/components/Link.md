# Link [#link]

`Link` creates clickable navigation elements for internal app routes or external URLs. You can use the `label` and `icon` properties for simple text links, or embed custom components like buttons, cards, or complex layouts for rich interactive link presentations.

## Using Link [#using-link]

### `Link` Appearance [#link-appearance]

You can use the `label` and `icon` properties of a `Link` to set its text and icon to display. If you want a custom appearance, you can nest your visual representation into `Link`:

```xmlui-pg copy {3-6} display name="Example: custom Link content"
<App>
  <Link to="https://docs.xmlui.org/" target="_blank">
    <HStack verticalAlignment="center">
      <Stack width="16px" height="16px" backgroundColor="purple" />
      XMLUI introduction
    </HStack>
  </Link>
</App>
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `active` [#active]

> [!DEF]  default: **false**

Indicates whether this link is active or not. If so, it will have a distinct visual appearance.

```xmlui-pg copy display name="Example: active" /active/
<App>
  <Link>I'm an inactive link (by default)</Link>
  <Link active="true">I'm an active link</Link>
  <Link active="false">I'm an inactive link (explicit setting)</Link>
</App>
```

### `breakMode` [#breakmode]

> [!DEF]  default: **"normal"**

This property controls how text breaks into multiple lines. `normal` uses standard word boundaries, `word` breaks long words to prevent overflow, `anywhere` breaks at any character, `keep` prevents word breaking, and `hyphenate` uses automatic hyphenation. When not specified, uses the default browser behavior.

Available values:

| Value | Description |
| --- | --- |
| `normal` | Uses standard word boundaries for breaking **(default)** |
| `word` | Breaks long words when necessary to prevent overflow |
| `anywhere` | Breaks at any character if needed to fit content |
| `keep` | Prevents breaking within words entirely |
| `hyphenate` | Uses automatic hyphenation when breaking words |

### `ellipses` [#ellipses]

> [!DEF]  default: **true**

This property indicates whether ellipses should be displayed when the text is cropped (`true`) or not (`false`).

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy display name="Example: enabled" /enabled/
<App>
  <Link>I'm an enabled link (by default)</Link>
  <Link enabled="false">I'm a disabled link</Link>
  <Link enabled="true">I'm an enabled link (explicit setting)</Link>
</App>
```

### `horizontalAlignment` [#horizontalalignment]

> [!DEF]  default: **"start"**

Manages the horizontal content alignment for child elements in the Link.

Available values: `start` **(default)**, `center`, `end`

### `icon` [#icon]

This property allows you to add an optional icon (specify the icon's name) to the link.

```xmlui-pg copy display name="Example: icon"
<App>
  <Link icon="home" label="Home" />
  <Link icon="drive">Drives</Link>
</App>
```

>[!INFO]
> If you want to specify paddings and gaps or put the icon to the right of the link text, use your custom link template (nest it into `Link`).

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `maxLines` [#maxlines]

This property determines the maximum number of lines the component can wrap to. If there is no space to display all the contents, the component displays up to as many lines as specified in this property. When the value is not defined, there is no limit on the displayed lines.

### `noIndicator` [#noindicator]

> [!DEF]  default: **false**

Indicates whether this link should have a distinct visual appearance.

### `overflowMode` [#overflowmode]

> [!DEF]  default: **"not specified"**

This property controls how text overflow is handled. `none` prevents wrapping and shows no overflow indicator, `ellipsis` shows ellipses when text is truncated, `scroll` forces single line with horizontal scrolling, and `flow` allows multi-line wrapping with vertical scrolling when needed (ignores maxLines). When not specified, uses the default text behavior.

Available values:

| Value | Description |
| --- | --- |
| `none` | No wrapping, text stays on a single line with no overflow indicator (ignores maxLines) |
| `ellipsis` | Truncates with an ellipsis (default) |
| `scroll` | Forces single line with horizontal scrolling when content overflows (ignores maxLines) |
| `flow` | Allows text to wrap into multiple lines with vertical scrolling when container height is constrained (ignores maxLines) |

### `preserveLinebreaks` [#preservelinebreaks]

> [!DEF]  default: **false**

This property indicates if linebreaks should be preserved when displaying text.

### `target` [#target]

This property specifies where to open the link represented by the `Link`. This property accepts the following values (in accordance with the HTML standard):

Available values:

| Value | Description |
| --- | --- |
| `_self` | The link will open in the same frame as it was clicked. |
| `_blank` | The link will open in a new window or tab. |
| `_parent` | The link will open in the parent frame. If no parent, behaves as _self. |
| `_top` | The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self. |
| `_unfencedTop` | Allows embedded fenced frames to navigate the top-level frame, i.e. traversing beyond the root of the fenced frame. |

The following sample opens its link in a new tab:

```xmlui-pg copy display name="Example: target"
<App>
  <Link to="https://docs.xmlui.org/" target="_blank">
    Open XMLUI overview in a new tab
  </Link>
</App>
```

### `to` [#to]

This property defines the URL of the link. If the value is not defined, the link cannot be activated.

### `verticalAlignment` [#verticalalignment]

> [!DEF]  default: **"start"**

Manages the vertical content alignment for child elements in the Link.

Available values: `start` **(default)**, `center`, `end`

## Events [#events]

### `click` [#click]

This event is triggered when the link is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event that triggered the click.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`icon`**: The icon within the Link component.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-Link](/docs/styles-and-themes/common-units/#border) | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom-Link](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-Link](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Link](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-Link](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-Link](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRight-Link](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-Link](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Link](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-Link](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-Link](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-Link](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-Link](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [direction-Link](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-Link](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-Link](/docs/styles-and-themes/common-units/#size-values) | inherit | inherit |
| [fontStretch-Link](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-Link](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontVariant-Link](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-Link](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-Link--active](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [gap-icon-Link](/docs/styles-and-themes/common-units/#size) | $gap-tight | $gap-tight |
| [letterSpacing-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-Link](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [outlineColor-Link--focus](/docs/styles-and-themes/common-units/#color) | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset-Link--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle-Link--focus](/docs/styles-and-themes/common-units/#border) | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth-Link--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineWidth--focus | $outlineWidth--focus |
| [padding-icon-Link](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [padding-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-icon-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-icon-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-icon-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-icon-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-icon-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-icon-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-Link](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textAlign-Link](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-Link](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-Link](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-600 |
| [textColor-Link--active](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-500 |
| [textColor-Link--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-400 | $color-primary-500 |
| [textColor-Link--hover--active](/docs/styles-and-themes/common-units/#color) | $textColor-Link--active | $textColor-Link--active |
| [textDecorationColor-Link](/docs/styles-and-themes/common-units/#color) | $textColor-Link | $textColor-Link |
| [textDecorationColor-Link--active](/docs/styles-and-themes/common-units/#color) | $textColor-Link--active | $textColor-Link--active |
| [textDecorationColor-Link--hover](/docs/styles-and-themes/common-units/#color) | $textColor-Link--hover | $textColor-Link--hover |
| [textDecorationLine-Link](/docs/styles-and-themes/common-units/#textDecoration) | underline | underline |
| [textDecorationStyle-Link](/docs/styles-and-themes/common-units/#textDecoration) | solid | solid |
| [textDecorationThickness-Link](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-Link](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-Link](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-Link](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textUnderlineOffset-Link](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [wordBreak-Link](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-Link](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-Link](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-Link](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`gap-icon-Link`** | This property defines the size of the gap between the icon and the label. |
