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

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties [#properties]

### `url` [#url]

The URL of the route associated with the content. If not set, the page is not available.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
