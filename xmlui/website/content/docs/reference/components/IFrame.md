# IFrame [#iframe]

`IFrame` embeds external content from another HTML document into the current page. It provides security controls through sandbox and allow attributes, and supports features like fullscreen display and referrer policy configuration.

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

### `allow` [#allow]

Specifies the permissions policy for the iframe. Controls which features (like camera, microphone, geolocation) the embedded content can use.

### `name` [#name]

Specifies a name for the iframe, which can be used as a target for links and forms.

### `referrerPolicy` [#referrerpolicy]

Controls how much referrer information is sent when fetching the iframe content.

Available values:

| Value | Description |
| --- | --- |
| `no-referrer` | Never send referrer information |
| `no-referrer-when-downgrade` | Send referrer only for same-security destinations |
| `origin` | Send only the origin as referrer |
| `origin-when-cross-origin` | Send full URL for same-origin, origin only for cross-origin |
| `same-origin` | Send referrer only for same-origin requests |
| `strict-origin` | Send origin only for same-security destinations |
| `strict-origin-when-cross-origin` | Full URL for same-origin, origin for cross-origin same-security |
| `unsafe-url` | Always send full URL as referrer |

### `sandbox` [#sandbox]

Applies extra restrictions to the content in the iframe. Value is a space-separated list of sandbox flags (e.g., 'allow-scripts allow-same-origin').

### `src` [#src]

Specifies the URL of the document to embed in the iframe. Either `src` or `srcdoc` should be specified, but not both.

### `srcdoc` [#srcdoc]

Specifies the HTML content to display in the iframe. Either `src` or `srcdoc` should be specified, but not both.

## Events [#events]

### `load` [#load]

This event is triggered when the IFrame content has finished loading.

**Signature**: `load(): void`

## Exposed Methods [#exposed-methods]

### `getContentDocument` [#getcontentdocument]

This method returns the content document of the iframe element.

**Signature**: `getContentDocument(): Document | null`

### `getContentWindow` [#getcontentwindow]

This method returns the content window of the iframe element.

**Signature**: `getContentWindow(): Window | null`

### `postMessage` [#postmessage]

This method sends a message to the content window of the iframe.

**Signature**: `postMessage(message: any, targetOrigin?: string): void`

- `message`: The message to send to the iframe's content window.
- `targetOrigin`: The origin to which the message should be sent. Defaults to '*'.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [border](/docs/styles-and-themes/common-units/#border)-IFrame | 1px solid $borderColor | 1px solid $borderColor |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-IFrame | $borderRadius | $borderRadius |
| [borderRight](/docs/styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-IFrame | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-IFrame | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-IFrame | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-IFrame | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-IFrame | *none* | *none* |
| [height](/docs/styles-and-themes/common-units/#size-values)-IFrame | 300px | 300px |
| [width](/docs/styles-and-themes/common-units/#size-values)-IFrame | 100% | 100% |
