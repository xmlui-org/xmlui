# ExpandableItem [#expandableitem]

`ExpandableItem` creates expandable/collapsible section, similar to the HTML details disclosure element. When the user clicks on the `summary` the content expands or collapses.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `enabled` [#enabled]

-  default: **true**

When true, the expandable item can be opened and closed. When false, it cannot be toggled.

### `iconCollapsed` [#iconcollapsed]

-  default: **"chevronright"**

The icon to display when the item is collapsed.

### `iconExpanded` [#iconexpanded]

-  default: **"chevrondown"**

The icon to display when the item is expanded.

### `iconPosition` [#iconposition]

-  default: **"end"**

Determines the position of the icon (start or end).

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) **(default)** |

### `initiallyExpanded` [#initiallyexpanded]

-  default: **false**

Determines if the component is initially expanded when rendered.

### `summary` [#summary]

The summary content that is always visible and acts as the trigger.

### `withSwitch` [#withswitch]

-  default: **false**

When true, a switch is used instead of an icon to toggle the expanded state.

## Events [#events]

### `expandedChange` [#expandedchange]

This event fires when the expandable item is expanded or collapsed. It provides a boolean value indicating the new state.

**Signature**: `expandedChange(isExpanded: boolean): void`

- `isExpanded`: A boolean indicating whether the item is now expanded (true) or collapsed (false).

## Exposed Methods [#exposed-methods]

### `collapse` [#collapse]

This method collapses the item.

**Signature**: `collapse(): void`

### `expand` [#expand]

This method expands the item.

**Signature**: `expand(): void`

### `isExpanded` [#isexpanded]

This method returns a boolean indicating whether the item is currently expanded.

**Signature**: `isExpanded(): boolean`

### `toggle` [#toggle]

This method toggles the item's expanded state.

**Signature**: `toggle(): void`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`content`**: The content section that is expanded or collapsed.
- **`summary`**: The summary section that is always visible and acts as the trigger.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [animation](../styles-and-themes/layout-props/#animation)-content-ExpandableItem | ease-out | ease-out |
| [animationDuration](../styles-and-themes/layout-props/#animationDuration)-content-ExpandableItem | 0.2s | 0.2s |
| [backgroundColor](../styles-and-themes/common-units/#color)-ExpandableItem | transparent | transparent |
| [backgroundColor](../styles-and-themes/common-units/#color)-ExpandableItem--active | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor](../styles-and-themes/common-units/#color)-ExpandableItem--hover | $color-secondary-100 | $color-secondary-100 |
| [border](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-ExpandableItem | 1px | 1px |
| [borderColor](../styles-and-themes/common-units/#color)-ExpandableItem | $borderColor | $borderColor |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ExpandableItem | 0 | 0 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-summary-ExpandableItem | $borderRadius | $borderRadius |
| [borderRight](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | solid | solid |
| [borderTop](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderTopColor](../styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-ExpandableItem | 0 | 0 |
| [color](../styles-and-themes/common-units/#color)-ExpandableItem | $textColor-primary | $textColor-primary |
| [color](../styles-and-themes/common-units/#color)-ExpandableItem--disabled | $textColor--disabled | $textColor--disabled |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-ExpandableItem | $fontFamily | $fontFamily |
| [fontSize](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [fontWeight](../styles-and-themes/common-units/#fontWeight)-ExpandableItem | *none* | *none* |
| [gap](../styles-and-themes/common-units/#size)-ExpandableItem | $space-2 | $space-2 |
| [padding](../styles-and-themes/common-units/#size)-content-ExpandableItem | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [padding](../styles-and-themes/common-units/#size)-summary-ExpandableItem | $space-2 $space-4 | $space-2 $space-4 |
| [paddingBottom](../styles-and-themes/common-units/#size)-content-ExpandableItem | *none* | *none* |
| [paddingBottom](../styles-and-themes/common-units/#size)-ExpandableItem | $space-2 | $space-2 |
| [paddingBottom](../styles-and-themes/common-units/#size)-summary-ExpandableItem | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-content-ExpandableItem | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-ExpandableItem-summary | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-summary-ExpandableItem | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-content-ExpandableItem | $space-3 | $space-3 |
| [paddingLeft](../styles-and-themes/common-units/#size)-ExpandableItem | $space-0 | $space-0 |
| [paddingLeft](../styles-and-themes/common-units/#size)-summary-ExpandableItem | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-content-ExpandableItem | $space-3 | $space-3 |
| [paddingRight](../styles-and-themes/common-units/#size)-ExpandableItem | $space-0 | $space-0 |
| [paddingRight](../styles-and-themes/common-units/#size)-summary-ExpandableItem | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-content-ExpandableItem | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-ExpandableItem | $space-2 | $space-2 |
| [paddingTop](../styles-and-themes/common-units/#size)-summary-ExpandableItem | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-content-ExpandableItem | $space-2 | $space-2 |
| [paddingVertical](../styles-and-themes/common-units/#size)-ExpandableItem | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-ExpandableItem-summary | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-summary-ExpandableItem | *none* | *none* |
| [transition](../styles-and-themes/common-units/#transition)-summary-ExpandableItem | color 0.2s, background 0.2s | color 0.2s, background 0.2s |
