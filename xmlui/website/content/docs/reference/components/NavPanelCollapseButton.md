# NavPanelCollapseButton [#navpanelcollapsebutton]

`NavPanelCollapseButton` toggles the sidebar (NavPanel) collapse state when used in a vertical app layout. Place it in the NavPanel footer (e.g. next to ToneChangerButton) for a Nextra-like sidebar toggle.

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

### `aria-label` [#aria-label]

Accessible label for the button when expanded.

### `aria-labelCollapsed` [#aria-labelcollapsed]

Accessible label for the button when collapsed.

### `icon` [#icon]

> [!DEF]  default: **"sidebar-collapse"**

Icon name for the button when the panel is expanded (collapse action).

### `iconCollapsed` [#iconcollapsed]

> [!DEF]  default: **"sidebar-collapse"**

Icon name for the button when the panel is collapsed (expand action).

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
