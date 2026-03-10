# IncludeMarkup [#includemarkup]

`IncludeMarkup` dynamically fetches XMLUI markup from a URL and renders it inline. Use it to share common fragments (headers, footers, navigation bars, etc.) across multiple XMLUI apps without duplicating markup.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `loadingContent` [#loadingcontent]

Optional content rendered while the request is in-flight. When the fetch completes this placeholder is replaced by the fetched markup.

### `url` [#url]

The URL to fetch XMLUI markup from. The component re-fetches and re-renders whenever this value changes. The server must allow cross-origin requests (CORS) when the app and the markup are served from different origins.

## Events [#events]

### `didFail` [#didfail]

This event fires when the fetch or parse operation fails (network error, non-2xx HTTP status, or XMLUI parse error).

**Signature**: `didFail(message: string): void`

- `message`: A human-readable description of the error that occurred.

### `didLoad` [#didload]

This event fires after the markup has been successfully fetched, parsed, and rendered.

**Signature**: `didLoad(): void`

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
