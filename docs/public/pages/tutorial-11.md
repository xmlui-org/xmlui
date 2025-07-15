# Import

The `ImportProducts` component uses [FileInput](/components/FileInput) to acquire a CSV file, [Table](/components/Table) to display records as selectable rows, and [Queue](/components/Queue) to import selected rows.

## Using FileInput

To exercise XMLUI Invoice's import feature when running the demo app, you'll use `FileInput` to navigate to `products.csv` in the app's root folder.

```xmlui
<FileInput
  id="fileInput"
  acceptsFileType="{['.csv']}"
  onDidChange="{ (val) => {
      parsedCsv = window.parseCsv(val[0]).map((item, idx) => 
        { return {...item, id: idx};});
    }}"
/>
```

## Avoiding duplication

The table that displays imported products makes rows selectable, so you can import only a subset of what's in the CSV file.

It uses `rowDisabledPredicate` to disable a row if the name of any existing product matches the name of the product in the current row. The function `isDuplicate` also enables highlighting duplicate rows.

```xmlui /isDuplicate/
<Table
  id="productsFromCsv"
  data="{ parsedCsv }"
  rowsSelectable="true"
  rowDisabledPredicate="{(row) => isDuplicate(row.name)}"
>
  <Column header="Name">
<<<<<<< HEAD
    <Text color="{isDuplicate($item.name) 
        ? '$color-danger-500' : '$textColor-primary'}"
||||||| parent of 84a262f7 (fix: code example lengths)
    <Text color="{isDuplicate($item.name) ? '$color-danger-500' : '$textColor-primary'}">
=======
    <Text
      color="{isDuplicate($item.name) ? '$color-danger-500' : '$textColor-primary'}"
>>>>>>> 84a262f7 (fix: code example lengths)
    >
      {$item.name} {isDuplicate($item.name) ? '(duplicate)' : ''}
    </Text>
  </Column>
  <Column bindTo="description"/>
  <Column bindTo="price"/>
</Table>
```

We define `isDuplicate()` using a `<script>` [helper tag](/helper-tags).

```xmlui
<Component name="ImportProducts">
  <script>
    function isDuplicate(name) {
      return existingProducts.value.some(p => p.name === name);
    }
  </script>
  <!-- ... -->
</Component>
```

## Using Queue

The API doesn't support batch update so we use `Queue` to iterate over the selected rows and make an [APICall](/components/APICall) for each.

```xmlui /pluralize/
<Queue id="importQueue" clearAfterFinish="true">
  <property name="progressFeedback">
<<<<<<< HEAD
    <Text value="Importing {pluralize(importQueue.getQueuedItems().length, 
      'product', 'products')}"
    />
||||||| parent of 84a262f7 (fix: code example lengths)
    <Text value="Importing {pluralize(importQueue.getQueuedItems().length, 'product', 'products')}"/>
=======
    <Text value="Importing {
      pluralize(importQueue.getQueuedItems().length, 'product', 'products')
    }"/>
>>>>>>> 84a262f7 (fix: code example lengths)
  </property>
  <property name="resultFeedback">
    <Text value="Imported {pluralize($completedItems.length, 
      'product', 'products')}"
    />
  </property>
  <event name="process">
    <APICall
      url="/api/products"
      method="post"
      body="{$param.item}"
    />
  </event>
  <event name="complete" value="productsFromCsv.clearSelection()"/>
</Queue>
```

> [!INFO] `pluralize` is a [global helper function](/globals#pluralize).

The import button uses the queue's `enqueueItems` method to populate the queue with the result of the table's `getSelectedItems` method.

```xmlui
<Button
  label="Import"
  onClick="{ importQueue.enqueueItems(productsFromCsv.getSelectedItems())}"
  enabled="{productsFromCsv.getSelectedItems().length}"
/>
```
