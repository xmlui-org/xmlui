# Theme [#theme]

`Theme` creates styling contexts to customize the appearance of nested components without using CSS.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `applyIf` [#applyif]

> [!DEF]  default: **"auto"**

This property controls whether the theme wrapper is applied. When true, the theme wraps the children. When false, children are rendered unwrapped. If not explicitly set, defaults to true only when the Theme has meaningful properties (themeId, tone, themeVars, or disableInlineStyle); otherwise defaults to false to avoid unnecessary wrapper elements.

### `disableInlineStyle` [#disableinlinestyle]

This property controls whether inline styles are disabled for components within this theme. When undefined, uses the appGlobals.disableInlineStyle setting.

### `root` [#root]

> [!DEF]  default: **false**

This property indicates whether the component is at the root of the application.

### `themeId` [#themeid]

This property specifies which theme to use by setting the theme's id.

### `tone` [#tone]

> [!DEF]  default: **"light"**

This property allows the setting of the current theme's tone.

Available values: `light` **(default)**, `dark`

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
