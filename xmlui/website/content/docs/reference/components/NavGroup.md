# NavGroup [#navgroup]

`NavGroup` creates collapsible containers for organizing related navigation items into hierarchical menu structures. It groups `NavLink` components and other `NavGroup` components, providing expandable submenus with customizable icons and states.

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

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `expandIconAlignment` [#expandiconalignment]

> [!DEF]  default: **"start"**

This property controls the horizontal alignment of the expand/collapse arrow icon. Set to `start` to display the arrow immediately after the label, or `end` to push it to the right edge of the NavGroup (only applies when the NavGroup has a defined width).

Available values:

| Value | Description |
| --- | --- |
| `start` | Display arrow immediately after the label (default) **(default)** |
| `end` | Push arrow to the right edge of the NavGroup |

### `icon` [#icon]

This property defines an optional icon to display along with the `NavGroup` label.

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

### `iconHorizontalCollapsed` [#iconhorizontalcollapsed]

> [!DEF]  default: **"chevronright"**

Set a custom icon to display when the navigation menu is collapsed, is in a **horizontal** app layout, and is in a navigation submenu.

### `iconHorizontalExpanded` [#iconhorizontalexpanded]

> [!DEF]  default: **"chevronright"**

Set a custom icon to display when the navigation menu is expanded, is in a **horizontal** app layout, and is in a navigation submenu.

### `iconVerticalCollapsed` [#iconverticalcollapsed]

> [!DEF]  default: **"chevronright"**

Set a custom icon to display when the navigation menu is collapsed, is in a **vertical** app layout, or is in a **horizontal** layout and is the top-level navigation item in the menu.

### `iconVerticalExpanded` [#iconverticalexpanded]

> [!DEF]  default: **"chevrondown"**

Set a custom icon to display when the navigation menu is expanded, is in a **vertical** app layout, or is in a **horizontal** layout and is the top-level navigation item in the menu.

### `initiallyExpanded` [#initiallyexpanded]

This property defines whether the group is initially expanded or collapsed. If not defined, the group is collapsed by default.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `noIndicator` [#noindicator]

> [!DEF]  default: **false**

This Boolean property controls whether to hide the visual indicator for active and hovered states. When set to `true`, the indicator line will not be displayed on the `NavGroup` toggle button.

### `to` [#to]

This property defines an optional navigation link.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-dropdown-NavGroup | $backgroundColor-primary | $backgroundColor-primary |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-dropdown-NavGroup | $borderRadius | $borderRadius |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-dropdown-NavGroup | $boxShadow-spread | $boxShadow-spread |
| expandIconAlignment-NavGroup | start | start |
| [margin](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-items-NavGroup | 0 | 0 |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [margin](/docs/styles-and-themes/common-units/#size-values)Horizontal-NavGroup | *none* | *none* |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-items-NavGroup | 0 | 0 |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [margin](/docs/styles-and-themes/common-units/#size-values)Vertical-NavGroup | *none* | *none* |
| [minWidth](/docs/styles-and-themes/common-units/#size-values)-dropdown-NavGroup | 11em | 11em |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-NavGroup | $space-4 | $space-4 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-NavGroup | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level1-NavGroup | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level2-NavGroup | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level3-NavGroup | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-level4-NavGroup | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-NavGroup | $space-2 | $space-2 |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`marginTop-items-NavGroup`** | Sets the margin between the NavGroup header and the first child item. Does not affect margins between child items. |
| **`marginBottom-items-NavGroup`** | Sets the margin after the last child item in the NavGroup. |
