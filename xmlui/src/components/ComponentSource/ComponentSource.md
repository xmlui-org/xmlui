# ComponentSource

The `ComponentSource` component extracts and provides the source code of XMLUI components. It uses the inspector's source extraction mechanisms to get the exact source code of the current component or a specified component.

## Usage

```xmlui
<App>
  <!-- Display the current component's source -->
  <ComponentSource id="sourceCode" />
  <Text preserveLinebreaks="true">
    { sourceCode.value }
  </Text>

  <!-- Display a specific component's source -->
  <ComponentSource id="testSource" componentName="Test" />
  <Text preserveLinebreaks="true">
    { testSource.value }
  </Text>
</App>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `autoLoad` | `boolean` | `true` | Determines whether the component should automatically load the source code when mounted |
| `onSourceLoaded` | `function` | - | Callback function called when source code is successfully loaded |
| `onError` | `function` | - | Callback function called when an error occurs |
| `componentName` | `string` | - | The name of the component whose source code should be extracted |

## Behavior

- **Context Detection**: If no `componentName` is provided, the component tries to determine the context from its `uid` or parent component
- **Source Extraction**: Uses the inspector's robust source extraction logic to get exact component boundaries
- **Formatting**: Applies the same formatting as the inspector (removes empty lines, trims indentation, removes `inspect="true"`)
- **Non-visual**: This component doesn't render anything visible, it only provides data through the binding system

## Examples

### Display App Source
```xmlui
<ComponentSource id="appSource" />
<Card>
  <Text preserveLinebreaks="true">
    { appSource.value }
  </Text>
</Card>
```

### Display Component Source
```xmlui
<Component name="MyComponent">
  <ComponentSource id="mySource" />
  <Text preserveLinebreaks="true">
    { mySource.value }
  </Text>
</Component>
```

### Manual Component Specification
```xmlui
<ComponentSource id="otherSource" componentName="OtherComponent" />
<Text preserveLinebreaks="true">
  { otherSource.value }
</Text>
```
