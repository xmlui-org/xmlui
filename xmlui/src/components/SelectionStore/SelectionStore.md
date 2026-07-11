%-DESC-START

For an example that covers all props, and API methods and values, see the [\`Selection-Aware Components\`](#selection-aware-components) section.

## Using `SelectionStore`

A `SelectionStore` instance is a mediator between a component that can manage a list of selected items and the external context.
The wrapped component can report its selection state (which items are currently selected);
so that the external context can access and manage the selection state through the component's API.

## Selection-Aware Components

Some components know they are wrapped with a `SelectionStore` and manage their current selection state through it.
For example, the following sample `SelectionStore` wraps a `Table` with its `rowsSelectable` property set to true.
Whenever the user changes the selection state of a particular row, the `SelectionStore` updates its state accordingly.

```xmlui-pg 
---app copy display name="Example: using SelectionStore"
<App>
  <H3>Rockets {rockets.value.length ? "(" + rockets.value.length + " selected)" : ""}</H3>
  <HStack>
    <Button label="Select First" 
      onClick="if (rockets.value?.length) rockets.setSelectedRowIds([rockets.value[0].id])" />
    <Button label="Refresh Table" onClick="rockets.refreshSelection()" />
    <Button label="Clear Selection" onClick="rockets.clearSelection()" />
  </HStack>
  <SelectionStore id="rockets">
    <Table
      width="100%"
      rowsSelectable="{true}"
      data="https://api.spacexdata.com/v3/rockets"
      height="300px">
      <Column header="Image" size="80px">
        <Image height="80px" fit="cover" src="{$item.flickr_images[0]}"/>
      </Column>
      <Column canSort="true" bindTo="country"/>
      <Column canSort="true" bindTo="company"/>
    </Table>
  </SelectionStore>
</App>
---desc
The UI refreshes the number of selected items as you check or uncheck the rows in the following table:
```

%-DESC-END
