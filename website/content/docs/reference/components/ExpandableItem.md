# ExpandableItem [#expandableitem]

`ExpandableItem` creates expandable/collapsible section, similar to the HTML details disclosure element. When the user clicks on the `summary` the content expands or collapses.

**Key features:**
- **Progressive disclosure**: Show/hide content on demand to reduce visual clutter
- **Flexible summary**: Use text or rich components for the summary trigger
- **Keyboard accessible**: Full keyboard navigation support with Enter/Space keys
- **Customizable icons**: Choose your own expand/collapse icons or use a switch

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `contentWidth` [#contentwidth]

> [!DEF]  default: **"100%"**

Sets the width of the expanded content area. Defaults to 100% to fill the parent container.

Controls the width of the expanded content area. Defaults to `100%` to fill the parent container.

```xmlui-pg copy display name="Example: contentWidth" height="300px"
<App>
  <VStack gap="space-4">
    <ExpandableItem 
      summary="Default content width (100%)" 
      initiallyExpanded="true">
      <Stack backgroundColor="lightblue" padding="space-3">
        <Text>Content fills the full width</Text>
      </Stack>
    </ExpandableItem>
    
    <ExpandableItem 
      summary="Custom content width (50%)" 
      contentWidth="50%"
      initiallyExpanded="true">
      <Stack backgroundColor="lightgreen" padding="space-3">
        <Text>Content is 50% width</Text>
      </Stack>
    </ExpandableItem>
  </VStack>
</App>
```

### `enabled` [#enabled]

> [!DEF]  default: **true**

When true, the expandable item can be opened and closed. When false, it cannot be toggled.

### `fullWidthSummary` [#fullwidthsummary]

> [!DEF]  default: **false**

When true, the summary section takes the full width of the parent container. When combined with iconPosition='end', the icon is aligned to the far edge.

When `true`, the summary section takes the full width of the parent container, with the icon aligned to the far edge.

```xmlui-pg copy display name="Example: fullWidthSummary" height="300px"
<App>
  <VStack gap="space-4" width="100%">
    <ExpandableItem 
      summary="Default summary (inline width)" 
      initiallyExpanded="true">
      <Text>The summary only takes up the space it needs.</Text>
    </ExpandableItem>
    
    <ExpandableItem 
      summary="Full width summary" 
      fullWidthSummary="true"
      initiallyExpanded="true">
      <Text>The summary spans the full width of the parent container.</Text>
    </ExpandableItem>
  </VStack>
</App>
```

### `iconCollapsed` [#iconcollapsed]

> [!DEF]  default: **"chevronright"**

The icon to display when the item is collapsed.

### `iconExpanded` [#iconexpanded]

> [!DEF]  default: **"chevrondown"**

The icon to display when the item is expanded.

### `iconPosition` [#iconposition]

> [!DEF]  default: **"end"**

Determines the position of the icon (start or end).

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) **(default)** |

### `initiallyExpanded` [#initiallyexpanded]

> [!DEF]  default: **false**

Determines if the component is initially expanded when rendered.

### `summary` [#summary]

The summary content that is always visible and acts as the trigger.

The `summary` property accepts either a simple text string or a component definition for rich content.

```xmlui-pg copy display name="Example: summary" height="340px"
<App>
  <VStack gap="space-4">
    <ExpandableItem summary="Simple text summary" initiallyExpanded="true">
      <Text>This expandable item uses a simple text string for its summary.</Text>
    </ExpandableItem>
    
    <ExpandableItem initiallyExpanded="false">
      <property name="summary">
        <CHStack gap="space-2">
          <Icon name="apps" />
          <Text fontWeight="600">Custom Summary with Icon</Text>
          <Badge label="New" variant="success" />
        </CHStack>
      </property>
      <Text>
        This expandable item uses a rich component 
        definition with icons and badges in the summary.
      </Text>
    </ExpandableItem>
  </VStack>
</App>
```

### `withSwitch` [#withswitch]

