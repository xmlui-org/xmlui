# Drawer [#drawer]

`Drawer` is a panel that slides in from one of the four edges of the viewport. It can be opened and closed programmatically using its API methods `open()` and `close()`. An optional backdrop dims the content behind the drawer.

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

### `closeButtonVisible` [#closebuttonvisible]

> [!DEF]  default: **true**

When `true`, an ✕ button is displayed in the top-right corner of the drawer that closes it when clicked.

### `closeOnClickAway` [#closeonclickaway]

> [!DEF]  default: **true**

When `true`, clicking outside the drawer panel closes it.

### `hasBackdrop` [#hasbackdrop]

> [!DEF]  default: **true**

When `true`, a translucent overlay is shown behind the drawer while it is open.

### `headerTemplate` [#headertemplate]

A custom template rendered in the sticky header area, next to the close button.

### `initiallyOpen` [#initiallyopen]

> [!DEF]  default: **false**

When `true`, the drawer is open on its first render.

### `position` [#position]

> [!DEF]  default: **"left"**

Specifies the edge from which the drawer slides in.

Available values: `left` **(default)**, `right`, `top`, `bottom`

## Events [#events]

### `close` [#close]

Fired when the `Drawer` is closed.

### `open` [#open]

Fired when the `Drawer` is opened.

## Exposed Methods [#exposed-methods]

### `close` [#close]

Closes the `Drawer`. Invoke with `drawerId.close()`.

**Signature**: `close(): void`

### `isOpen` [#isopen]

Returns `true` when the `Drawer` is currently open, `false` otherwise.

**Signature**: `isOpen(): boolean`

### `open` [#open]

Opens the `Drawer`. Invoke with `drawerId.open()`.

**Signature**: `open(): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [animationDuration](/docs/styles-and-themes/layout-props/#animationDuration)-Drawer | 250ms | 250ms |
| [animation](/docs/styles-and-themes/layout-props/#animation)Easing-Drawer | cubic-bezier(0.4, 0, 0.2, 1) | cubic-bezier(0.4, 0, 0.2, 1) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-backdrop-Drawer | rgba(0, 0, 0, 0.4) | rgba(0, 0, 0, 0.4) |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Drawer | $backgroundColor-primary | $backgroundColor-primary |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Drawer | $borderRadius | $borderRadius |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Drawer | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) | 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) |
| [gap](/docs/styles-and-themes/common-units/#size)-Drawer | $space-4 | $space-4 |
| [height](/docs/styles-and-themes/common-units/#size-values)-Drawer | 320px | 320px |
| [maxHeight](/docs/styles-and-themes/common-units/#size-values)-Drawer | 50% | 50% |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-Drawer | 80% | 80% |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingTop-Drawer $paddingRight-Drawer $paddingBottom-Drawer $paddingLeft-Drawer | $paddingTop-Drawer $paddingRight-Drawer $paddingBottom-Drawer $paddingLeft-Drawer |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingVertical-Drawer | $paddingVertical-Drawer |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Drawer | $space-4 | $space-4 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingHorizontal-Drawer | $paddingHorizontal-Drawer |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingHorizontal-Drawer | $paddingHorizontal-Drawer |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Drawer | $paddingVertical-Drawer | $paddingVertical-Drawer |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Drawer | $space-4 | $space-4 |
| right-closeButton-Drawer | $space-3 | $space-3 |
| top-closeButton-Drawer | $space-2 | $space-2 |
| [width](/docs/styles-and-themes/common-units/#size-values)-Drawer | 320px | 320px |
| zIndex-Drawer | 200 | 200 |
