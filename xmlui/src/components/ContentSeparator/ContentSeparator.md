%-DESC-START

**Key features:**
- **Flexible orientation**: Create horizontal dividers (default) or vertical dividers between content
- **Customizable sizing**: Control thickness with the `thickness` property and length with the `length` property
- **Theme-driven defaults**: Uses theme variables for default sizing when props are not specified

%-DESC-END

%-PROP-START orientation

See the demo for an example under [`thickness`](#thickness).

>[!INFO]
> The component will not be displayed if the orientation is set to `vertical` but the height of the parent container is not explicitly set to a value other than 0 or percentage is used as the length unit (e.g. 20%).
> This is true even if the `ContentSeparator` has siblings in the container.
> The demo below illustrates this.
> Notice how the first `ContentSeparator` does not show up while the second does:

```xmlui-pg copy display name="Example: no vertical space"
<App>
  <HStack horizontalAlignment="center">
    <ContentSeparator 
      orientation="vertical" 
      thickness="8px" 
      backgroundColor="blue" 
    />
  </HStack>
  <HStack horizontalAlignment="center" height="48px">
    <ContentSeparator 
      orientation="vertical" 
      thickness="8px" 
      backgroundColor="red" 
    />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START thickness

```xmlui-pg copy display name="Example: thickness"
<App>
  <Heading level="h2">
    Lorem Ipsum
  </Heading>
  <ContentSeparator />
  Lorem ipsum dolor sit amet, consectetur adipiscing elit,
  sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
  ut aliquip ex ea commodo consequat.
  <ContentSeparator thickness="4px" />
  <HStack height="120px">
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
    dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
    non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    <ContentSeparator orientation="vertical" thickness="10px" />
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
    accusantium doloremque laudantium, totam rem aperiam,
    eaque ipsa quae ab illo inventore veritatis et quasi architecto
    beatae vitae dicta sunt explicabo.
  </HStack>
</App>
```


>[!INFO]
> The `thickness` property controls the height for horizontal separators and the width for vertical separators.
> The `length` property controls the width for horizontal separators and the height for vertical separators.
> When not specified, these values are taken from the theme variables `thickness-ContentSeparator` (default: 1px) and `length-ContentSeparator` (default: 100%).

%-PROP-END
