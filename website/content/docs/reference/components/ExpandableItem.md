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
| Publish/Subscribe | `subscribeToTopic` |
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
| [animation](/docs/styles-and-themes/layout-props/#animation)-content-ExpandableItem | ease-out | ease-out |
| [animationDuration](/docs/styles-and-themes/layout-props/#animationDuration)-content-ExpandableItem | 0.2s | 0.2s |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | transparent | transparent |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem--active | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-summary-ExpandableItem | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-summary-ExpandableItem--active | $color-secondary-100 | $color-secondary-100 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-summary-ExpandableItem--hover | $color-secondary-100 | $color-secondary-100 |
| [border](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [border](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | 1px | 1px |
| [borderColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | $borderColor | $borderColor |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-content-ExpandableItem | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-content-ExpandableItem | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ExpandableItem | 0 | 0 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-summary-ExpandableItem | $borderRadius | $borderRadius |
| [borderRight](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-content-ExpandableItem | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-content-ExpandableItem | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-ExpandableItem | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | solid | solid |
| [borderTop](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-content-ExpandableItem | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-ExpandableItem | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-ExpandableItem | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-content-ExpandableItem | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-ExpandableItem | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | 0 | 0 |
| [color](/docs/styles-and-themes/common-units/#color)-ExpandableItem | $textColor-primary | $textColor-primary |
| [color](/docs/styles-and-themes/common-units/#color)-ExpandableItem--disabled | $textColor--disabled | $textColor--disabled |
| [direction](/docs/styles-and-themes/layout-props#direction)-content-ExpandableItem | *none* | *none* |
| [direction](/docs/styles-and-themes/layout-props#direction)-summary-ExpandableItem | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-content-ExpandableItem | *none* | *none* |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-ExpandableItem | $fontFamily | $fontFamily |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-summary-ExpandableItem | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-content-ExpandableItem | *none* | *none* |
| [fontStretch](/docs/styles-and-themes/common-units/#fontStretch)-summary-ExpandableItem | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-content-ExpandableItem | *none* | *none* |
| [fontStyle](/docs/styles-and-themes/common-units/#fontStyle)-summary-ExpandableItem | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-content-ExpandableItem | *none* | *none* |
| [fontVariant](/docs/styles-and-themes/common-units/#font-variant)-summary-ExpandableItem | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-content-ExpandableItem | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-ExpandableItem | *none* | *none* |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-summary-ExpandableItem | *none* | *none* |
| [gap](/docs/styles-and-themes/common-units/#size)-ExpandableItem | $space-2 | $space-2 |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [letterSpacing](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-content-ExpandableItem | *none* | *none* |
| [lineBreak](/docs/styles-and-themes/common-units/#line-break)-summary-ExpandableItem | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [lineHeight](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [padding](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | $space-2 $space-4 | $space-2 $space-4 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | $space-2 | $space-2 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | $space-3 | $space-3 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | $space-0 | $space-0 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | $space-3 | $space-3 |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | $space-0 | $space-0 |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | $space-2 | $space-2 |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | $space-2 | $space-2 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-ExpandableItem | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-content-ExpandableItem | *none* | *none* |
| [textAlign](/docs/styles-and-themes/common-units/#text-align)-summary-ExpandableItem | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-content-ExpandableItem | *none* | *none* |
| [textAlignLast](/docs/styles-and-themes/common-units/#text-align)-summary-ExpandableItem | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-summary-ExpandableItem | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-content-ExpandableItem | *none* | *none* |
| [textDecorationColor](/docs/styles-and-themes/common-units/#color)-summary-ExpandableItem | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-content-ExpandableItem | *none* | *none* |
| [textDecorationLine](/docs/styles-and-themes/common-units/#textDecoration)-summary-ExpandableItem | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-content-ExpandableItem | *none* | *none* |
| [textDecorationStyle](/docs/styles-and-themes/common-units/#textDecoration)-summary-ExpandableItem | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-content-ExpandableItem | *none* | *none* |
| [textDecorationThickness](/docs/styles-and-themes/common-units/#textDecoration)-summary-ExpandableItem | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-content-ExpandableItem | *none* | *none* |
| [textIndent](/docs/styles-and-themes/common-units/#text-indent)-summary-ExpandableItem | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-content-ExpandableItem | *none* | *none* |
| [textShadow](/docs/styles-and-themes/common-units/#text-shadow)-summary-ExpandableItem | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-content-ExpandableItem | *none* | *none* |
| [textTransform](/docs/styles-and-themes/common-units/#textTransform)-summary-ExpandableItem | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-content-ExpandableItem | *none* | *none* |
| [textUnderlineOffset](/docs/styles-and-themes/common-units/#size-values)-summary-ExpandableItem | *none* | *none* |
| [transition](/docs/styles-and-themes/common-units/#transition)-summary-ExpandableItem | color 0.2s, background 0.2s | color 0.2s, background 0.2s |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-content-ExpandableItem | *none* | *none* |
| [wordBreak](/docs/styles-and-themes/common-units/#word-break)-summary-ExpandableItem | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-content-ExpandableItem | *none* | *none* |
| [wordSpacing](/docs/styles-and-themes/common-units/#word-spacing)-summary-ExpandableItem | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-content-ExpandableItem | *none* | *none* |
| [wordWrap](/docs/styles-and-themes/common-units/#word-wrap)-summary-ExpandableItem | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-content-ExpandableItem | *none* | *none* |
| [writingMode](/docs/styles-and-themes/common-units/#writing-mode)-summary-ExpandableItem | *none* | *none* |
