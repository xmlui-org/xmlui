# ScrollViewer [#scrollviewer]

`ScrollViewer` is a simple layout container that stretches to fill its parent's viewport and provides customizable scrollbar styles for scrollable content. It supports four scrollbar modes: normal (standard browser scrollbars), overlay (themed scrollbars always visible), whenMouseOver (scrollbars appear on hover), and whenScrolling (scrollbars appear during scrolling).

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

### `footerTemplate` [#footertemplate]

An optional template that defines content always visible at the bottom of the `ScrollViewer`, outside the scrollable area. The footer sticks to the bottom while the inner content scrolls.

### `headerTemplate` [#headertemplate]

An optional template that defines content always visible at the top of the `ScrollViewer`, outside the scrollable area. The header sticks to the top while the inner content scrolls.

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style and behavior. `normal` uses the standard browser scrollbar. `overlay` uses themed scrollbars that are always visible and can be customized via theme variables. `whenMouseOver` shows overlay scrollbars that appear when the mouse hovers over the scroll area and hide after 200ms when the mouse leaves. `whenScrolling` shows overlay scrollbars only during active scrolling and hides them after 400ms of inactivity.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **true**

When enabled, displays gradient fade indicators at the top and bottom of the scroll container to visually indicate that more content is available in those directions. The fade indicators automatically appear/disappear based on the current scroll position. Top fade shows when scrolled down from the top, bottom fade shows when not at the bottom. Only works with overlay scrollbar modes (not with `normal` mode).

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| autoHideDelay-whenMouseOver-Scroller | 400 | 400 |
| autoHideDelay-whenScrolling-Scroller | 400 | 400 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-fade-Scroller | rgb(from $color-surface-0 r g b / 0.75) | rgb(from $color-surface-0 r g b / 0.75) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-handle-Scroller | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-handle-Scroller--active | $color-surface-400 | $color-surface-400 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-handle-Scroller--hover | $color-surface-400 | $color-surface-400 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-track-Scroller | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-track-Scroller--active | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-track-Scroller--hover | transparent | transparent |
| [border](/docs/styles-and-themes/common-units/#border)-handle-Scroller | none | none |
| [border](/docs/styles-and-themes/common-units/#border)-handle-Scroller--active | none | none |
| [border](/docs/styles-and-themes/common-units/#border)-handle-Scroller--hover | none | none |
| [border](/docs/styles-and-themes/common-units/#border)-track-Scroller | none | none |
| [border](/docs/styles-and-themes/common-units/#border)-track-Scroller--active | none | none |
| [border](/docs/styles-and-themes/common-units/#border)-track-Scroller--hover | none | none |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-handle-Scroller | 10px | 10px |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-track-Scroller | 2px | 2px |
| [height](/docs/styles-and-themes/common-units/#size-values)-fade-Scroller | 64px | 64px |
| maxSize-handle-Scroller | none | none |
| minSize-handle-Scroller | 33px | 33px |
| [offset](/docs/styles-and-themes/common-units/#size-values)-handleInteractiveArea-Scroller | 4px | 4px |
| [padding](/docs/styles-and-themes/common-units/#size-values)-axis-Scroller | 2px | 2px |
| [padding](/docs/styles-and-themes/common-units/#size-values)-perpendicular-Scroller | 2px | 2px |
| [size](/docs/styles-and-themes/common-units/#size-values)-perpendicularHandle-Scroller | 100% | 100% |
| [size](/docs/styles-and-themes/common-units/#size-values)-perpendicularHandle-Scroller--active | 100% | 100% |
| [size](/docs/styles-and-themes/common-units/#size-values)-perpendicularHandle-Scroller--hover | 100% | 100% |
| [size](/docs/styles-and-themes/common-units/#size-values)-Scroller | 10px | 10px |
| [transition](/docs/styles-and-themes/common-units/#transition)-fade-Scroller | opacity 0.3s ease-in-out | opacity 0.3s ease-in-out |
| [transition](/docs/styles-and-themes/common-units/#transition)-handle-Scroller | *none* | *none* |
| [transition](/docs/styles-and-themes/common-units/#transition)-Scroller | opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s | opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s |
| [transition](/docs/styles-and-themes/common-units/#transition)-track-Scroller | *none* | *none* |
| [transition](/docs/styles-and-themes/common-units/#transition)Handle-Scroller | opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s | opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s |
| [transition](/docs/styles-and-themes/common-units/#transition)Track-Scroller | opacity 0.15s, background-color 0.15s, border-color 0.15s | opacity 0.15s, background-color 0.15s, border-color 0.15s |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`size-Scroller`** | The width (for vertical scrollbars) or height (for horizontal scrollbars) of the scrollbar |
| **`padding-perpendicular-Scroller`** | The padding perpendicular to the scroll direction (e.g., top/bottom padding for vertical scrollbars) |
| **`padding-axis-Scroller`** | The padding along the scroll direction (e.g., left/right padding for vertical scrollbars) |
| **`borderRadius-track-Scroller`** | The border radius of the scrollbar track (the background area where the handle moves) |
| **`backgroundColor-track-Scroller`** | The background color of the scrollbar track in its default state |
| **`backgroundColor-track-Scroller--hover`** | The background color of the scrollbar track when hovered |
| **`backgroundColor-track-Scroller--active`** | The background color of the scrollbar track when active/pressed |
| **`border-track-Scroller`** | The border of the scrollbar track in its default state |
| **`border-track-Scroller--hover`** | The border of the scrollbar track when hovered |
| **`border-track-Scroller--active`** | The border of the scrollbar track when active/pressed |
| **`borderRadius-handle-Scroller`** | The border radius of the scrollbar handle (the draggable thumb) |
| **`backgroundColor-handle-Scroller`** | The background color of the scrollbar handle in its default state |
| **`backgroundColor-handle-Scroller--hover`** | The background color of the scrollbar handle when hovered |
| **`backgroundColor-handle-Scroller--active`** | The background color of the scrollbar handle when active/being dragged |
| **`border-handle-Scroller`** | The border of the scrollbar handle in its default state |
| **`border-handle-Scroller--hover`** | The border of the scrollbar handle when hovered |
| **`border-handle-Scroller--active`** | The border of the scrollbar handle when active/being dragged |
| **`minSize-handle-Scroller`** | The minimum size (width/height) of the scrollbar handle |
| **`maxSize-handle-Scroller`** | The maximum size (width/height) of the scrollbar handle, or 'none' for no limit |
| **`size-perpendicularHandle-Scroller`** | The size of the handle perpendicular to scroll direction (e.g., width of handle for vertical scrollbar) in default state |
| **`size-perpendicularHandle-Scroller--hover`** | The size of the handle perpendicular to scroll direction when hovered |
| **`size-perpendicularHandle-Scroller--active`** | The size of the handle perpendicular to scroll direction when active/being dragged |
| **`offset-handleInteractiveArea-Scroller`** | Additional offset for the interactive area around the handle to make it easier to grab |
| **`transition-Scroller`** | CSS transition for the scrollbar container (opacity, visibility, position changes) |
| **`transitionTrack-Scroller`** | CSS transition for the scrollbar track (opacity, background-color, border-color) |
| **`transitionHandle-Scroller`** | CSS transition for the scrollbar handle (opacity, background-color, border-color, size changes) |
| **`height-fade-Scroller`** | The height of the fade overlay gradients at the top and bottom of the scroll container |
| **`backgroundColor-fadeTop-Scroller`** | The background gradient for the top fade overlay (typically a gradient from opaque to transparent) |
| **`backgroundColor-fadeBottom-Scroller`** | The background gradient for the bottom fade overlay (typically a gradient from transparent to opaque) |
| **`transition-fade-Scroller`** | CSS transition for the fade overlays (opacity changes) |
| **`autoHideDelay-whenMouseOver-Scroller`** | Delay in milliseconds before hiding scrollbar after mouse leaves in whenMouseOver mode |
| **`autoHideDelay-whenScrolling-Scroller`** | Delay in milliseconds before hiding scrollbar after scrolling stops in whenScrolling mode |
