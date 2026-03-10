# TabItem [#tabitem]

`TabItem` defines individual tabs within a [Tabs](/components/Tabs) component, providing both the tab header label and the content that displays when the tab is selected. As a non-visual structural component, it serves as a container that organizes content into distinct, switchable sections.

**Context variables available during execution:**

- `$header`: This context value represents the header context with props: id (optional), index, label, isActive.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `headerTemplate` [#headertemplate]

This property allows the customization of the TabItem header.

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

## Events [#events]

### `activated` [#activated]

This event is triggered when the tab is activated.

**Signature**: `activated(): void`

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
