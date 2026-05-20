# XSS Protection

XMLUI's default rendering path is XSS-safe by construction. Every value you
bind into markup flows through React's JSX escaping, and the DOM-mutation
APIs that could bypass that escaping are blocked inside expressions.

## What problems this prevents

- A string containing `<script>` or other HTML tags rendered into a `Text`,
  attribute, or any built-in component appears as literal characters — it
  is never parsed as HTML.
- Expressions cannot reach `innerHTML`, `outerHTML`, `insertAdjacentHTML`,
  `document.write`, or `createElement`, so there is no expression-level
  path to inject markup that bypasses React.
- A compromised data source cannot turn a normal text-display component
  into an HTML-injection sink, even if the value looks like markup.
- The XSS surface in your app is limited to the explicit, opt-in HTML
  rendering paths (such as Markdown) — not to every value binding.

## How it works

All values rendered by built-in components go through React's JSX path,
which escapes HTML characters before they hit the DOM. The framework's
display helpers (such as the `asDisplayText` value extractor) never
interpolate HTML. In addition, the script-runner sandbox blocks DOM
mutation APIs at the property-access guard: any expression that tries to
read or write `innerHTML`, call `insertAdjacentHTML`, or use a DOM
factory like `createElement` is denied.

> **Markdown caveat.** The `Markdown` component intentionally renders
> formatted content. If you pass user-supplied Markdown to it, sanitize the
> input on your server before sending it to the client. The default rendering
> path of every other component is XSS-safe without further action.

## Related

- [DOM API Isolation](/docs/managed-react/dom-api-isolation)
- [Code Injection Prevention](/docs/managed-react/code-injection-prevention)
- [Managed React Overview](/docs/managed-react/overview)
