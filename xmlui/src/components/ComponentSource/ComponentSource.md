# ComponentSource

The `ComponentSource` component extracts and provides the source code of XMLUI components. It uses a naming convention to determine which component's source to extract.

## Usage

```xmlui
<App>
  <!-- Display the app source -->
  <ComponentSource id="AppSourceCode" />
  <Text preserveLinebreaks="true">
    { AppSourceCode.value }
  </Text>

  <!-- Display the test component source -->
  <ComponentSource id="TestSourceCode" />
  <Text preserveLinebreaks="true">
    { TestSourceCode.value }
  </Text>
</App>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `autoLoad` | `boolean` | `true` | Determines whether the component should automatically load the source code when mounted |
| `onSourceLoaded` | `function` | - | Callback function called when source code is successfully loaded |
| `onError` | `function` | - | Callback function called when an error occurs |

## Behavior

- **Naming Convention**: The component uses the ID pattern to determine which component to extract. Use `id="componentNameSourceCode"` where `componentName` is the name of the component whose source you want to extract.
- **Source Extraction**: Uses the inspector's robust source extraction logic to get exact component boundaries
- **Formatting**: Applies the same formatting as the inspector (removes empty lines, trims indentation, removes `inspect="true"`)
- **Non-visual**: This component doesn't render anything visible, it only provides data through the binding system

## Naming Convention

The ComponentSource uses a simple naming convention to determine which component's source to extract:

- `id="AppSourceCode"` → extracts Main.xmlui (the whole app)
- `id="TestSourceCode"` → extracts Test component source
- `id="HomeSourceCode"` → extracts Home component source
- `id="MyComponentSourceCode"` → extracts MyComponent source

The pattern is: `id="ComponentNameSourceCode"` where `ComponentName` is the name of the component whose source you want to extract (with proper capitalization).

## Examples

### Display App Source
```xmlui
<ComponentSource id="AppSourceCode" />
<Card>
  <Text preserveLinebreaks="true">
    { AppSourceCode.value }
  </Text>
</Card>
```

### Display Component Source
```xmlui
<ComponentSource id="TestSourceCode" />
<Card>
  <Text preserveLinebreaks="true">
    { TestSourceCode.value }
  </Text>
</Card>
```