> [!DEF]  default: **false**

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
| [animation-content-ExpandableItem](/docs/styles-and-themes/layout-props/#animation) | ease-out | ease-out |
| [animationDuration-content-ExpandableItem](/docs/styles-and-themes/layout-props/#animationDuration) | 0.2s | 0.2s |
| [backgroundColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | transparent | transparent |
| [backgroundColor-ExpandableItem--active](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-ExpandableItem--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-summary-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-summary-ExpandableItem--active](/docs/styles-and-themes/common-units/#color) | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor-summary-ExpandableItem--hover](/docs/styles-and-themes/common-units/#color) | $color-secondary-100 | $color-secondary-100 |
| [border-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [border-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | 1px | 1px |
| [borderColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | $borderColor | $borderColor |
| [borderEndEndRadius-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | 0 | 0 |
| [borderRadius-summary-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-ExpandableItem](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | solid | solid |
| [borderTop-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-content-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-ExpandableItem](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-ExpandableItem](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | 0 | 0 |
| [color-ExpandableItem](/docs/styles-and-themes/common-units/#color) | $textColor-primary | $textColor-primary |
| [color-ExpandableItem--disabled](/docs/styles-and-themes/common-units/#color) | $textColor--disabled | $textColor--disabled |
| [direction-content-ExpandableItem](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [direction-summary-ExpandableItem](/docs/styles-and-themes/layout-props#direction) | *none* | *none* |
| [fontFamily-content-ExpandableItem](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontFamily-ExpandableItem](/docs/styles-and-themes/common-units/#fontFamily) | $fontFamily | $fontFamily |
| [fontFamily-summary-ExpandableItem](/docs/styles-and-themes/common-units/#fontFamily) | *none* | *none* |
| [fontSize-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontStretch-content-ExpandableItem](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStretch-summary-ExpandableItem](/docs/styles-and-themes/common-units/#fontStretch) | *none* | *none* |
| [fontStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontStyle-summary-ExpandableItem](/docs/styles-and-themes/common-units/#fontStyle) | *none* | *none* |
| [fontVariant-content-ExpandableItem](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontVariant-summary-ExpandableItem](/docs/styles-and-themes/common-units/#font-variant) | *none* | *none* |
| [fontWeight-content-ExpandableItem](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-ExpandableItem](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [fontWeight-summary-ExpandableItem](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [gap-ExpandableItem](/docs/styles-and-themes/common-units/#size) | $space-2 | $space-2 |
| [letterSpacing-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [letterSpacing-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineBreak-content-ExpandableItem](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineBreak-summary-ExpandableItem](/docs/styles-and-themes/common-units/#line-break) | *none* | *none* |
| [lineHeight-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [lineHeight-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [padding-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-2 $space-4 | $space-2 $space-4 |
| [paddingBottom-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [paddingBottom-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingLeft-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [paddingLeft-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-3 | $space-3 |
| [paddingRight-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [paddingRight-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-0 | $space-0 |
| [paddingTop-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | $space-2 | $space-2 |
| [paddingVertical-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textAlign-content-ExpandableItem](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlign-summary-ExpandableItem](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-content-ExpandableItem](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textAlignLast-summary-ExpandableItem](/docs/styles-and-themes/common-units/#text-align) | *none* | *none* |
| [textColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textColor-summary-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-content-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationColor-summary-ExpandableItem](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textDecorationLine-content-ExpandableItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationLine-summary-ExpandableItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-content-ExpandableItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationStyle-summary-ExpandableItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-content-ExpandableItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textDecorationThickness-summary-ExpandableItem](/docs/styles-and-themes/common-units/#textDecoration) | *none* | *none* |
| [textIndent-content-ExpandableItem](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textIndent-summary-ExpandableItem](/docs/styles-and-themes/common-units/#text-indent) | *none* | *none* |
| [textShadow-content-ExpandableItem](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textShadow-summary-ExpandableItem](/docs/styles-and-themes/common-units/#text-shadow) | *none* | *none* |
| [textTransform-content-ExpandableItem](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textTransform-summary-ExpandableItem](/docs/styles-and-themes/common-units/#textTransform) | *none* | *none* |
| [textUnderlineOffset-content-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textUnderlineOffset-summary-ExpandableItem](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [transition-summary-ExpandableItem](/docs/styles-and-themes/common-units/#transition) | color 0.2s, background 0.2s | color 0.2s, background 0.2s |
| [wordBreak-content-ExpandableItem](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordBreak-summary-ExpandableItem](/docs/styles-and-themes/common-units/#word-break) | *none* | *none* |
| [wordSpacing-content-ExpandableItem](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordSpacing-summary-ExpandableItem](/docs/styles-and-themes/common-units/#word-spacing) | *none* | *none* |
| [wordWrap-content-ExpandableItem](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [wordWrap-summary-ExpandableItem](/docs/styles-and-themes/common-units/#word-wrap) | *none* | *none* |
| [writingMode-content-ExpandableItem](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
| [writingMode-summary-ExpandableItem](/docs/styles-and-themes/common-units/#writing-mode) | *none* | *none* |
