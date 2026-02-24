# Refactoring XMLUI: Extract Modal Components

When working with XMLUI applications, you may find yourself with complex components that handle multiple modals and interactions. This guide demonstrates how to factor out XMLUI code into reusable user-defined components that contain modals, improving code organization and maintainability.

## The Pattern: Modal Components with Event Communication

The key pattern involves:

1. **Creating user-defined components** that encapsulate modal logic
2. **Using props** to pass data from parent to child components
3. **Using custom events** to communicate back from child to parent
4. **Conditional rendering** to control when components are displayed

## Example: Extracting a User Modal Component

### Before: Monolithic Component

```xmlui
<App var.modalOpenForUserId="{null}">
  <DataSource id="users" url="/api/users"/>

  <!-- Large table with inline modal logic -->
  <ModalDialog id="all_users" title="All users">
    <Table data="{users.value}">
      <Column bindTo="name" header="name"/>
      <Column header="Edit">
        <Button icon="pen">
          <event name="click">
            modalOpenForUserId = $item.id
          </event>
        </Button>
      </Column>
    </Table>
  </ModalDialog>

  <!-- User editing modal mixed in with main component -->
  <ModalDialog
    when="{modalOpenForUserId}"
    title="User {modalOpenForUserId}"
    onClose="{modalOpenForUserId = null}"
  >
    <DataSource id="user" url="/api/users/{modalOpenForUserId}"/>
    {JSON.stringify(user.value)}
  </ModalDialog>

  <Button onClick="{all_users.open()}" label="Show all users" />
</App>
```

### After: Refactored with Component Extraction

**Main.xmlui** (Parent Component):

```xmlui
<App var.modalOpenForUserId="{null}">
  <DataSource id="users" url="/api/users"/>

  <ModalDialog id="all_users" title="All users">
    <Table data="{users.value}">
      <Column bindTo="name" header="name"/>
      <Column header="Edit">
        <Button icon="pen">
          <event name="click">
            modalOpenForUserId = $item.id
          </event>
        </Button>
      </Column>
    </Table>
  </ModalDialog>

  <Button onClick="{all_users.open()}" label="Show all users" />

  <!-- Clean separation: User component handles its own modal -->
  <User
    when="{modalOpenForUserId}"
    userId="{modalOpenForUserId}"
    onClose="{modalOpenForUserId=null}"
  />
</App>
```

**components/User.xmlui** (Extracted Component):

```xmlui
<Component name="User">
  <DataSource id="user" url="/api/users/{$props.userId}"/>

  <ModalDialog
    when="{user.loaded}"
    title="User {$props.userId}"
    onClose="{emitEvent('close')}"
  >
    {JSON.stringify(user.value)}
  </ModalDialog>
</Component>
```

## Key Concepts Explained

### 1. Props for Data Flow (Parent → Child)

```xmlui
<!-- Parent passes data via attributes -->
<User userId="{selectedUserId}" userRole="{currentRole}" />
```

```xmlui
<!-- Child accesses via $props -->
<Component name="User">
  <DataSource id="user" url="/api/users/{$props.userId}"/>
  <Text>Role: {$props.userRole}</Text>
</Component>
```

### 2. Custom Events for Communication (Child → Parent)

```xmlui
<!-- Parent listens for custom events -->
<User onClose="{modalOpenForUserId=null}" onSave="{refreshUserList()}" />
```

```xmlui
<!-- Child emits custom events -->
<Component name="User">
  <Button onClick="{emitEvent('save')}" label="Save" />
  <Button onClick="{emitEvent('close')}" label="Cancel" />
</Component>
```

**Important**: Event handlers like `onClose` are **not callback props**. They are event listeners that respond to custom events emitted by the child component using `emitEvent()`.

### 3. Conditional Rendering

```xmlui
<!-- Only render when needed -->
<User when="{modalOpenForUserId}" userId="{modalOpenForUserId}" />
```

