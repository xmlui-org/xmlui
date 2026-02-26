# ScrollViewer [#scrollviewer]

`ScrollViewer` is a simple layout container that stretches to fill its parent's viewport and provides customizable scrollbar styles for scrollable content. It supports four scrollbar modes: normal (standard browser scrollbars), overlay (themed scrollbars always visible), whenMouseOver (scrollbars appear on hover), and whenScrolling (scrollbars appear during scrolling).

`ScrollViewer` is a layout container component that provides customizable scrollbar styling for its content. It stretches to fill 100% of its parent container's width and height, making it ideal for creating scrollable regions with enhanced visual control over scrollbar appearance.

**Key features:**
- **Multiple scrollbar styles**: Choose from browser default, themed, hover-activated, or scroll-activated scrollbars
- **Automatic sizing**: Stretches to fill parent container dimensions
- **Theme integration**: Uses shared theme variables for consistent styling across the application
- **Performance optimized**: Leverages OverlayScrollbars library for smooth, customizable scrolling

**ScrollStyle Options:**

The `scrollStyle` property controls how scrollbars are displayed:
- **`normal`**: Uses the browser's native default scrollbar
- **`overlay`**: Displays a themed scrollbar that is always visible and customizable via theme variables
- **`whenMouseOver`**: Shows the scrollbar only when hovering over the scroll container
- **`whenScrolling`**: Displays the scrollbar only while scrolling, then fades out after 400ms of inactivity

**Basic Usage:**

```xmlui copy
<App scrollWholePage="false">
  <ScrollViewer height="300px">
    <Items data="{ Array.from({ length: 50 }).map((_, i) => ('Item #' + i)) }">
      <Text value="{$item}" />
    </Items>
  </ScrollViewer>
</App>
```

**Normal Scrollbar (Browser Default):**

```xmlui-pg copy name="ScrollStyle: Normal" height="400px"
<App scrollWholePage="false">
  <ScrollViewer scrollStyle="normal" height="300px" backgroundColor="$color-surface-100">
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <H3 value="{$item}" />
    </Items>
  </ScrollViewer>
</App>
```

**Overlay Scrollbar (Always Visible, Themed):**

The overlay scrollbar is always visible and uses theme variables for customization.

```xmlui-pg copy name="ScrollStyle: Overlay" height="400px"
<App scrollWholePage="false">
  <ScrollViewer scrollStyle="overlay" height="300px" backgroundColor="$color-surface-100">
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <H3 value="{$item}" />
    </Items>
  </ScrollViewer>
</App>
```

**When Mouse Over (Hover-Activated):**

The scrollbar appears only when you hover your mouse over the scroll container.

```xmlui-pg copy name="ScrollStyle: When Mouse Over" height="400px"
<App scrollWholePage="false">
  <ScrollViewer scrollStyle="whenMouseOver" height="300px" backgroundColor="$color-surface-100">
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <H3 value="{$item}" />
    </Items>
  </ScrollViewer>
</App>
```

**When Scrolling (Scroll-Activated):**

The scrollbar appears only while actively scrolling and fades out after 400ms of inactivity.

```xmlui-pg copy name="ScrollStyle: When Scrolling" height="400px"
<App scrollWholePage="false">
  <ScrollViewer scrollStyle="whenScrolling" height="300px" backgroundColor="$color-surface-100">
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <H3 value="{$item}" />
    </Items>
  </ScrollViewer>
</App>
```

**With Custom Content:**

`ScrollViewer` works with any content type, not just lists.

```xmlui-pg copy name="ScrollViewer with Custom Content" height="500px"
<App scrollWholePage="false">
  <ScrollViewer scrollStyle="styled" height="400px" padding="$space-4" backgroundColor="$color-surface-50">
    <VStack gap="$space-4">
      <H1 value="Long Article Title" />
      <Text value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." />
      <H2 value="Section 1" />
      <Text value="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." />
      <H2 value="Section 2" />
      <Text value="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium." />
      <H2 value="Section 3" />
      <Text value="Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit." />
      <H2 value="Section 4" />
      <Text value="Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit." />
      <H2 value="Section 5" />
      <Text value="Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam." />
    </VStack>
  </ScrollViewer>
</App>
```

%-PROP-START headerTemplate

The `headerTemplate` property allows you to define a custom header that remains fixed at the top of the `ScrollViewer`.

```xmlui-pg copy display {3-11} name="ScrollViewer with Header" height="400px"
<App scrollWholePage="false">
  <ScrollViewer height="300px" backgroundColor="$color-surface-100">
    <property name="headerTemplate">
      <HStack 
        padding="$space-2" 
        backgroundColor="$color-surface-200" 
        borderBottom="1px solid $color-border-default"
      >
        <H4 value="Sticky Header" />
      </HStack>
    </property>
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <Text value="{$item}" padding="$space-2" />
    </Items>
  </ScrollViewer>
</App>
```

%-PROP-END

%-PROP-START footerTemplate

The `footerTemplate` property allows you to define a custom footer that remains fixed at the bottom of the `ScrollViewer`.

