# Reactive data binding

Let's load that same London tube data into a [Select](/components/Select) component.

```xmlui-pg copy display height="280px"
<App>
  <Select id="lines" initialValue="bakerloo" dropdownHeight="200px">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
      <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>
</App>
```

The `Select` uses the same API as the `List`. It contains an <a href="/components/Items">Items</a> component which is another way to loop through a sequence and embed a component that receives each item. In this case what's embedded is a selectable <a href="/components/Option">Option</a> which again receives the `$item` variable.

Nothing happens yet when you select a tube line. Let's wire up the selection to display details for the selected line in a <a href="/components/Table">Table</a>.

```xmlui-pg
---app copy display
<App>
  <Select id="lines" initialValue="bakerloo">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
        <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>

  <DataSource
    id="stations"
    url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
    resultSelector="stations"/>

  <Table data="{stations}" height="280px">
    <Column bindTo="name" />
    <Column bindTo="modes" />
  </Table>
</App>
---desc
The <a href="/components/DataSource">DataSource</a> component works like the `data` attribute we used with `List` and `Items`: it fetches from a REST endpoint. Unlike `List`,`Select`, and `Table`, `DataSource` isn't a visible component. It works behind the scenes to capture data for use by visible components.

In this case the returned data object is big and complex, and we only want to display data from the `stations` object nested within it.
The `resultSelector` property on the `DataSource` targets the nested `stations` object so we can feed just that data into the table.
```

## Reactive magic

The `Select` is wired to the `Table`. When you make a new selection, the table fills with details for the selected line. Try it!

How does this work? Note how the `Select` declares the property `id="lines"`.

```xmlui
<Select id="lines" initialValue="bakerloo" width="30%">
```

That makes `lines` a variable accessible other XMLUI components, and `lines.value` holds the value of the current selection.

Now look at the `url` property of the `DataSource`.

```xmlui !/{lines.value}/
<DataSource
  id="stations"
  url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
  resultSelector="stations"/>
```

it embeds a reference to `lines.value`. When you loaded this page, that URL fetched details for the initial value of the `Select`. Changing the selection changes `lines.value` which causes the `DataSource` to fetch a new batch of details. Likewise the `Table`'s `data` property refers to `stations`, the id of the `DataSource`.

```xmlui
<Table data="{stations}">
```

So when the `DataSource` fetches fresh data, the `Table` notices the change and refills with that fresh data.

There's a name for this pattern: reactive data binding. It's what spreadsheets do when a change in one cell propagates to others that refer to it. And it's what the popular framework React enables for web apps. React, as you may know, is a complex beast that only expert programmers can tame. Fortunately the expert programmers who build XMLUI have done that for you. When you build apps declaratively with XMLUI you enjoy the benefit of reactive data binding without the burden of React's complexity. You don't need to write code to make this magic happen, it's automatic!

So far we've seen examples of built-in XMLUI components. But it's easy to make your own too, in the next chapter we'll see how.
