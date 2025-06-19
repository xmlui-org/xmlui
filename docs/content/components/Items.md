# Items [#items]

`Items` renders data arrays without built-in layout or styling, providing a lightweight alternative to `List`. Unlike `List`, it provides no virtualization, grouping, or visual formatting — just pure data iteration.

**Key features:**
- **Simple iteration**: Maps data arrays to components using `$item`, `$itemIndex`, `$isFirst`, and `$isLast` context
- **Layout agnostic**: No built-in styling or container—children determine the visual presentation
- **Reverse ordering**: Optional `reverse` property to display data in opposite order
- **Performance**: Lightweight alternative to `List` when you don't need virtualization or grouping

**Context variables:**
- `$item`: Current data item being rendered
- `$itemIndex`: Zero-based index of current item
- `$isFirst`: Boolean indicating if this is the first item
- `$isLast`: Boolean indicating if this is the last item

**Items vs List:**
Use `Items` for simple data mapping without layout requirements. Use `List` when you need virtualization (performance with large datasets), grouping, sorting, pagination, or built-in visual formatting.

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
