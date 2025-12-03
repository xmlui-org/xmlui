# Set the Width of an Input Field in an HStack

When placing items, particularly input fields, in an `HStack` or a `Stack` with a horizontal layout, you need to explicitly set the `width` of each component. Otherwise, by default, the first component will take all the horizontal space available and push the rest outside the layout or to a new line, or squash them, if its width is also constrained.

Without the `width` property set:

```xmlui-pg copy display
<App>
  <HStack>
    <TextBox initialValue="First" />
    <TextBox initialValue="Second" />
  </HStack>
</App>
```

With the property set:

```xmlui-pg copy display /width="*"/
<App>
  <HStack>
    <TextBox initialValue="First" width="*" />
    <TextBox initialValue="Second" width="*" />
  </HStack>
</App>
```
