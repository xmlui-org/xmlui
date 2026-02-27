# IncludeMarkup [#includemarkup]

`IncludeMarkup` dynamically fetches XMLUI markup from a URL and renders it inline. Use it to share common fragments (headers, footers, navigation bars, etc.) across multiple XMLUI apps without duplicating markup.

**Key features:**
- **Dynamic inclusion**: Fetch and render XMLUI markup from any URL at runtime
- **Transparent rendering**: The included content appears inline without injecting wrapper elements
- **Loading placeholder**: Show a spinner or message while the request is in-flight using `loadingContent`
- **Reactive URL**: Automatically re-fetches when the `url` prop changes
- **Error handling**: React to fetch failures and parse errors via `didFail`

## How it works [#how-it-works]

`IncludeMarkup` fetches the XMLUI markup at the given URL and renders it as if it were part of the
current document. The fetched content can be a `<Fragment>` with multiple children or a named
`<Component>` definition — in the latter case the component wrapper is unwrapped automatically so
only its children are inserted.

```
<Fragment>
  <Link to="https://docs.xmlui.org" label="Docs" />
  <Link to="https://blog.xmlui.org" label="Blog" />
</Fragment>
```

The URL is re-evaluated reactively. If the value of `url` changes, the component fetches the new
resource and re-renders. The previous content is removed immediately as the new request starts.

## CORS [#cors]

When the app and the markup are served from different origins the server hosting the markup must
include the appropriate `Access-Control-Allow-Origin` header. Browser same-origin policy is enforced
as normal; `IncludeMarkup` has no way to bypass it.

## Script sections [#script-sections]

Only declarative XMLUI markup is supported. Any `<script>` section in the fetched file is
silently ignored by the parser.

## Shared navigation across a fleet of apps [#shared-navigation-across-a-fleet-of-apps]

A common reason to use `IncludeMarkup` is maintaining a single master copy of a navigation bar or
footer and sharing it between several independent XMLUI deployments. Host the shared file on a
CORS-enabled static server and include it in each app:

```xmlui-pg name="Example: shared footer across apps" height="160px"
---app copy display
<App>
  <Pages>
    <Page url="/">
      <Text>Home page content</Text>
    </Page>
  </Pages>
  <Footer>
    <IncludeMarkup url="/markup/shared-footer.xmlui">
      <property name="loadingContent">
        <Text>Loading footer…</Text>
      </property>
    </IncludeMarkup>
  </Footer>
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-shared-footer": {
      "url": "/shared-footer.xmlui",
      "method": "get",
      "handler": "return '<Fragment><HStack gap=\"1rem\"><Text>Docs</Text><Text>Blog</Text><Text>GitHub</Text></HStack></Fragment>'"
    }
  }
}
```

## Conditional inclusion [#conditional-inclusion]

Because `url` is a reactive expression you can include one of several fragments depending on
runtime state:

```xmlui-pg name="Example: role-based navigation" height="180px"
---app copy display
<App var.role="user">
  <HStack marginBottom="0.5rem">
    <Button label="Switch to admin" onClick="role = 'admin'" />
    <Button label="Switch to user" onClick="role = 'user'" />
  </HStack>
  <IncludeMarkup url="{'/markup/' + role + '-nav.xmlui'}" />
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-admin-nav": {
      "url": "/admin-nav.xmlui",
      "method": "get",
      "handler": "return '<Fragment><Text variant=\"strong\">Admin: Dashboard \u00b7 Users \u00b7 Settings</Text></Fragment>'"
    },
    "get-user-nav": {
      "url": "/user-nav.xmlui",
      "method": "get",
      "handler": "return '<Fragment><Text>User: Home \u00b7 Profile \u00b7 Help</Text></Fragment>'"
    }
  }
}
```

## Unwrapping a named Component [#unwrapping-a-named-component]

The fetched file can also be a full `<Component>` definition. `IncludeMarkup` automatically
unwraps the component wrapper and renders its children inline:

```xmlui-pg name="Example: fetching a named Component" height="160px"
---app copy display
<App>
  <IncludeMarkup url="/markup/footer-comp.xmlui" />
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-footer-comp": {
      "url": "/footer-comp.xmlui",
      "method": "get",
      "handler": "return '<Component name=\"FooterLinks\"><HStack gap=\"1rem\"><Text>Docs</Text><Text>Blog</Text></HStack></Component>'"
    }
  }
}
```

## Error boundary with fallback [#error-boundary-with-fallback]

Combine `didFail` with a `var` flag to display fallback content when the remote resource is down:

