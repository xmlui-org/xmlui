%-DESC-START

**Key features:**
- **Semantic levels**: Choose from h1 through h6 for proper document structure and accessibility
- **Text overflow control**: Automatic ellipses and line limiting for long headings
- **Anchor generation**: Optional hover anchors for deep linking to specific sections

For the shorthand versions see: [H1](./H1), [H2](./H2), [H3](./H3), [H4](./H4), [H5](./H5), [H6](./H6).

```xmlui-pg copy display name="Example: Headings with levels"
<App>
  <Heading level="h1" value="Heading Level 1" />
  <Text>Text following H1</Text>
  <Heading level="h2" value="Heading Level 2" />
  <Text>Text following H2</Text>
  <Heading level="h3" value="Heading Level 3" />
  <Text>Text following H3</Text>
  <Heading level="h4" value="Heading Level 4" />
  <Text>Text following H4</Text>
  <Heading level="h5" value="Heading Level 5" />
  <Text>Text following H5</Text>
  <Heading level="h6" value="Heading Level 6" />
  <Text>Text following H6</Text>
</App>
```

%-DESC-END

%-PROP-START value

```xmlui-pg copy display name="Example: value"
<App>
  <Heading value="This is level 3 (value)" level="h3" />
  <Heading level="h3">This is level 3 (child)</Heading>
  <Heading value="Value" level="h3"><Icon name="trash" /></Heading>
</App>
```

%-PROP-END

%-PROP-START level

| Value | Description                                           |
| :---- | :---------------------------------------------------- |
| `h1`  | **(default)** Equivalent to the `<h1 />` HTML element |
| `h2`  | Equivalent to the `<h2 />` HTML element               |
| `h3`  | Equivalent to the `<h3 />` HTML element               |
| `h4`  | Equivalent to the `<h4 />` HTML element               |
| `h5`  | Equivalent to the `<h5 />` HTML element               |
| `h6`  | Equivalent to the `<h6 />` HTML element               |

For a visual example, see the component description.

%-PROP-END

%-PROP-START maxLines

```xmlui-pg copy display name="Example: maxLines"
<App>
  <H2
    maxWidth="160px"
    backgroundColor="cyan"
    value="A long heading text that will likely overflow" maxLines="2" />
</App>
```

%-PROP-END

%-PROP-START preserveLinebreaks

```xmlui-pg copy display name="Example: preserveLinebreaks"
---app copy display {5}
<App>
  <HStack>
    <H3
      width="200px"
      backgroundColor="cyan"
      preserveLinebreaks="true"
      value="(preserve) This long text
  with several line breaks
          does not fit into a viewport with a 200-pixel width." />
    <H3
      width="200px"
      backgroundColor="cyan"
      value="(do not preserve) This long text
  with several line breaks
          does not fit into a viewport with a 200-pixel width." />
  </HStack>
</App>
---desc
You can observe the effect of using `preserveLinebreaks`:
```

>[!INFO]
> Remember to use the `value` property of `Heading`.
> Linebreaks are converted to spaces when nesting the text in the `Heading` component.

%-PROP-END

%-PROP-START ellipses

```xmlui-pg copy {4} display name="Example: ellipses"
<App>
  <VStack width="200px">
    <H3
      backgroundColor="cyan"
      maxLines="1"
      ellipses="false">
      Though this long text does is about to crop!
    </H3>
    <H3
      backgroundColor="cyan"
      maxLines="1">
      Though this long text does is about to crop!
    </H3>
  </VStack>
</App>
```

%-PROP-END

%-PROP-START showAnchor

If this property is not set, the engine checks if `showHeadingAnchors` flag is turned on in the global configuration (in the `appGlobals` configuration object) and displays the heading anchor accordingly.

%-PROP-END