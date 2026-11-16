# Items [#items]

`Items` renders data arrays without built-in layout or styling, providing a lightweight alternative to `List`. Unlike `List`, it provides no virtualization, grouping, or visual formatting — just pure data iteration.

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

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `data` [#data]

This property contains the list of data items (obtained from a data source) this component renders.

### `itemTemplate` [#itemtemplate]

The component template to display a single item

### `reverse` [#reverse]

> [!DEF]  default: **false**

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

### `textSelectionDidChange` [#textselectiondidchange]

This event fires when the user selects text across the rendered items: after a mouse drag ends, or per step of a keyboard selection. It doesn't fire again for an unchanged selection, and fires once with `null` items when the selection leaves this component. Defining it wraps each item in a `display: contents` element, so CSS aimed at the parent's direct children (`> *`, `:first-child`) matches those wrappers.

**Signature**: `textSelectionDidChange(selection: { text: string, startItem: any, endItem: any, startIndex: number | null, endIndex: number | null }): void`

- `selection`: `startItem` and `endItem` are the items holding the two ends of the selection, in document order whichever way it was made; `startIndex` and `endIndex` are their `$itemIndex` values; `text` is the selected text. The items and indices are `null` when the selection isn't wholly inside this component. A plain click reports a collapsed selection: `text` is empty and `startIndex` equals `endIndex`.

Drag across several words. The handler receives the items at both ends of the selection, in reading order whichever way you dragged, plus the selected text. A plain click reports a collapsed selection (`text` is empty), so the example ignores it.

```xmlui-pg copy display name="Example: textSelectionDidChange" height="160px"
<App var.picked="">
  <HStack wrapContent="true" gap="$space-1">
    <Items
      data="{['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog']}"
      onTextSelectionDidChange="(sel) => {
        if (!sel.text || sel.startIndex === null) return;
        picked = sel.startItem + ' … ' + sel.endItem + ' (' + sel.startIndex + '-' + sel.endIndex + ')';
      }">
      <Text value="{$item}" />
    </Items>
  </HStack>
  <Text value="Selected: {picked}" />
</App>
```

Defining this event (or giving `Items` an `id`) wraps each item in an element with `display: contents`, which maps the selection back to items. It doesn't affect flex or gap layout, but CSS aimed at the parent's direct children (`> *`, `:first-child`) matches those wrappers.

## Exposed Methods [#exposed-methods]

### `getTextSelection` [#gettextselection]

This method returns the current text selection in the same shape the `textSelectionDidChange` event passes. Giving the component an `id` makes it callable and wraps each item as described for that event.

**Signature**: `getTextSelection(): { text: string, startItem: any, endItem: any, startIndex: number | null, endIndex: number | null }`

```xmlui-pg copy display name="Example: getTextSelection" height="160px"
<App var.report="">
  <HStack wrapContent="true" gap="$space-1">
    <Items id="words" data="{['Select', 'some', 'of', 'these', 'words']}">
      <Text value="{$item}" />
    </Items>
  </HStack>
  <Button label="What is selected?" onClick="const s = words.getTextSelection(); report = s.startIndex === null ? 'nothing here' : s.startItem + ' … ' + s.endItem" />
  <Text value="{report}" />
</App>
```

## Styling [#styling]

The `Items` component does not support styling.
You should style the container component that wraps `Items`.
You can also style the individual items via specifying a template component.