```xmlui
<!-- Wait for data before showing modal -->
<ModalDialog when="{user.loaded}" title="User Details">
  <!-- Modal content -->
</ModalDialog>
```

## Advanced Example: Edit/Add Modal Component

This pattern works well for components that handle both adding and editing:

**ProductModal.xmlui**:

```xmlui
<Component name="ProductModal">
  <!-- Fetch complete product data when editing -->
  <DataSource
    id="productDetails"
    url="/api/products/{$props.productId}"
    when="{$props.mode === 'edit' && $props.productId}"
  />

  <ModalDialog
    title="{$props.mode === 'edit' ? 'Edit Product' : 'Add Product'}"
    when="{$props.mode === 'add' || productDetails.loaded}"
    onClose="{emitEvent('close')}"
  >
    <Form
      data="{$props.mode === 'edit' ? productDetails.value : $props.initialData}"
      submitUrl="{$props.mode === 'edit' ? '/api/products/' + $props.productId : '/api/products'}"
      submitMethod="{$props.mode === 'edit' ? 'put' : 'post'}"
      onSuccess="{emitEvent('saved', $result)}"
    >
      <FormItem bindTo="name" label="Product Name" required="true" />
      <FormItem bindTo="price" label="Price" type="number" required="true" />
      <FormItem bindTo="description" label="Description" type="textarea" />
      <FormItem bindTo="category" label="Category" />
      <FormItem bindTo="inStock" label="In Stock" type="checkbox" />
    </Form>
  </ModalDialog>
</Component>
```

**Usage**:

```xmlui
<!-- Add mode -->
<ProductModal
  when="{showAddModal}"
  mode="add"
  initialData="{{}}"
  onClose="{showAddModal=false}"
  onSaved="{handleProductSaved}"
/>

<!-- Edit mode - pass only the product ID, let the modal fetch complete data -->
<ProductModal
  when="{editingProductId}"
  mode="edit"
  productId="{editingProductId}"
  onClose="{editingProductId=null}"
  onSaved="{handleProductSaved}"
/>
```

**Parent component example**:

```xmlui
<App var.editingProductId="{null}" var.showAddModal="{false}">
  <!-- Minimal product listing - only shows essential fields -->
  <DataSource id="products" url="/api/products" />

  <Table data="{products.value}">
    <Column bindTo="name" header="Product Name" />
    <Column bindTo="price" header="Price" />
    <Column header="Actions">
      <Button
        label="Edit"
        onClick="{editingProductId = $item.id}"
      />
    </Column>
  </Table>

  <Button
    label="Add Product"
    onClick="{showAddModal = true}"
  />

  <!-- Modal components handle their own data fetching -->
  <ProductModal
    when="{showAddModal}"
    mode="add"
    initialData="{{}}"
    onClose="{showAddModal=false}"
    onSaved="{products.refresh()}"
  />

  <ProductModal
    when="{editingProductId}"
    mode="edit"
    productId="{editingProductId}"
    onClose="{editingProductId=null}"
    onSaved="{products.refresh()}"
  />
</App>
```

## Benefits of This Pattern

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Modal components can be used in multiple places
3. **Maintainability**: Easier to modify and test individual components
4. **Readability**: Parent component focuses on coordination, not implementation details
5. **Data Flow Clarity**: Props flow down, events flow up

## When to Extract Modal Components

Consider extracting when:

- Modal logic becomes complex (validation, multiple steps, etc.)
- The same modal is used in multiple places
- Parent component becomes difficult to read
- Modal needs its own state management
- You want to unit test modal behavior separately

## Common Pitfalls

1. **Don't forget `when` conditions**: Always use conditional rendering to avoid unnecessary data fetching
2. **Remember `emitEvent()` for communication**: Child components cannot directly modify parent variables
3. **Use `$props` prefix**: Access passed data with `$props.propertyName`
4. **Handle loading states**: Wait for data to load before showing modals (`when="{data.loaded}"`)

This refactoring pattern helps create maintainable, reusable XMLUI applications with clear data flow and component boundaries.
