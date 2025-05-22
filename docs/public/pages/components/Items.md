# Items [#items]

The `Items` component maps sequential data items into component instances, representing each data item as a particular component.

The component provides context values with which you can access some internal properties:

- `$isFirst`: This boolean value indicates if the component renders its first item.
- `$isLast`: This boolean value indicates if the component renders its last item.
- `$item`: This value represents the current iteration item while the component renders its children.
- `$itemIndex`: This integer value represents the current iteration index (zero-based) while rendering children.

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

### `reverse` [#reverse]

This property reverses the order in which data is mapped to template components.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
