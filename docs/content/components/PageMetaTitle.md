# PageMetaTitle [#pagemetatitle]

`PageMetaTitle` dynamically sets or updates the browser tab title, enabling pages and components to override the default application name with context-specific titles.

**Key features:**
- **Dynamic title updates**: Change browser tab title based on current page or content
- **App name override**: Supersedes the `App`s name property when present
- **Flexible placement**: Can be positioned anywhere in the component tree
- **Binding support**: Accepts dynamic values and expressions for context-aware titles
- **SEO enhancement**: Improves search engine optimization with descriptive page titles

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `value` [#value]

-  default: **"XMLUI Application"**

This property sets the page's title to display in the browser tab.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
