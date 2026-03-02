# SubMenuItem [#submenuitem]

`SubMenuItem` creates hierarchical menu structures by acting as both a menu item and a container for nested menu items. When clicked or hovered, it reveals a submenu containing additional [MenuItem](/components/MenuItem), [MenuSeparator](/components/MenuSeparator), or other [SubMenuItem](/components/SubMenuItems) components, enabling complex multi-level navigation and action organization.

**Key features:**
- **Hierarchical nesting**: Creates multi-level menu structures within [DropdownMenu](/docs/reference/components/DropdownMenu) components
- **Dual functionality**: Acts as both a clickable menu item and a container for other menu components
- **Custom triggers**: Configurable trigger appearance via triggerTemplate property
- **Progressive disclosure**: Reveals nested options on hover or click interaction
- **Unlimited depth**: Supports multiple levels of nesting for complex menu hierarchies

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

### `icon` [#icon]

This property names an optional icon to display with the submenu item. You can use component-specific icons in the format "iconName:SubMenuItem".

### `iconPosition` [#iconposition]

> [!DEF]  default: **"start"**

This property allows you to determine the position of the icon displayed in the submenu item.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) **(default)** |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) |

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `triggerTemplate` [#triggertemplate]

This property allows you to define a custom trigger instead of the default one provided by `SubMenuItem`.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
