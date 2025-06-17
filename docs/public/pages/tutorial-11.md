# Import

The `ImportProducts` component uses [DataSource](/components/DataSource) with `dataType="csv"` to source data from a CSV file.


```xmlui /dataType="csv/
<DataSource
  id="csv"
  dataType="csv"
  url="{filename}"
  transformResult="{(data) => data.map((row, index) => ({...row, id: `${index}`}))}"
/>
```

We also need to know what products we already have, in order to avoid duplication.

```xmlui
<DataSource
  id="existingProducts"
  url="/api/products"
  method="GET"
/>
```

## Using FileInput

To exercise XMLUI Invoice's import feature when running the demo app, you'll use [FileInput](/components/FileInput) to navigate to `products.csv` in the app's root folder.

```xmlui
<FileInput
  id="fileInput"
  acceptsFileType="{['.csv']}"
  onDidChange="{ (val) => {
    filename = val[0]?.name;
    productsFromCsv.clearSelection();
  }}"
/>
```

## Avoiding duplication

The table that displays imported products makes rows selectable, so you can import only a subset of what's in the CSV file.

It uses `rowDisabledPredicate` to disable a row if the name of any existing product matches the name of the product in the current row. The function `isDuplicate` also enables highlighting duplicate rows.


```xmlui /isDuplicate/
<Table
  id="productsFromCsv"
  data="{ csv }"
  rowsSelectable="true"
  rowDisabledPredicate="{(row) => isDuplicate(row.name)}"
  onSelectionDidChange="(selection) => {
    selectedProducts = selection;
  }"
>
  <Column header="Name">
    <Text color="{isDuplicate($item.name) ? '$color-danger-500' : '$textColor-primary'}">
      {$item.name} {isDuplicate($item.name) ? '(duplicate)' : ''}
    </Text>
  </Column>
  <Column bindTo="description" />
  <Column bindTo="price" />
</Table>
```

## Using code-behind

That function, along with others, is defined in `ImportProducts.xmlui.xs`.

```js /isDuplicate(name)/ /startImport(products)/ /importNextProduct()/ /processNextProduct()/
function isDuplicate(name) {
    return existingProducts && existingProducts.value && existingProducts.value.some(p => p.name === name);
}

function startImport(products) {
    console.log('startImport', products);
    // Process first item directly with the known products array
    if (products.length > 0) {
        const product = products[0];

        productToImport = JSON.stringify({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price) || 0
        });

        // Set queue to remaining items
        importQueue = products.slice(1);
    }
}

function importNextProduct() {
    console.log('importNextProduct', importQueue.length);
    if (importQueue && importQueue.length > 0) {
        const product = importQueue[0];

        productToImport = JSON.stringify({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price) || 0
        });

        importQueue = importQueue.slice(1);
    }
}

function processNextProduct() {
    console.log('processNextProduct', importQueue.length);
    if (importQueue && importQueue.length > 0) {
        delay(200, () => importNextProduct());
    } else {
        // Import completed, navigate to products page
        delay(500, () => navigate('/products'));
    }
}
```

We use a code-behind file so these functions live in the same namespace as the component and can work with its declared variables.

```xmlui
<Component
  name="ImportProducts"
  var.filename=""
  var.selectedProducts=""
  var.productToImport=""
  var.importQueue=""
>
```

The functions work with `APICall` and `ChangeListener`.

```xmlui
    <APICall
      id="importProduct"
      url="/api/products"
      method="POST"
      onSuccess="{processNextProduct()}"
      onError="(error) => console.error('Import error:', error)"
      rawBody="{productToImport}"
    />

    <ChangeListener
      listenTo="{productToImport}"
      onDidChange="{() => {
        importProduct.execute();
      }}"
    />
```

## Data flow

- **CSV Upload**: `FileInput` sets filename.
- **CSV Parsing**: `DataSource` with `dataType="csv"` converts file to data array.
- **Selection**: User selects rows, populating `selectedProducts` array.
- **Queue setup**: `startImport()` takes first product, sets `productToImport` (JSON string), creates `importQueue` with remaining items

## Control flow

- **Click Import**: Calls `startImport(selectedProducts)`.
- **Reactive chain**: `ChangeListener` detects `productToImport` changed, calls `importProduct.execute()`.
- **API success**: `onSuccess` triggers `processNextProduct()`.
- **Queue processing**: `processNextProduct()` moves next item from `importQueue` to `productToImport`.
- **Loop**: Repeat until queue is empty
- **Completion**: Navigate to products page

