# Helper Tags

Helper tags provide alternative XML markup syntax for declaring variables, properties, and event handlers in XMLUI.

## variable

The `<variable>` tag declares variables as markup, providing an alternative to the `var.` attribute prefix syntax.

Instead of using the `var.` attribute prefix:

```xmlui
<App var.count="{0}" var.message="Hello, World!">
  <Text>{message}</Text>
  <Button onClick="count++" label="Count: {count}" />
</App>
```

You can use the `<variable>` tag:

```xmlui
<App>
  <variable name="count" value="{0}" />
  <variable name="message" value="Hello, World!" />
  <Text>{message}</Text>
  <Button onClick="count++" label="Count: {count}" />
</App>
```

## property

The `<property>` tag sets component properties using nested markup, particularly useful for template properties that contain other components.

```xmlui
<Form data='{{ name: "", email: "" }}'>
  <FormItem bindTo="name" label="Name" />
  <FormItem bindTo="email" label="Email" />

  <property name="buttonRowTemplate">
    <HStack gap="1rem">
      <Button type="submit" label="Save" variant="primary" />
      <Button type="reset" label="Cancel" variant="secondary" />
    </HStack>
  </property>
</Form>
```

App headers can use logo templates for custom branding:

```xmlui
<AppHeader>
  <property name="logoTemplate">
    <HStack verticalAlignment="center" gap="0.5rem">
      <Icon name="star" size="lg" color="primary" />
      <H2>My App</H2>
    </HStack>
  </property>
</AppHeader>
```

Lists and other data-driven components can use item templates:

```xmlui
<List data="{users}">
  <property name="itemTemplate">
    <HStack gap="1rem" padding="0.5rem">
      <Avatar url="{$item.avatar}" name="{$item.name}" />
      <VStack>
        <Text weight="bold">{$item.name}</Text>
        <Text color="muted">{$item.email}</Text>
      </VStack>
    </HStack>
  </property>
</List>
```

Dropdown components can have rich option layouts:

```xmlui
<Select data="{countries}" bindTo="selectedCountry">
  <property name="optionTemplate">
    <HStack gap="0.5rem">
      <Image src="{$item.flag}" width="20px" height="15px" />
      <Text>{$item.name}</Text>
      <Text color="muted">({$item.code})</Text>
    </HStack>
  </property>
</Select>
```

## event

The `<event>` tag declares event handlers as markup, providing an alternative to the `on` attribute prefix syntax and enabling the use of component-based handlers.

Instead of using the `on` attribute prefix:

```xmlui
<Button label="Click me" onClick="count++" />
```

You can use the `<event>` tag:

```xmlui
<Button label="Click me">
  <event name="click">
    count++
  </event>
</Button>
```

The `<event>` is necessary when using `<APICall>` as an event handler.

```xmlui
<Button label="Save Data">
  <event name="click">
    <APICall
      url="/api/save"
      method="POST"
      body="{formData}"
      onSuccess="toast('Data saved successfully!')"
      onError="toast('Failed to save data', 'error')" />
  </event>
</Button>
```

