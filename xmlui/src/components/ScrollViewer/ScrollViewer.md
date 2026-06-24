%-DESC-START

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

%-DESC-END

%-STYLE-START

The `ScrollViewer` component uses shared theme variables with other layout containers that may act as scroll containers. Please note that these shared theme variables use the `Scroller` virtual component name, and not `ScrollViewer`.

%-STYLE-END