%-DESC-START

**Key features:**
- **Flexible orientation**: Create horizontal dividers (default) or vertical dividers between content
- **Customizable sizing**: Control thickness with the `size` property
- **Automatic spacing**: Takes full width/height of container unless size is specified

%-DESC-END

%-PROP-START orientation

See the demo for an example under [`size`](#size).

>[!INFO]
> The component will not be displayed if the orientation is set to `vertical` but the height of the parent container is not explicitly set to a value other than 0 or percentage is used as the size unit (e.g. 20%).
> This is true even if the `ContentSeparator` has siblings in the container.
> The demo below illustrates this.
> Notice how the first `ContentSeparator` does not show up while the second does:

```xmlui-pg copy display name="Example: no vertical space"
<App>
  <HStack horizontalAlignment="center">
    <ContentSeparator orientation="vertical" size="8px" backgroundColor="blue" />
  </HStack>
  <HStack horizontalAlignment="center" height="48px">
    <ContentSeparator orientation="vertical" size="8px" backgroundColor="red" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START size

```xmlui-pg copy display name="Example: size"
<App>
  <Heading level="h2">
    Lorem Ipsum
  </Heading>
  <ContentSeparator />
  Lorem ipsum dolor sit amet, consectetur adipiscing elit,
  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
  ut aliquip ex ea commodo consequat.
  <ContentSeparator size="4px" />
  <HStack height="120px">
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
    dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    <ContentSeparator orientation="vertical" size="10px" />
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
    accusantium doloremque laudantium, totam rem aperiam,
    eaque ipsa quae ab illo inventore veritatis et quasi architecto
    beatae vitae dicta sunt explicabo.
  </HStack>
</App>
```


>[!INFO]
> You can use the `width` and `height` layout properties to set the `ContentSeparator` dimensions.
> For the horizontal separator, you can set the `height` property; the vertical separator offers the `width` property instead of `size`.
> Nonetheless, we suggest you use the `size` property.

%-PROP-END
