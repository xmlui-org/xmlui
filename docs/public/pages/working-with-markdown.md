# Working with Markdown

When you use XMLUI to create an application's user interface, the [Text](/components/Text) component enables you to display short-form text. But XMLUI can also support sites like this one, using the [Markdown](/components/Markdown) component for long-form text.

Native XMLUI components and corresponding Markdown elements share common theme variables. Consider this XMLUI `Table` that's styled according to the current theme.

```xmlui-pg display
<App>
  <Table width="30%" data="{
    [{
      apples: 3,
      pears: 7,
      oranges: 11
    }]
  }"
  >
  <Column bindTo="apples"/>
  <Column bindTo="pears"/>
  <Column bindTo="oranges"/>
  </Table>
</App>
```

Now let's create that same table using this markdown syntax.

```
| apples | oranges | pears
| ---    | ---     | ---
| 3      | 7       | 11
```

It looks the same.

| apples | oranges | pears
| ---    | ---     | ---
| 3      | 7       | 11

## Binding expressions

As with `Text` you can interpolate values into `Markdown` using binding expressions.

```xmlui-pg display
<App var.number="{7}" >
  <Markdown>
  The number is `{number}`
  </Markdown>
</App>
```

