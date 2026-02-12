# NavPanelCollapseButton [#navpanelcollapsebutton]

`NavPanelCollapseButton` toggles the sidebar (NavPanel) collapse state when used in a vertical app layout. Place it in the NavPanel footer (e.g. next to ToneChangerButton) for a Nextra-like sidebar toggle.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `aria-label` [#aria-label]

Accessible label for the button when expanded.

### `aria-labelCollapsed` [#aria-labelcollapsed]

Accessible label for the button when collapsed.

### `icon` [#icon]

-  default: **"sidebar-collapse"**

Icon name for the button when the panel is expanded (collapse action).

### `iconCollapsed` [#iconcollapsed]

-  default: **"sidebar-collapse"**

Icon name for the button when the panel is collapsed (expand action).

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
