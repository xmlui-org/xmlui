# NavLink [#navlink]

`NavLink` creates interactive navigation items that connect users to different destinations within an app or external URLs. It automatically indicates active states, supports custom icons and labels, and can execute custom actions instead of navigation when needed.

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

This property indicates if the particular navigation is an active link. An active link has a particular visual appearance, provided its [`displayActive`](#displayactive) property is set to `true`.

### `displayActive` [#displayactive]

> [!DEF]  default: **true**

This Boolean property indicates if the active state of a link should have a visual indication. Setting it to `false` removes the visual indication of an active link.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `exact` [#exact]

When set to true, the link is only considered active when the current URL matches the `to` value exactly. When false or omitted, the link also counts as active for nested paths that start with the same prefix (e.g. a link with to="/a" is active on "/a/b").

### `icon` [#icon]

This property allows you to add an optional icon (specify the icon's name) to the navigation link.

### `iconAlignment` [#iconalignment]

> [!DEF]  default: **"center"**

This property controls the vertical alignment of the icon when the label text wraps to multiple lines. Set to `baseline` to align with the first line of text, `start` to align to the top, `center` for middle alignment (default), or `end` for bottom alignment.

Available values:

| Value | Description |
| --- | --- |
| `baseline` | Align icon with the first line of text |
| `start` | Align icon to the top |
| `center` | Align icon to the center (default) **(default)** |
| `end` | Align icon to the bottom |

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `level` [#level]

This property specifies the nesting level (1-4) for the navigation link, which affects its padding. Higher levels typically have more left padding to indicate hierarchy. When used inside a NavGroup, the level is automatically inherited from the group context.

Available values: `1`, `2`, `3`, `4`

### `noIndicator` [#noindicator]

> [!DEF]  default: **false**

This Boolean property controls whether to hide the visual indicator for active and hovered states. When set to `true`, the indicator line will not be displayed.

### `target` [#target]

This optionally property specifies how to open the clicked link.

Available values:

| Value | Description |
| --- | --- |
| `_self` | The link will open in the same frame as it was clicked. |
| `_blank` | The link will open in a new window or tab. |
| `_parent` | The link will open in the parent frame. If no parent, behaves as _self. |
| `_top` | The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self. |
| `_unfencedTop` | Allows embedded fenced frames to navigate the top-level frame, i.e. traversing beyond the root of the fenced frame. |

### `to` [#to]

This property defines the URL of the link.

### `vertical` [#vertical]

This property sets how the active status is displayed on the `NavLink` component. If set to true, the indicator is displayed on the side which lends itself to a vertically aligned navigation menu. By default, it displays a horizontal indicator.

## Events [#events]

### `click` [#click]

This event is triggered when the NavLink is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`indicator`**: The active indicator within the NavLink component.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NavLink | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NavLink--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NavLink--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NavLink--hover--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NavLink--pressed | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-NavLink--pressed--active | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-NavLink | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-indicator-NavLink | $borderRadius | $borderRadius |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-NavLink | $borderRadius | $borderRadius |
| [borderRight](/docs/styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-icon-NavLink | $color-surface-500 | $color-surface-500 |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-NavLink | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-NavLink--active | $color-primary-500 | $color-primary-500 |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-NavLink--hover | $color-primary-600 | $color-primary-600 |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-NavLink--pressed | $color-primary-500 | $color-primary-500 |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-NavLink | $fontFamily | $fontFamily |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-NavLink | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-NavLink--active | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-NavLink--pressed | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-icon-NavLink | $space-3 | $space-3 |
| iconAlignment-NavLink | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-NavLink | $lineHeight-relaxed | $lineHeight-relaxed |
| [outlineColor](/docs/styles-and-themes/common-units/#color)-NavLink--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](/docs/styles-and-themes/common-units/#size-values)-NavLink--focus | -1px | -1px |
| [outlineStyle](/docs/styles-and-themes/common-units/#border)-NavLink--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](/docs/styles-and-themes/common-units/#size-values)-NavLink--focus | $outlineWidth--focus | $outlineWidth--focus |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-NavLink | $space-4 | $space-4 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-NavLink | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level1-NavLink | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level2-NavLink | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level3-NavLink | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level4-NavLink | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-NavLink | $space-2 | $space-2 |
| [textColor](/docs/styles-and-themes/common-units/#color)-NavLink | $textColor-primary | $textColor-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-NavLink--active | $color-primary-500 | $color-primary-500 |
| [textColor](/docs/styles-and-themes/common-units/#color)-NavLink--hover | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NavLink--hover--active | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NavLink--pressed | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-NavLink--pressed--active | *none* | *none* |
| [thickness](/docs/styles-and-themes/common-units/#size-values)-indicator-NavLink | $space-0_5 | $space-0_5 |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-NavLink | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`color-indicator-NavLink`** | Provides the following states: `--hover`, `--active`, `--pressed` |
| **`iconAlignment-NavLink`** | Sets the default vertical alignment of the icon when the label text wraps to multiple lines. Valid values: `baseline`, `start`, `center`, `end` |
| **`gap-icon-NavLink`** | Sets the gap between the icon and the text label. Only applied when an icon is present. |
