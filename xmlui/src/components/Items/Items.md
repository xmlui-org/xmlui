%-DESC-START

**Key features:**
- **Simple iteration**: Maps data arrays to components using `$item`, `$itemIndex`, `$isFirst`, and `$isLast` context
- **Layout agnostic**: No built-in styling or container—children determine the visual presentation
- **Reverse ordering**: Optional `reverse` property to display data in opposite order
- **Performance**: Lightweight alternative to `List` when you don't need virtualization or grouping

>[!INFO]
> `Items` is not a container! It does not wrap its items into a container; it merely renders its children.

The `Items` component does not use virtualization; it maps each data item into a component.
Thus, passing many items to a component instance will use many resources and slow down your app.
If you plan to work with many items (more than a few dozen), use the [`List`](./List) and [`Table`](./Table) components instead.

### Inline Data

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

### Data Binding

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

%-DESC-END

%-PROP-START reverse

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

%-PROP-END

%-STYLE-START

The `Items` component does not support styling.
You should style the container component that wraps `Items`.
You can also style the individual items via specifying a template component.

%-STYLE-END
