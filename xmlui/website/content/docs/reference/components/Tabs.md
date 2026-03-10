# Tabs [#tabs]

`Tabs` enables users to switch among content panels using clickable tab headers. It provides an efficient way to present multiple related sections in a single interface area, with each tab containing distinct content defined by [TabItem](/components/TabItem) components.

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

### `accordionView` [#accordionview]

> [!DEF]  default: **false**

When enabled, displays tabs in an accordion-like view where tab headers are stacked vertically and only the active tab's content is visible. Each tab header remains visible and clicking a header opens its content while closing others. When enabled, the orientation property is ignored.

### `activeTab` [#activetab]

This property indicates the index of the active tab. The indexing starts from 0, representing the starting (leftmost) tab. If not set, the first tab is selected by default.

### `headerTemplate` [#headertemplate]

This property declares the template for the clickable tab area.

### `orientation` [#orientation]

> [!DEF]  default: **"horizontal"**

This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top. Note: This property is ignored when accordionView is set to true.

Available values: `horizontal` **(default)**, `vertical`

### `tabAlignment` [#tabalignment]

> [!DEF]  default: **"start"**

This property controls how tabs are aligned within the tab header container in horizontal orientation. Use 'start' to align tabs to the left, 'end' to align to the right, 'center' to center the tabs, and 'stretch' to make tabs fill the full width of the header. Note: This property is ignored when orientation is set to 'vertical' or when accordionView is enabled.

Available values: `start` **(default)**, `end`, `center`, `stretch`

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Tabs is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `didChange` [#didchange]

This event is triggered when value of Tabs has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

## Exposed Methods [#exposed-methods]

### `next` [#next]

This method selects the next tab. If the current tab is the last one, it wraps around to the first tab.

**Signature**: `next(): void`

### `prev` [#prev]

This method selects the previous tab. If the current tab is the first one, it wraps around to the last tab.

**Signature**: `prev(): void`

### `setActiveTabById` [#setactivetabbyid]

This method sets the active tab by its ID.

**Signature**: `setActiveTabById(id: string): void`

### `setActiveTabIndex` [#setactivetabindex]

This method sets the active tab by index (0-based).

**Signature**: `setActiveTabIndex(index: number): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-list-Tabs | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Tabs | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-trigger-Tabs | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-trigger-Tabs--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-trigger-Tabs--hover | $color-surface-100 | $color-surface-100 |
| [border](/docs/styles-and-themes/common-units/#border)-list-Tabs | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-trigger-Tabs | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-active-Tabs | $color-primary | $color-primary |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Tabs | $borderColor | $borderColor |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-list-Tabs | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-trigger-Tabs | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Tabs | solid | solid |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Tabs | 2px | 2px |
| [gap](/docs/styles-and-themes/common-units/#size)-list-Tabs | 0px | 0px |
| [padding](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | $space-4 | $space-4 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-trigger-Tabs | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-trigger-Tabs | $color-primary-600 | $color-primary-600 |
| [textColor](/docs/styles-and-themes/common-units/#color)-trigger-Tabs--active | $color-primary-900 | $color-primary-900 |
| [textColor](/docs/styles-and-themes/common-units/#color)-trigger-Tabs--hover | $color-primary-900 | $color-primary-900 |
