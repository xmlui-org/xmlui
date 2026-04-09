# Use the same ModalDialog to add or edit

Drive a single dialog and form into either "add" or "edit" mode based on whether data was passed to `open()`.

Maintaining two separate dialogs for create and update leads to duplicated markup that drifts out of sync. Instead, wrap the `ModalDialog` and `Form` in a user-defined component, expose a custom `open(data?)` method, and let the presence or absence of `data` determine which mode the form operates in. Everything else — the URL, HTTP method, title, and pre-filled values — adapts automatically through conditional expressions.

```xmlui-pg copy height="440px" name="Use the same ModalDialog to add or edit"
---app display {35-48}
<App var.editingProductId="{null}" var.showAddModal="{false}">
  <DataSource id="products" url="/api/products" />

  <ProductModal id="productDetails" />

  <HStack alignItems="center">
    <H2>Product Inventory</H2>
    <SpaceFiller />
    <Button
      label="Add New Product"
      size="sm"
      onClick="productDetails.open()"
    />
  </HStack>

  <Table data="{products}">
    <Column bindTo="name" />
    <Column bindTo="price" width="100px" />
    <Column header="Actions" width="180px" >
      <HStack>
        <Button 
          label="Edit" 
          icon="pencil"
          size="sm" 
          variant="outlined"
          onClick="productDetails.open($item)"
        />
        <Button label="Delete" icon="trash" size="sm" variant="outlined"
          themeColor="attention">
          <event name="click">
            <APICall
              method="delete"
              url="/api/products/{$item.id}"
              confirmMessage="Are you sure you want to delete '{$item.name}'?" />
          </event>
        </Button>
      </HStack>
    </Column>
  </Table>

</App>
---comp display
<Component name="ProductModal"
  var.editItem="{null}"
  method.open="(data) => { editItem = data; detailsDialog.open() }">

  <ModalDialog
    id="detailsDialog"
    title="{editItem ? 'Edit Product' : 'Add Product'}"
    onClose="emitEvent('close')"
  >
    <Form
      data="{editItem}"
      submitUrl="{editItem 
        ? '/api/products/' + editItem.id 
        : '/api/products'}"
      submitMethod="{editItem ? 'put' : 'post'}"
      onSuccess="emitEvent('saved')"
    >
      <TextBox bindTo="name" label="Product Name" required="true" />
      <NumberBox bindTo="price" label="Price" required="true" />
    </Form>
  </ModalDialog>
</Component>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.products = [
    { id: 1, name: 'Laptop Pro', price: 1299 },
    { id: 2, name: 'Wireless Mouse', price: 29 }
  ]",
  "operations": {
    "get-products": {
      "url": "/products",
      "method": "get",
      "handler": "$state.products"
    },
    "get-product": {
      "url": "/products/:id",
      "method": "get",
      "pathParamTypes": {
        "id": "integer"
      },
      "handler": "return $state.products.find(p => p.id === $pathParams.id)"
    },
    "insert-product": {
      "url": "/products",
      "method": "post",
      "handler": "
        const newId = $state.products.length > 0 ? Math.max(...$state.products.map(p => p.id)) + 1 : 1;
        $state.products.push({
          id: newId,
          name: $requestBody.name,
          price: Number($requestBody.price)
        });
      "
    },
    "update-product": {
      "url": "/products/:id",
      "method": "put",
      "pathParamTypes": {
        "id": "integer"
      },
      "handler": "
        const oldItem = $state.products.find(p => p.id === $pathParams.id);
        if (oldItem) {
          oldItem.name = $requestBody.name;
          oldItem.price = Number($requestBody.price);
        }
      "
    },
    "delete-product": {
      "url": "/products/:id",
      "method": "delete",
      "pathParamTypes": {
        "id": "integer"
      },
      "handler": "$state.products = $state.products.filter(p => p.id !== $pathParams.id)"
    }
  }
}
```

## Key points

**`method.open` defines a custom API method on a user-defined component**: Declaring `method.open="(data) => { editItem = data; detailsDialog.open() }"` on the `<Component>` tag exposes an `open()` method on the component's `id`. Callers invoke it with `productDetails.open()` (add) or `productDetails.open($item)` (edit) without knowing the internal implementation.

**`null` vs object distinguishes add from edit mode**: Calling `open()` with no argument sets `editItem` to `undefined`/`null`; passing a row object sets it to that row. Every conditional expression in the dialog — title, `submitUrl`, `submitMethod` — branches on `editItem ? ... : ...`.

**`Form data="{editItem}"` pre-fills fields for edit and leaves them empty for add**: When `editItem` is an object, `Form` populates each `bindTo` field from the matching property. When `editItem` is `null`, the form starts blank. No separate initialization logic is needed.

**`submitUrl` and `submitMethod` adapt via expressions**: Use `submitUrl="{editItem ? '/api/products/' + editItem.id : '/api/products'}"` and `submitMethod="{editItem ? 'put' : 'post'}"` so the same `Form` issues the right request for both operations.

**Wrapping in a component keeps the call site clean**: The parent `App` just renders `<ProductModal id="productDetails" />` and calls `productDetails.open()` or `productDetails.open($item)`. All the mode-switching complexity lives inside the component, and the parent never touches `editItem` directly.

---

## See also

- [Pass data to a Modal Dialog](/docs/howto/pass-data-to-a-modal-dialog) — open a dialog pre-populated with a specific row's data using `open($item)`
- [Emit a custom event from a component](/docs/howto/emit-a-custom-event-from-a-component) — fire `onSaved` or `onClose` from inside a user-defined component
- [Prefill a form from an API response](/docs/howto/prefill-a-form-from-an-api-response) — load server data into a Form using the `data` prop
