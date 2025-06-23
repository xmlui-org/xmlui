# Items [#items]

`Items` renders data arrays without built-in layout or styling, providing a lightweight alternative to `List`. Unlike `List`, it provides no virtualization, grouping, or visual formatting — just pure data iteration.

**Key features:**
- **Simple iteration**: Maps data arrays to components using `$item`, `$itemIndex`, `$isFirst`, and `$isLast` context
- **Layout agnostic**: No built-in styling or container—children determine the visual presentation
- **Reverse ordering**: Optional `reverse` property to display data in opposite order
- **Performance**: Lightweight alternative to `List` when you don't need virtualization or grouping

# Items [#component-items]

The `Items` component maps sequential data items into component instances, representing each data item as a particular component.

The component provides context values with which you can access some internal properties:

- `$isFirst`: This boolean value indicates if the component renders its first item.
- `$isLast`: This boolean value indicates if the component renders its last item.
- `$item`: This value represents the current iteration item while the component renders its children.
- `$itemIndex`: This integer value represents the current iteration index (zero-based) while rendering children.

>[!INFO]
> `Items` is not a container! It does not wrap its items into a container; it merely renders its children.

The `Items` component does not use virtualization; it maps each data item into a component.
Thus, passing many items to a component instance will use many resources and slow down your app.
If you plan to work with many items (more than a few dozen), use the [`List`](./List) and [`Table`](./Table) components instead.

### Inline Data [#inline-data]

You can set the list of data to be rendered via the `data` property, as the following sample shows.
The nested child component describes a template to display each data entry in `Items`.
In the template, you can refer to a particular entry with the [`$item`](#&item) identifier:

```xmlui-pg copy {8} display name="Example: inline data"
<App>
  <VStack>
    <Items data="{[
      { idx: 1, value: 'One lion' },
      { idx: 2, value: 'Two monkeys' },
      { idx: 3, value: 'Three rabbits' },
    ]}">
      <Text>{$item.idx} - {$item.value}</Text>
    </Items>
  </VStack>
</App>
```

### Data Binding [#data-binding]

You can use also API bindings to display data:

```xmlui-pg copy {4-6} display name="Example: data binding"
<App>
  <VStack>
    <Items>
      <property name="data">
        <DataSource url="https://api.spacexdata.com/v3/rockets"/>
      </property>
      <Image height="80px" width="110px" fit="cover" src="{$item.flickr_images[0]}"/>
    </Items>
  </VStack>
</App>
```

## Use children as Content Template [#use-children-as-content-template]

The [itemTemplate](#itemtemplate) property can be replaced by setting the item template component directly as the Items's child.
In the following example, the two Items are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <Items>
    <property name="itemTemplate">
      <Text>Template</Text>
    </property>
  </Items>
  <!-- As this -->
  <Items>
    <Text>Template</Text>
  </Items>
</App>
```

**Context variables available during execution:**

- `$isFirst`: Boolean indicating if this is the first item
- `$isLast`: Boolean indicating if this is the last item
- `$item`: Current data item being rendered
- `$itemIndex`: Zero-based index of current item

## Use children as Content Template [#use-children-as-content-template]

The [itemTemplate](#itemtemplate) property can be replaced by setting the item template component directly as the Items's child.
In the following example, the two Items are functionally the same:

```xmlui copy
<App>
  <!-- This is the same -->
  <Items>
    <property name="itemTemplate">
      <Text>Template</Text>
    </property>
  </Items>
  <!-- As this -->
  <Items>
    <Text>Template</Text>
  </Items>
</App>
```

## Properties [#properties]

### `data` [#data]

This property contains the list of data items (obtained from a data source) this component renders.

### `itemTemplate` [#itemtemplate]

The component template to display a single item

### `reverse (default: false)` [#reverse-default-false]

This property reverses the order in which data is mapped to template components.

```xmlui-pg copy {4} display name="Example: reverse"
<App>
  <VStack>
    <Items
      reverse="true"
      data="{[
        { idx: 1, value: 'One lion' },
        { idx: 2, value: 'Two monkeys' },
        { idx: 3, value: 'Three rabbits' },
      ]}">
      <Text>{$item.idx} - {$item.value}</Text>
    </Items>
  </VStack>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The `Items` component does not support styling.
You should style the container component that wraps `Items`.
You can also style the individual items via specifying a template component.
