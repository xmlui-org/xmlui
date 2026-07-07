# ReleaseList [#releaselist]

Release list. Items: tag_name or version, published_at, changes[{ description, commit_sha }], optional assets[{ name, browser_download_url }].

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `commitBaseUrl`

Base URL for commit links (e.g. 'https://github.com/org/repo/commit'). If set, each change shows a link using commit_sha.

### `downloadLabel`

Label for download button. Default: 'Download'.

### `items`

Array of release entries.

### `showLatestBadge`

Show 'Latest' badge on first item. Default: true.

### `title`

Page title. Default: 'Change Log'.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.
