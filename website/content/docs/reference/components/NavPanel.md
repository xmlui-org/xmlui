# NavPanel [#navpanel]

`NavPanel` defines the navigation structure within an App, serving as a container for NavLink and NavGroup components that create your application's primary navigation menu. Its appearance and behavior automatically adapt based on the App's layout configuration.

**Key features:**

- **Layout adaptation**: Automatically positions navigation horizontally or vertically based on App layout
- **Navigation organization**: Contains NavLink and NavGroup components to build structured menus
- **Logo integration**: Supports custom logo templates in vertical layouts via logoTemplate property
- **Drawer mode**: Can optionally display navigation in a collapsible drawer interface
- **Theme integration**: Inherits styling from the app's theme system for consistent appearance

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `footerTemplate` [#footertemplate]

Optional template for a footer at the bottom of the NavPanel. When set, the footer is shown below the scrollable nav content (e.g. for theme switcher or sidebar toggle, similar to Nextra).

### `inDrawer` [#indrawer]

> [!DEF]  default: **false**

This property determines if the navigation panel is displayed in a drawer.

### `logoTemplate` [#logotemplate]

This property defines the logo template to display in the navigation panel with the `vertical` and `vertical-sticky` layout.

```xmlui-pg copy {3-8} display name="Example: logoTemplate" height={250}
<App layout="vertical">
  <NavPanel>
    <property name="logoTemplate">
       <H3>
         <Icon name="drive" />
         DriveDiag (Nav)
       </H3>
    </property>
    <NavLink label="Home" to="/" icon="home"/>
    <NavLink label="Page 1" to="/page1"/>
  </NavPanel>
  <Pages fallbackPath="/">
    <Page url="/">
      <Text value="Home" />
    </Page>
    <Page url="/page1">
      <Text value="Page 1" />
    </Page>
  </Pages>
</App>
```

### `scrollStyle` [#scrollstyle]

> [!DEF]  default: **"normal"**

This property determines the scrollbar style. Options: "normal" uses the browser's default scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar only while scrolling is active and fades out after 400ms of inactivity. On mobile/touch devices, this property is ignored and the browser's native scrollbar is always used.

Available values: `normal` **(default)**, `overlay`, `whenMouseOver`, `whenScrolling`

### `showScrollerFade` [#showscrollerfade]

> [!DEF]  default: **true**

When enabled, displays gradient fade indicators at the top and bottom edges of the navigation panel when scrollable content extends beyond the visible area. The fade effect provides a visual cue to users that additional content is available by scrolling. The indicators automatically appear and disappear based on the scroll position. This property only works with "overlay", "whenMouseOver", and "whenScrolling" scroll styles. On mobile/touch devices, this property has no effect.

### `syncScrollBehavior` [#syncscrollbehavior]

> [!DEF]  default: **"smooth"**

Controls the scroll animation when `syncWithContent` is enabled. Use `"smooth"` for an animated scroll or `"instant"` to jump immediately to the active item without animation.

Available values: `smooth` **(default)**, `instant`

### `syncScrollPosition` [#syncscrollposition]

> [!DEF]  default: **"center"**

Controls the vertical alignment of the active navigation item within the NavPanel when `syncWithContent` scrolls it into view. `"center"` places the item in the middle of the visible area; `"nearest"` scrolls the minimum amount needed; `"start"` aligns it to the top; `"end"` aligns it to the bottom.

Available values: `center` **(default)**, `nearest`, `start`, `end`

### `syncWithContent` [#syncwithcontent]

> [!DEF]  default: **false**

When enabled, any page navigation automatically scrolls the corresponding navigation item within the NavPanel into view, keeping the active link visible.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`content`**: The content area within the NavPanel component.
- **`footer`**: Optional footer area at the bottom of the NavPanel (e.g. for theme switcher or layout toggle). Shown only when footerTemplate is set.
- **`logo`**: The logo area within the NavPanel component.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-NavPanel](/docs/styles-and-themes/common-units/#color) | $backgroundColor | $backgroundColor |
| [backgroundColor-NavPanel-horizontal](/docs/styles-and-themes/common-units/#color) | $backgroundColor-AppHeader | $backgroundColor-AppHeader |
| [border-NavPanel](/docs/styles-and-themes/common-units/#border) | 0px solid $borderColor | 0px solid $borderColor |
| [borderBottom-NavPanel](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-footer-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-NavPanel](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-NavPanel](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-NavPanel](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-NavPanel](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRight-NavPanel](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-NavPanel-vertical](/docs/styles-and-themes/common-units/#border) | 1px solid $borderColor | 1px solid $borderColor |
| [borderRightColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-NavPanel](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-NavPanel](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-NavPanel](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-NavPanel](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-NavPanel](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-NavPanel](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-NavPanel](/docs/styles-and-themes/common-units/#boxShadow) | *none* | *none* |
| [boxShadow-NavPanel-vertical](/docs/styles-and-themes/common-units/#boxShadow) | 4px 0 4px 0 rgb(0 0 0 / 10%) | 4px 0 4px 0 rgb(0 0 0 / 10%) |
| [horizontalAlignment-logo-NavPanel](/docs/styles-and-themes/common-units/#alignment) | center | center |
| [marginBottom-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [padding-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [padding-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingHorizontal-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingHorizontal-NavPanel](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [paddingLeft-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-NavPanel](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-footer-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-logo-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-4 | $space-4 |
| [paddingVertical-NavPanel](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
