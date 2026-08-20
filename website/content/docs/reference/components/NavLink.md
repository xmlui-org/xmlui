# NavLink [#navlink]

`NavLink` creates interactive navigation items that connect users to different destinations within an app or external URLs. It automatically indicates active states, supports custom icons and labels, and can execute custom actions instead of navigation when needed.

**Key features:**
- **Custom actions**: Execute JavaScript code instead of navigation when using onClick handlers
- **Visual customization**: Support for icons, labels, and completely custom nested content
- **Accessibility support**: Proper focus management and keyboard navigation

## Using NavLink [#using-navlink]

### `NavLink` Appearance [#navlink-appearance]

You can use the `label` and `icon` properties of a `NavLink` to set its text and icon to display.
If you want a custom appearance, you can nest define custom visuals for the `NavLink` by nesting:

```xmlui-pg copy {6-14} display name="Example: NavLink appearance" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink to="/">
       <Stack width="16px" height="16px" backgroundColor="purple" />
       Home
    </NavLink>
    <NavLink to="/about">
       <Stack width="16px" height="16px" backgroundColor="green" />
       About
    </NavLink>
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/about">About</Page>
  </Pages>
</App>
```

### Actions [#actions]

By default, activating (clicking) a link navigates to the target URL.
However, you can create a link that executes an explicit action responding to the `click` event instead of the default navigation:

```xmlui-pg copy {7} display name="Example: custom NavLink action" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink to="/" label="Home" />
    <NavLink label="Danger!" onClick="toast('Be careful with this action!')" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
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

This property indicates if the particular navigation is an active link. An active link has a particular visual appearance, provided its [`displayActive`](#displayactive) property is set to `true`.

### `displayActive` [#displayactive]

> [!DEF]  default: **true**

This Boolean property indicates if the active state of a link should have a visual indication. Setting it to `false` removes the visual indication of an active link.

```xmlui-pg copy display name="Example: displayActive" height="250px"
<App layout="horizontal">
  <NavPanel>
    <NavLink to="/" label="Home" displayActive="false" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

In the following app, the "Hotels" link is disabled:

```xmlui-pg copy {8} display name="Example: enabled" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyTravel App</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Flights" to="/flights" />
    <NavLink label="Hotels" to="/hotels" enabled="false" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/flights">Flights Page</Page>
    <Page url="/hotels">Hotels Page</Page>
  </Pages>
</App>
```

### `exact` [#exact]

When set to true, the link is only considered active when the current URL matches the `to` value exactly. When false or omitted, the link also counts as active for nested paths that start with the same prefix (e.g. a link with to="/a" is active on "/a/b").

### `icon` [#icon]

This property allows you to add an optional icon (specify the icon's name) to the navigation link.

```xmlui-pg copy {6-7} display name="Example: icon" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" icon="home" />
    <NavLink label="Drives" to="/drives" icon="drive" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/drives">Drives Page</Page>
  </Pages>
</App>
```

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

```xmlui-pg copy display name="Example: label" height="250px"
<App layout="horizontal">
  <NavPanel>
    <NavLink to="/" label="Home" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

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

The following example opens the "About XMLUI" link in a new tab:

```xmlui-pg copy {7} display name="Example: target" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="About XMLUI" to="https://docs.xmlui.org/" target="_blank" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/drives">Drives Page</Page>
  </Pages>
</App>
```

### `to` [#to]

This property defines the URL of the link.

### `vertical` [#vertical]

This property sets how the active status is displayed on the `NavLink` component. If set to true, the indicator is displayed on the side which lends itself to a vertically aligned navigation menu. By default, it displays a horizontal indicator.

Usually, you do not need to use this property.
However, if you create a custom navigation menu component that runs vertically,
you need to manually set this property for the active state to be displayed properly.

The default value for this property is `false`.

```xmlui-pg copy display name="Example: vertical" height="250px"
<App layout="horizontal">
  <NavPanel>
    <NavLink to="/" label="Home" vertical="true" />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
  </Pages>
</App>
```

## Events [#events]

### `click` [#click]

This event is triggered when the NavLink is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

The following example shows a message and navigates to the "/status" link after closing the message window:

```xmlui-pg copy {7} display name="Example: click" height="250px"
<App layout="horizontal">
  <AppHeader>
    <H1>MyApp</H1>
  </AppHeader>
  <NavPanel>
    <NavLink to="/" label="Home" />
    <NavLink label="Check my status" onClick="
        toast('You will be redirected');
        Actions.navigate('/status');
    " />
  </NavPanel>
  <Pages>
    <Page url="/">Home</Page>
    <Page url="/status">My Status</Page>
  </Pages>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`indicator`**: The active indicator within the NavLink component.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-NavLink](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-NavLink--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NavLink--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NavLink--hover--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NavLink--pressed](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-NavLink--pressed--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-NavLink](/docs/styles-and-themes/common-units/#border) | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom-NavLink](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-NavLink](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-NavLink](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-NavLink](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-NavLink](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-indicator-NavLink](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRadius-NavLink](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-NavLink](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-NavLink](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-NavLink](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-NavLink](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-NavLink](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-NavLink](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [color-icon-NavLink](/docs/styles-and-themes/common-units/#color) | $color-surface-500 | $color-surface-500 |
| [color-indicator-NavLink](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [color-indicator-NavLink--active](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [color-indicator-NavLink--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-600 | $color-primary-600 |
| [color-indicator-NavLink--pressed](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [fontFamily-NavLink](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily | $fontFamily |
| [fontSize-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontWeight-NavLink](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-normal | $fontWeight-normal |
| [fontWeight-NavLink--active](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-NavLink--pressed](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [gap-icon-NavLink](/docs/styles-and-themes/common-units/#size) | $space-3 | $space-3 |
| iconAlignment-NavLink | *none* | *none* |
| [lineHeight-NavLink](/docs/styles-and-themes/common-units/#size-values) | $lineHeight-relaxed | $lineHeight-relaxed |
| [outlineColor-NavLink--focus](/docs/styles-and-themes/common-units/#color) | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset-NavLink--focus](/docs/styles-and-themes/common-units/#size-values) | -1px | -1px |
| [outlineStyle-NavLink--focus](/docs/styles-and-themes/common-units/#border) | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth-NavLink--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineWidth--focus | $outlineWidth--focus |
| [padding-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-NavLink](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingLeft-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-level1-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-level2-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-level3-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-level4-NavLink](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-NavLink](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [textColor-NavLink](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [textColor-NavLink--active](/docs/styles-and-themes/common-units/#color) | $color-primary-500 | $color-primary-500 |
| [textColor-NavLink--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NavLink--hover--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NavLink--pressed](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-NavLink--pressed--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [thickness-indicator-NavLink](/docs/styles-and-themes/common-units/#size-values) | $space-0_5 | $space-0_5 |
| [wordWrap-NavLink](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`color-indicator-NavLink`** | Provides the following states: `--hover`, `--active`, `--pressed` |
| **`iconAlignment-NavLink`** | Sets the default vertical alignment of the icon when the label text wraps to multiple lines. Valid values: `baseline`, `start`, `center`, `end` |
| **`gap-icon-NavLink`** | Sets the gap between the icon and the text label. Only applied when an icon is present. |
