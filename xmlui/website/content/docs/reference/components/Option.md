# Option [#option]

`Option` defines selectable items for choice-based components, providing both the underlying value and display text for selection interfaces. It serves as a non-visual data structure that describes individual choices within [Select](/components/Select), [AutoComplete](/components/AutoComplete), and other selection components.

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

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property indicates whether the option is enabled or disabled.

### `keywords` [#keywords]

An array of keywords that can be used for searching and filtering the option. These keywords are not displayed but help users find the option through search.

### `label` [#label]

This property defines the text to display for the option. If `label` is not defined, `Option` will use the `value` as the label.

### `value` [#value]

This property defines the value of the option. If `value` is not defined, `Option` will use the `label` as the value. If neither is defined, the option is not displayed.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