```xmlui-pg name="Example: error boundary" height="160px"
---app copy display
<App var.useFallback="{false}">
  <IncludeMarkup
    url="/markup/faulty-footer.xmlui"
    onDidFail="useFallback = true" />
  <Fragment when="{useFallback}">
    <ContentSeparator />
    <Text>© 2026 My Company</Text>
  </Fragment>
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-faulty-footer": {
      "url": "/faulty-footer.xmlui",
      "method": "get",
      "handler": "throw Errors.HttpError(503, { message: 'Service Unavailable' })"
    }
  }
}
```

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `loadingContent` [#loadingcontent]

Optional content rendered while the request is in-flight. When the fetch completes this placeholder is replaced by the fetched markup.

Content displayed while the request is in-flight. Once the response arrives (successfully or with
an error) this placeholder is replaced.

```xmlui-pg name="Example: loadingContent with a spinner" height="140px"
---app copy display
<App>
  <IncludeMarkup url="/markup/slow-header.xmlui">
    <property name="loadingContent">
      <HStack gap="0.5rem" verticalAlignment="center">
        <Spinner size="sm" />
        <Text>Loading…</Text>
      </HStack>
    </property>
  </IncludeMarkup>
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-slow-header": {
      "url": "/slow-header.xmlui",
      "method": "get",
      "handler": "delay(2000); return '<Fragment><Text variant=\"subtitle\">Header loaded after 2 s</Text></Fragment>'"
    }
  }
}
```

If `loadingContent` is not provided the component renders nothing until the fetch completes.

### `url` [#url]

The URL to fetch XMLUI markup from. The component re-fetches and re-renders whenever this value changes. The server must allow cross-origin requests (CORS) when the app and the markup are served from different origins.

The component fetches and renders the markup at the specified URL. The URL is evaluated reactively —
any change triggers a new fetch.

```xmlui-pg copy display name="Example: basic inclusion" height="120px"
---app
<App>
  <IncludeMarkup url="/markup/footer.xmlui" />
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-footer": {
      "url": "/footer.xmlui",
      "method": "get",
      "handler": "return '<Fragment><Text>© 2026 XMLUI · All rights reserved</Text></Fragment>'"
    }
  }
}
```

A binding expression is allowed, making it possible to swap the included content dynamically:

```xmlui-pg name="Example: dynamic url" height="160px"
---app copy display 
<App var.lang="en">
  <HStack>
    <Button label="English" onClick="lang = 'en'" />
    <Button label="German" onClick="lang = 'de'" />
  </HStack>
  <IncludeMarkup url="{'/markup/nav-' + lang + '.xmlui'}" />
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-nav-en": {
      "url": "/nav-en.xmlui",
      "method": "get",
      "handler": "return '<Fragment><Text>Home \u00b7 Docs \u00b7 Blog</Text></Fragment>'"
    },
    "get-nav-de": {
      "url": "/nav-de.xmlui",
      "method": "get",
      "handler": "return '<Fragment><Text>Start \u00b7 Dokumentation \u00b7 Blog</Text></Fragment>'"
    }
  }
}
```

When `url` is empty or not set, the component renders nothing.

## Events [#events]

### `didFail` [#didfail]

This event fires when the fetch or parse operation fails (network error, non-2xx HTTP status, or XMLUI parse error).

**Signature**: `didFail(message: string): void`

- `message`: A human-readable description of the error that occurred.

Fires when the fetch or parse operation fails. The single `message` argument contains a
human-readable description of the error (e.g. `"HTTP 404 Not Found"` or the text of a parse error).

```xmlui-pg name="Example: didFail — HTTP 404" height="160px"
---app copy display
<App var.error="">
  <IncludeMarkup
    url="/markup/missing.xmlui"
    onDidFail="msg => error = 'Load failed: ' + msg" />
  <Text when="{error}" value="{error}" color="$color-error" />
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-missing": {
      "url": "/missing.xmlui",
      "method": "get",
      "handler": "throw Errors.HttpError(404, { message: 'Not Found' })"
    }
  }
}
```

Use `didFail` to render fallback content when the remote resource is unavailable:

```xmlui-pg name="Example: didFail — fallback content" height="160px"
---app copy display
<App var.failed="{false}">
  <IncludeMarkup
    url="/markup/failing-footer.xmlui"
    onDidFail="failed = true" />
  <HStack when="{failed}" gap="1rem">
    <Text>Docs</Text>
    <Text>Blog</Text>
    <Text>GitHub</Text>
  </HStack>
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-footer": {
      "url": "/failing-footer.xmlui",
      "method": "get",
      "handler": "throw Errors.HttpError(503, { message: 'Service Unavailable' })"
    }
  }
}
```

### `didLoad` [#didload]

This event fires after the markup has been successfully fetched, parsed, and rendered.

**Signature**: `didLoad(): void`

Fires once after the markup has been successfully fetched, parsed, and rendered.

```xmlui-pg name="Example: didLoad" height="160px"
---app copy display
<App var.status="Fetching content…">
  <Text value="{status}" />
  <IncludeMarkup
    url="/markup/banner.xmlui"
    onDidLoad="status = 'Content loaded successfully ✓'" />
</App>
---api
{
  "apiUrl": "/markup",
  "operations": {
    "get-banner": {
      "url": "/banner.xmlui",
      "method": "get",
      "handler": "return '<Fragment><Text>Welcome banner</Text></Fragment>'"
    }
  }
}
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
