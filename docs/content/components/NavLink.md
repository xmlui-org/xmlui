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

## Properties [#properties]

### `active` (default: false) [#active-default-false]

This property indicates if the particular navigation is an active link. An active link has a particular visual appearance, provided its [`displayActive`](#displayactive) property is set to `true`.

### `displayActive` (default: true) [#displayactive-default-true]

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

### `enabled` (default: true) [#enabled-default-true]

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
    <NavLink label="About XMLUI" to="https://docs.xmlui.com/" target="_blank" />
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

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavLink | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavLink--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavLink--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavLink--hover--active | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavLink--pressed | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-NavLink--pressed--active | *none* | *none* |
| [border](../styles-and-themes/common-units/#border)-NavLink | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom](../styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-indicator-NavLink | $borderRadius | $borderRadius |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-NavLink | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-NavLink | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-NavLink | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-NavLink | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-NavLink | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-icon-NavLink | $color-surface-500 | $color-surface-500 |
| [color](../styles-and-themes/common-units/#color)-indicator-NavLink | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-indicator-NavLink--active | $color-primary-500 | $color-primary-500 |
| [color](../styles-and-themes/common-units/#color)-indicator-NavLink--hover | $color-primary-600 | $color-primary-600 |
| [color](../styles-and-themes/common-units/#color)-indicator-NavLink--pressed | $color-primary-500 | $color-primary-500 |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-NavLink | $fontFamily | $fontFamily |
| [fontSize](../styles-and-themes/common-units/#size)-NavLink | $fontSize-small | $fontSize-small |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-NavLink | $fontWeight-normal | $fontWeight-normal |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-NavLink--active | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-NavLink--pressed | $fontWeight-normal | $fontWeight-normal |
| [outlineColor](../styles-and-themes/common-units/#color)-NavLink--focus | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset](../styles-and-themes/common-units/#size)-NavLink--focus | -1px | -1px |
| [outlineStyle](../styles-and-themes/common-units/#border)-NavLink--focus | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth](../styles-and-themes/common-units/#size)-NavLink--focus | $outlineWidth--focus | $outlineWidth--focus |
| [padding](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-NavLink | $space-4 | $space-4 |
| [paddingLeft](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-NavLink | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-NavLink | $space-2 | $space-2 |
| [textColor](../styles-and-themes/common-units/#color)-NavLink | $textColor-primary | $textColor-primary |
| [textColor](../styles-and-themes/common-units/#color)-NavLink--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NavLink--hover | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NavLink--hover--active | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NavLink--pressed | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-NavLink--pressed--active | *none* | *none* |
| [thickness](../styles-and-themes/common-units/#size)-indicator-NavLink | $space-0_5 | $space-0_5 |
| [wordWrap](../styles-and-themes/common-units/#word-wrap)-NavLink | *none* | *none* |

### Variable Explanations [#variable-explanations]

| Theme Variable | Description |
| --- | --- |
| **`color-indicator-NavLink`** | Provides the following states: `--hover`, `--active`, `--pressed` |