```xmlui-pg copy display {9-18} name="ScrollViewer with Footer" height="400px"
<App scrollWholePage="false">
  <ScrollViewer height="300px" backgroundColor="$color-surface-100">
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <Text value="{$item}" padding="$space-2" />
    </Items>
    <property name="footerTemplate">
      <HStack 
        padding="$space-2" 
        backgroundColor="$color-surface-200" 
        borderTop="1px solid $color-border-default"
        horizontalAlignment="center"
      >
        <H4 value="Sticky Footer" />
      </HStack>
    </property>
  </ScrollViewer>
</App>
```

%-PROP-END

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

The `footerTemplate` property allows you to define a custom footer that remains fixed at the bottom of the `ScrollViewer`.

```xmlui-pg copy display {9-18} name="ScrollViewer with Footer" height="400px"
<App scrollWholePage="false">
  <ScrollViewer height="300px" backgroundColor="$color-surface-100">
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <Text value="{$item}" padding="$space-2" />
    </Items>
    <property name="footerTemplate">
      <HStack 
        padding="$space-2" 
        backgroundColor="$color-surface-200" 
        borderTop="1px solid $color-border-default"
        horizontalAlignment="center"
      >
        <H4 value="Sticky Footer" />
      </HStack>
    </property>
  </ScrollViewer>
</App>
```

### `headerTemplate` [#headertemplate]

An optional template that defines content always visible at the top of the `ScrollViewer`, outside the scrollable area. The header sticks to the top while the inner content scrolls.

The `headerTemplate` property allows you to define a custom header that remains fixed at the top of the `ScrollViewer`.

```xmlui-pg copy display {3-11} name="ScrollViewer with Header" height="400px"
<App scrollWholePage="false">
  <ScrollViewer height="300px" backgroundColor="$color-surface-100">
    <property name="headerTemplate">
      <HStack 
        padding="$space-2" 
        backgroundColor="$color-surface-200" 
        borderBottom="1px solid $color-border-default"
      >
        <H4 value="Sticky Header" />
      </HStack>
    </property>
    <Items
      id="myList"
      data="{ Array.from({ length: 100 }).map((_, i) => ('Item #' + i)) }"
    >
      <Text value="{$item}" padding="$space-2" />
    </Items>
  </ScrollViewer>
</App>
```

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

The `ScrollViewer` component uses shared theme variables with other layout containers that may act as scroll containers. Please note that these shared theme variables use the `Scroller` virtual component name, and not `ScrollViewer`.

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| autoHideDelay-whenMouseOver-Scroller | 400 | 400 |
| autoHideDelay-whenScrolling-Scroller | 400 | 400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-fade-Scroller | rgb(from $color-surface-0 r g b / 0.75) | rgb(from $color-surface-0 r g b / 0.75) |
| [backgroundColor](../styles-and-themes/common-units/#color)-handle-Scroller | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-handle-Scroller--active | $color-surface-400 | $color-surface-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-handle-Scroller--hover | $color-surface-400 | $color-surface-400 |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Scroller | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Scroller--active | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-track-Scroller--hover | transparent | transparent |
| [border](../styles-and-themes/common-units/#border)-handle-Scroller | none | none |
| [border](../styles-and-themes/common-units/#border)-handle-Scroller--active | none | none |
| [border](../styles-and-themes/common-units/#border)-handle-Scroller--hover | none | none |
| [border](../styles-and-themes/common-units/#border)-track-Scroller | none | none |
| [border](../styles-and-themes/common-units/#border)-track-Scroller--active | none | none |
| [border](../styles-and-themes/common-units/#border)-track-Scroller--hover | none | none |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-handle-Scroller | 10px | 10px |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-track-Scroller | 2px | 2px |
| [height](../styles-and-themes/common-units/#size)-fade-Scroller | 64px | 64px |
| maxSize-handle-Scroller | none | none |
| minSize-handle-Scroller | 33px | 33px |
| [offset](../styles-and-themes/common-units/#size)-handleInteractiveArea-Scroller | 4px | 4px |
| [padding](../styles-and-themes/common-units/#size)-axis-Scroller | 2px | 2px |
| [padding](../styles-and-themes/common-units/#size)-perpendicular-Scroller | 2px | 2px |
| [size](../styles-and-themes/common-units/#size)-perpendicularHandle-Scroller | 100% | 100% |
| [size](../styles-and-themes/common-units/#size)-perpendicularHandle-Scroller--active | 100% | 100% |
| [size](../styles-and-themes/common-units/#size)-perpendicularHandle-Scroller--hover | 100% | 100% |
| [size](../styles-and-themes/common-units/#size)-Scroller | 10px | 10px |
| [transition](../styles-and-themes/common-units/#transition)-fade-Scroller | opacity 0.3s ease-in-out | opacity 0.3s ease-in-out |
| [transition](../styles-and-themes/common-units/#transition)-handle-Scroller | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-Scroller | opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s | opacity 0.15s, visibility 0.15s, top 0.15s, right 0.15s, bottom 0.15s, left 0.15s |
| [transition](../styles-and-themes/common-units/#transition)-track-Scroller | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)Handle-Scroller | opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s | opacity 0.15s, background-color 0.15s, border-color 0.15s, height 0.15s, width 0.15s |
| [transition](../styles-and-themes/common-units/#transition)Track-Scroller | opacity 0.15s, background-color 0.15s, border-color 0.15s | opacity 0.15s, background-color 0.15s, border-color 0.15s |

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
