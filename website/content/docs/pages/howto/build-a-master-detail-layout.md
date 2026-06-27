# Build a master–detail layout

Click a table row to display its full details in an adjacent panel, keeping the list and the detail view visible side by side.

Use `rowsSelectable` with `enableMultiRowSelection="{false}"` so clicking a row selects it exclusively. Listen to `onSelectionDidChange` to capture the selected item and store it in a variable. An adjacent `Card` or panel reads that variable and renders the detail view. Wrap both in an `HSplitter` to let the user resize the list and detail areas.

```xmlui-pg copy display name="Master–detail with selectable rows" height="400px"
---app display /selectedProject/
<App scrollWholePage="false"
  var.selectedProject="">
  <HSplitter 
    initialPrimarySize="50%" 
    minPrimarySize="240px"
    maxPrimarySize="-200px"
  >
    <Table
      id="projectTable"
      rowsSelectable
      enableMultiRowSelection="{false}"
      hideSelectionCheckboxes
      data="{[
        { 
          id: 1, name: 'Landing Page Redesign', status: 'In Progress', 
          owner: 'Alice Johnson', budget: 12000, startDate: '2026-01-15', 
          description: 'Redesign the company landing page with a modern look, improved mobile responsiveness, and faster load times.' 
        },
        { 
          id: 2, name: 'API Documentation', status: 'Done', 
          owner: 'Bob Martinez', budget: 5000, startDate: '2025-11-01', 
          description: 'Write comprehensive API reference docs covering all endpoints, authentication, error codes, and rate limits.' 
        },
        { 
          id: 3, name: 'Mobile App Prototype', status: 'To Do', 
          owner: 'Carol Chen', budget: 25000, startDate: '2026-04-01', 
          description: 'Build a clickable prototype for the iOS and Android app covering onboarding, dashboard, and settings flows.' 
        },
        { 
          id: 4, name: 'Database Migration', status: 'In Progress', 
          owner: 'David Kim', budget: 18000, startDate: '2026-02-10', 
          description: 'Migrate the production database from PostgreSQL 12 to 16 with zero downtime, including schema updates and index optimization.' 
        }
      ]}"
      onSelectionDidChange="(items) => selectedProject = items.length > 0 
        ? items[0] : null;"
    >
      <Column bindTo="name" header="Project" />
      <Column bindTo="status" header="Status">
        <Badge value="{$cell}" />
      </Column>
      <Column bindTo="owner" header="Owner" />
    </Table>

    <VStack padding="$space-4" gap="$space-3">
      <Fragment when="{selectedProject}">
        <Text variant="h5">{selectedProject.name}</Text>
        <HStack gap="$space-4">
          <VStack gap="$space-1">
            <Text variant="caption">Owner</Text>
            <Text>{selectedProject.owner}</Text>
          </VStack>
          <VStack gap="$space-1">
            <Text variant="caption">Budget</Text>
            <Text>${selectedProject.budget.toLocaleString()}</Text>
          </VStack>
          <VStack gap="$space-1">
            <Text variant="caption">Start Date</Text>
            <Text>{selectedProject.startDate}</Text>
          </VStack>
        </HStack>
        <VStack gap="$space-1">
          <Text variant="caption">Description</Text>
          <Text>{selectedProject.description}</Text>
        </VStack>
      </Fragment>
      <Text 
        when="{!selectedProject}" 
        variant="secondary">
        Click a row to see project details
      </Text>
    </VStack>
  </HSplitter>
</App>
```

## Key points

**`enableMultiRowSelection="{false}"` restricts to single selection**: Only one row can be selected at a time. Clicking a new row automatically deselects the previous one, which is exactly the behaviour a master–detail view needs.

**`hideSelectionCheckboxes` removes visual clutter**: The selection still works — clicking anywhere on a row selects it — but no checkbox column is shown. This gives the table a cleaner look in a master–detail context.

**`onSelectionDidChange` provides the selected item array**: In single-selection mode the array contains zero or one item. Store `items[0]` (or `null` when empty) in a variable and bind the detail panel to it.

**Use `HSplitter` to make the panels resizable**: Wrapping the table and detail panel in an `HSplitter` lets users drag the divider to give more space to whichever side they need. Set `minPrimarySize` to prevent the table from collapsing too small (e.g. `minPrimarySize="240px"`), and use a negative `maxPrimarySize` to reserve space for the detail panel (e.g. `maxPrimarySize="-200px"` ensures the detail side always keeps 200px).

**`scrollWholePage="false"` is required for height-filling layouts**: Without it the `HSplitter` has no bounded height to fill and collapses. The app content area becomes the scroll container instead.

---

## See also

- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — select multiple rows for bulk actions instead of detail viewing
- [Create a resizable split view](/docs/howto/create-a-resizable-split-view) — more on HSplitter sizing and constraints
- [Add row actions with a context menu](/docs/howto/add-row-actions-with-a-context-menu) — offer per-row actions via right-click instead of a detail panel
