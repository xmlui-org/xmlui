# Build a fullscreen modal dialog

Use `fullScreen` on `ModalDialog` for a takeover experience.

A fullscreen dialog removes distractions and gives the user maximal working space. Set `fullScreen` on `ModalDialog` to make it cover the entire viewport — ideal for multi-step flows, image previews, or complex editing forms where a small overlay would feel cramped.

```xmlui-pg copy display name="Fullscreen project details dialog" height="380px"
---app display
<App>
  <variable name="projects" value="{[
    { 
      id: 1, name: 'Website Redesign', lead: 'Sarah Chen', status: 'active', 
      description: 'Complete overhaul of the marketing website including new branding, responsive layout, and performance optimisations.' 
    },
    { 
      id: 2, name: 'Mobile App v2', lead: 'Marcus Johnson', status: 'planning', 
      description: 'Second major release of the companion mobile app with offline support and push notifications.' 
    },
    { 
      id: 3, name: 'API Migration', lead: 'Elena Rodriguez', status: 'active', 
      description: 'Migrate legacy REST endpoints to the new GraphQL gateway with full backward compatibility.' 
    }
  ]}" />

  <ModalDialog 
    id="detailsDialog" 
    padding="$padding-loose" 
    fullScreen title="{$param.name}"
  >
    <HStack>
      <Text variant="strong">Lead:</Text>
      <Text>{$param.lead}</Text>
      <SpaceFiller />
      <Badge value="{$param.status}" />
    </HStack>
    <Text marginTop="$space-4">{$param.description}</Text>
    <SpaceFiller />
    <HStack>
      <SpaceFiller />
      <Button label="Close" onClick="detailsDialog.close()" />
    </HStack>
  </ModalDialog>

  <Text variant="strong" marginBottom="$space-2">Projects</Text>
  <Items data="{projects}">
    <Card>
      <HStack verticalAlignment="center">
        <Text variant="strong">{$item.name}</Text>
        <SpaceFiller />
        <Badge value="{$item.status}" />
        <Button label="Details" onClick="detailsDialog.open($item)" />
      </HStack>
    </Card>
  </Items>
</App>
```

## Key points

**`fullScreen` makes the dialog cover the entire viewport**: The dialog expands edge-to-edge, removing the centered floating card appearance. The title bar and close button remain visible at the top.

**Open with `open()` and pass data via `$param`**: Call `dialogId.open(data)` from a button handler. Inside the dialog, `$param` holds the first argument and `$params[index]` holds any additional arguments — no separate variable needed.

**The close button stays visible by default**: Even in fullscreen the built-in close button (✕) appears in the top-right corner. Set `closeButtonVisible="{false}"` to hide it when you provide your own close action.

**`title` accepts an expression**: Bind `title="{$param.name}"` to display context-sensitive text in the title bar. Use `titleTemplate` for a fully custom header layout.

**`padding` and other layout props can be set directly on `ModalDialog`**: Use `padding="$padding-loose"` (or any spacing token) to control the inner whitespace without wrapping children in an extra `VStack`. The dialog content area is already a vertical flex column, so direct children stack naturally.

---

## See also

- [Pass data to a Modal Dialog](/docs/howto/pass-data-to-a-modal-dialog) — send row data to a dialog with `open($item)`
- [Return data from a closed dialog](/docs/howto/use-modal-dialog-onclose) — handle `onClose` to reset state after the dialog closes
- [Open a confirmation before delete](/docs/howto/open-a-confirmation-before-delete) — show a quick confirmation dialog without a custom layout
