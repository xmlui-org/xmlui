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
| Publish/Subscribe | `subscribeToTopic` |
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

### `noIndicator` [#noindicator]

> [!DEF]  default: **false**

Indicates whether this link should have a distinct visual appearance.

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-Link | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Link | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Link | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Link | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Link | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Link | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Link | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Link | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-Link | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-Link | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Link | inherit | inherit |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-Link | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-Link | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-Link | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Link | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Link--active | $fontWeight-bold | $fontWeight-bold |
| [gap](/docs/styles-and-themes/common-units/#size)-icon-Link | $gap-tight | $gap-tight |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-Link | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-Link--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-Link--focus | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-Link--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-Link--focus | $outlineWidth--focus | $outlineWidth--focus |
| [padding](/docs/styles-and-themes/common-units/#size-values)-icon-Link | $space-0_5 | $space-0_5 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-icon-Link | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-icon-Link | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-icon-Link | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-icon-Link | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-icon-Link | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-icon-Link | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Link | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-Link | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-Link | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Link | $color-primary-500 | $color-primary-600 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Link--active | $color-primary-400 | $color-primary-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Link--hover | $color-primary-400 | $color-primary-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-Link--hover--active | $textColor-Link--active | $textColor-Link--active |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Link | textDecorationColor-Link | textDecorationColor-Link |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Link--active | textColor-Link--active | textColor-Link--active |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-Link--hover | textColor-Link--hover | textColor-Link--hover |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-Link | underline | underline |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-Link | solid | solid |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-Link | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-Link | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-Link | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-Link | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-Link | $space-1 | $space-1 |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-Link | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-Link | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-Link | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-Link | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`gap-icon-Link`** | This property defines the size of the gap between the icon and the label. |
