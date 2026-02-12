# Page [#page]

`Page` defines route endpoints within an application, mapping specific URL patterns to content that displays when users navigate to those routes. Each Page represents a distinct view or screen in your single-page application's routing system.

**Key features:**
- **Navigation**: Activated by [NavLink](/components/NavLink) or programmatic navigation (`Actions.navigate()`)
- **Content container**: Wraps any XMLUI components to define what displays for each route
- **URL pattern matching**: Maps exact URLs or dynamic patterns with parameters to specific content
- **Route parameters**: Supports dynamic URL segments (e.g., `/user/:id`) accessible via `$routeParams`
- **Query parameter access**: Retrieves URL query parameters through `$queryParams` context variable

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `url` [#url]

The URL of the route associated with the content. If not set, the page is not available.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
