# Share [#share]

`Share` renders a "Copy & share" dropdown that lets users copy the page as markdown for LLMs, open the page in ChatGPT or Claude with a pre-filled prompt, or share it on X (Twitter) or LinkedIn. Designed for blog posts and documentation pages.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `chatGptDescription`

> [!DEF]  default: **"Ask questions about this page"**

Secondary text under the Open in ChatGPT label.

### `chatGptLabel`

> [!DEF]  default: **"Open in ChatGPT"**

Label of the Open in ChatGPT menu item.

### `claudeDescription`

> [!DEF]  default: **"Ask questions about this page"**

Secondary text under the Open in Claude label.

### `claudeLabel`

> [!DEF]  default: **"Open in Claude"**

Label of the Open in Claude menu item.

### `copiedLabel`

> [!DEF]  default: **"Copied!"**

Label shown briefly after copying succeeds.

### `copyDescription`

> [!DEF]  default: **"Copy page as markdown for LLMs"**

Secondary text under the Copy page label.

### `copyLabel`

> [!DEF]  default: **"Copy page"**

Label of the Copy page menu item.

### `label`

> [!DEF]  default: **"Copy page"**

Label shown on the primary (left) split-button. Clicking the primary button copies the page; clicking the chevron opens the share menu.

### `linkedInDescription`

> [!DEF]  default: **"Start conversation"**

Secondary text under the Share in LinkedIn label.

### `linkedInLabel`

> [!DEF]  default: **"Share in LinkedIn"**

Label of the Share in LinkedIn menu item.

### `markdownContent`

Markdown content placed on the clipboard by the Copy page action.

### `pageTitle`

Title used as the share text on social platforms. Defaults to `document.title`.

### `pageUrl`

URL to share. Defaults to `window.location.href` when not provided.

### `showChatGpt`

> [!DEF]  default: **true**

Whether to show the Open in ChatGPT menu item.

### `showClaude`

> [!DEF]  default: **true**

Whether to show the Open in Claude menu item.

### `showCopy`

> [!DEF]  default: **true**

Whether to show the Copy page menu item.

### `showLinkedIn`

> [!DEF]  default: **true**

Whether to show the Share in LinkedIn menu item.

### `showTwitter`

> [!DEF]  default: **true**

Whether to show the Share in X (Twitter) menu item.

### `toggleAriaLabel`

> [!DEF]  default: **"Open share menu"**

Accessible label for the chevron toggle button.

### `twitterDescription`

> [!DEF]  default: **"Start conversation"**

Secondary text under the Share in X label.

### `twitterLabel`

> [!DEF]  default: **"Share in X (Twitter)"**

Label of the Share in X menu item.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Share](/docs/styles-and-themes/common-units/#color) | $backgroundColor-Card | $backgroundColor-Card |
| [backgroundColor-Share--hover](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-200 |
| [backgroundColor-ShareItem--hover](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-200 |
| [backgroundColor-ShareMenu](/docs/styles-and-themes/common-units/#color) | $color-surface-raised | $color-surface-raised |
| [borderColor-Share](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderColor-ShareMenu](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderRadius-Share](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [boxShadow-ShareMenu](/docs/styles-and-themes/common-units/#boxShadow) | $boxShadow-xl | $boxShadow-xl |
| [color-Share](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [color-ShareItem-secondary](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |
| [fontFamily-Share](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily | $fontFamily |
| [fontSize-Share](/docs/styles-and-themes/common-units/#size-values) | $fontSize | $fontSize |
| [fontSize-ShareItem-secondary](/docs/styles-and-themes/common-units/#size-values) | $fontSize-small | $fontSize-small |
| [gap-ShareMenu](/docs/styles-and-themes/common-units/#size) | $space-1 | $space-1 |
| [minWidth-ShareMenu](/docs/styles-and-themes/common-units/#size-values) | 300px | 300px |
| [paddingHorizontal-Share-trigger](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingHorizontal-ShareItem](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingHorizontal-ShareMenu](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-Share-trigger](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-ShareItem](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-ShareMenu](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
