# ScrollViewer [#scrollviewer]

`ScrollViewer` is a simple layout container that stretches to fill its parent's viewport and provides customizable scrollbar styles for scrollable content. It supports three scrollbar modes: normal (standard browser scrollbars), whenMouseOver (scrollbars appear on hover), and whenScrolling (scrollbars appear during scrolling).

## Properties [#properties]

### `scrollStyle` [#scrollstyle]

-  default: **"normal"**

This property determines the scrollbar style and behavior. `normal` uses the standard browser scrollbar. `whenMouseOver` shows overlay scrollbars that appear when the mouse hovers over the scroll area and hide after 200ms when the mouse leaves. `whenScrolling` shows overlay scrollbars only during active scrolling and hides them after 400ms of inactivity.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The `ScrollViewer` component uses shared theme variables with other layout containers that may act as scroll containers. Please note that these shared theme variables use the `Scroller` virtual component name, and not `ScrollViewer`.

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| handleBackground-Scroller | rgba(0, 0, 0, 0.3) | rgba(0, 0, 0, 0.3) |
| handleBackground-Scroller--active | rgba(0, 0, 0, 0.6) | rgba(0, 0, 0, 0.6) |
| handleBackground-Scroller--hover | rgba(0, 0, 0, 0.45) | rgba(0, 0, 0, 0.45) |
| handleBorder-Scroller | none | none |
| handleBorder-Scroller--active | none | none |
| handleBorder-Scroller--hover | none | none |
| handleBorderRadius-Scroller | 10px | 10px |
| handleInteractiveAreaOffset-Scroller | 4px | 4px |
| handleMaxSize-Scroller | none | none |
| handleMinSize-Scroller | 33px | 33px |
| handlePerpendicularSize-Scroller | 100% | 100% |
| handlePerpendicularSize-Scroller--active | 100% | 100% |
| handlePerpendicularSize-Scroller--hover | 100% | 100% |
| [padding](../styles-and-themes/common-units/#size)Axis-Scroller | 2px | 2px |
| [padding](../styles-and-themes/common-units/#size)Perpendicular-Scroller | 2px | 2px |
| [size](../styles-and-themes/common-units/#size)-Scroller | 10px | 10px |
| trackBackground-Scroller | transparent | transparent |
| trackBackground-Scroller--active | transparent | transparent |
| trackBackground-Scroller--hover | transparent | transparent |
| trackBorder-Scroller | none | none |
| trackBorder-Scroller--active | none | none |
| trackBorder-Scroller--hover | none | none |
| trackBorderRadius-Scroller | 10px | 10px |
| [transition](../styles-and-themes/common-units/#transition)-Scroller | opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s | opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s |
| [transition](../styles-and-themes/common-units/#transition)Handle-Scroller | opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s | opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s |
| [transition](../styles-and-themes/common-units/#transition)Track-Scroller | opacity 0.15s, background-color 0.15s, border-color 0.15s | opacity 0.15s, background-color 0.15s, border-color 0.15s |
