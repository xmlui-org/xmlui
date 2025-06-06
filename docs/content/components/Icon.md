# Icon [#icon]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.This component is the representation of an icon.

It is a small visual element, which is used to graphically represent functions, features, or types of content within a user interface.

## Properties [#properties]

### `fallback` [#fallback]

This optional property provides a way to handle situations when the provided [icon name](#name) is not found in the registry.

```xmlui-pg copy display name="Example: fallback"
<App>
  <Icon name="noicon" fallback="trash" />
</App>
```

### `name` [#name]

This string property specifies the name of the icon to display. All icons have unique names and identifying the name is case-sensitive.

The engine looks up the icon in its [registry]() and determines which icon is associated with the name that the component will show.
Nothing is displayed if the icon name is not found in the registry.

```xmlui-pg copy display name="Example: name"
<App>
  <HStack>
    <Icon name="message" />
    <Icon name="note" />
    <Icon name="cog" />
    <Icon name="start" />
    <Icon name="some-non-existing-icon" />
    <Icon name="some-non-existing-icon-with fallback" fallback="trash" />
  </HStack>
</App>
```

### `size` [#size]

This property defines the size of the `Icon`. Note that setting the `height` and/or the `width` of the component will override this property.

Available values: `xs`, `sm`, `md`, `lg`

```xmlui-pg copy display name="Example: size"
<App>
  <HStack>
    <Icon name="like" />
    <Icon name="like" size="xs" />
    <Icon name="like" size="sm" />
    <Icon name="like" size="md" />
    <Icon name="like" size="lg" />
  </HStack>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [size](../styles-and-themes/common-units/#size)-Icon | 1.25em | 1.25em |
