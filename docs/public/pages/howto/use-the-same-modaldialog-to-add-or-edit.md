# Use the same ModalDialog to add or edit

See also the [refactoring](/refactoring) guide. Briefly: props flow down, events flow up.

```xmlui-pg noHeader height="400px"
---app
<App>
  <Test />
</App>
---comp display
<Component name="Test" var.editingProductId="{null}" var.showAddModal="{false}">
  <DataSource id="products" url="/api/products" />

  <HStack alignItems="center">
    <Text variant="strong" fontSize="$fontSize-2xl">Product Inventory</Text>
    <SpaceFiller />
    <Button
      label="Add New Product"
      size="sm"
      onClick="showAddModal = true"
    />
  </HStack>

  <Table data="{products}">
    <Column bindTo="name" />
    <Column bindTo="price" width="120px"/>
    <Column header="Actions" width="240px">
      <HStack>
        <Button label="Edit" icon="pencil" size="sm" variant="outlined"
          onClick="editingProductId = $item.id"
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

  <ProductModal
    when="{showAddModal}"
    mode="add"
    onClose="showAddModal = false"
    onSaved="products.refetch()"
  />

  <ProductModal
    when="{editingProductId}"
    mode="edit"
    productId="{editingProductId}"
    onClose="editingProductId = null"
    onSaved="products.refetch()"
  />
</Component>
---comp display
<Component name="ProductModal">
  <DataSource
    id="productDetails"
    url="/api/products/{$props.productId}"
    when="{$props.mode === 'edit' && $props.productId}"
  />

  <ModalDialog
    title="{$props.mode === 'edit' ? 'Edit Product' : 'Add Product'}"
    when="{$props.mode === 'add' || productDetails.loaded}"
    onClose="emitEvent('close')"
  >
    <Form
      data="{$props.mode === 'edit' ? productDetails.value : {}}"
      submitUrl="{$props.mode === 'edit' ? '/api/products/' + $props.productId : '/api/products'}"
      submitMethod="{$props.mode === 'edit' ? 'put' : 'post'}"
      onSuccess="emitEvent('saved')"
    >
      <FormItem bindTo="name" label="Product Name" required="true" />
      <FormItem bindTo="price" label="Price" type="number" required="true" />
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
