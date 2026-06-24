%-DESC-START

**Key features:**
- **Progressive disclosure**: Show/hide content on demand to reduce visual clutter
- **Flexible summary**: Use text or rich components for the summary trigger
- **Keyboard accessible**: Full keyboard navigation support with Enter/Space keys
- **Customizable icons**: Choose your own expand/collapse icons or use a switch

%-DESC-END

%-PROP-START summary

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

%-PROP-END

%-PROP-START fullWidthSummary

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

%-PROP-END

%-PROP-START contentWidth

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

%-PROP-END
