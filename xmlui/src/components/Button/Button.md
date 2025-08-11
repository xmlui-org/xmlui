%-DESC-START

**Key features:**
- **Visual hierarchy**: Choose from `solid`, `outlined`, or `ghost` variants to indicate importance
- **Theme colors**: Use `primary`, `secondary`, or `attention` colors for different action types
- **Icon support**: Add icons before or after text, or create icon-only buttons
- **Form integration**: Automatically handles form submission when used in forms

%-DESC-END

%-PROP-START autoFocus

%-PROP-END

%-PROP-START contentPosition

```xmlui-pg copy display name="Example: content position"
<App>
  <Button width="200px" icon="drive" label="Button" contentPosition="center" />
  <Button width="200px" icon="drive" label="Button" contentPosition="start" />
  <Button width="200px" icon="drive" label="Button" contentPosition="end" />
  <Button width="200px" contentPosition="end">
    This is a nested text
  </Button>
</App>
```

%-PROP-END

%-PROP-START icon

```xmlui-pg copy display name="Example: icon"
<App>
  <HStack>
    <Button icon="drive" label="Let there be drive" />
    <Button icon="drive" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START iconPosition

```xmlui-pg copy display name="Example: icon position"
<App>
  <HStack>
    <Button icon="drive" label="Left" />
    <Button icon="drive" label="Right" iconPosition="right" />
  </HStack>
  <HStack>
    <Button icon="drive" label="Start" iconPosition="start" />
    <Button icon="drive" label="End" iconPosition="end" />
  </HStack>
  <HStack>
    <Button 
      icon="drive" 
      label="Start (right-to-left)" 
      iconPosition="start" 
      direction="rtl" />
    <Button 
      icon="drive" 
      label="End (right-to-left)" 
      iconPosition="end" 
      direction="rtl" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START label

```xmlui-pg copy display name="Example: label"
<App>
  <Button label="I am the button label" />
  <Button />
  <Button label="I am the button label">
    <Icon name="trash" />
    I am a text nested into Button
  </Button>
</App>
```

%-PROP-END

%-PROP-START variant

```xmlui-pg copy display name="Example: variant"
<App>
  <HStack>
    <Button label="default (solid)" />
    <Button label="solid" variant="solid" />
    <Button label="outlined" variant="outlined" />
    <Button label="ghost" variant="ghost" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START themeColor

```xmlui-pg copy display name="Example: theme colors"
<App>
  <HStack>
    <Button label="Button" themeColor="primary" />
    <Button label="Button" themeColor="secondary" />
    <Button label="Button" themeColor="attention" />
  </HStack>
</App>  
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled"
<App>
  <HStack>
    <Button label="I am enabled (by default)" />
    <Button label="I am enabled explicitly" enabled="true" />
    <Button label="I am not enabled" enabled="false" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START size

```xmlui-pg copy display name="Example: size"
<App>
  <HStack>
    <Button icon="drive" label="default" />
    <Button icon="drive" label="extra-small" size="xs" />
    <Button icon="drive" label="small" size="sm" />
    <Button icon="drive" label="medium" size="md" />
    <Button icon="drive" label="large" size="lg" />
  </HStack>
  <HStack>
    <Button label="default" />
    <Button label="extra-small" size="xs" />
    <Button label="small" size="sm" />
    <Button label="medium" size="md" />
    <Button label="large" size="lg" />
  </HStack>
</App>
```

%-PROP-END

%-EVENT-START click

```xmlui-pg copy display name="Example: click"
<App>
  <Button label="Click me!" onClick="toast('Button clicked')" />
</App>
```

%-EVENT-END

%-EVENT-START gotFocus

```xmlui-pg copy display name="Example: gotFocus"
<App var.text="No event" >
  <HStack verticalAlignment="center" >
    <Button label="First, click me!" 
      onGotFocus="text = 'Focus received'" 
      onLostFocus="text = 'Focus lost'" />
    <Text value="Then, me!"/>
  </HStack>
  <Text value="{text}" />
</App>
```

%-EVENT-END

%-EVENT-START lostFocus

(See the example above)

%-EVENT-END

%-STYLE-START

### Fixed width and height

Using a set of buttons with a fixed width or height is often helpful. So `Button` supports these theme variables:
- `width-Button`
- `height-Button`

Avoid setting the `width-Button` and `height-Button` styles in the theme definition. Instead, wrap the affected button group into a `Theme` component as in the following example:

```xmlui-pg copy name="Example: Buttons with fixed width"
<App>
  <HStack>
    <Theme width-Button="120px">
      <Button label="Short" />
      <Button label="Longer" />
      <Button label="Longest" />
      <Button label="Disabled" enabled="false" />
      <Button label="Outlined" variant="outlined" />
    </Theme>
  </HStack>
</App>
```

%-STYLE-END
