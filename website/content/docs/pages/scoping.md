# Scoping

## Variables

A variable declared in the `Main.xmlui` file is visible to built-in child components (e.g. `Text`) at any level.

```xmlui-pg
---app display filename="Main.xmlui" /grandparent/ /parent/ /child/
<App var.message="Hello from App">
  <Card id="grandparent">
    <Text>Message: {message}</Text>
    <Card id="parent" var.message2="Hello from Card">
      <Text>Message: {message}</Text>
      <Text>Message2: {message2}</Text>
        <Card id="child">
          <Text>Message: {message}</Text>
          <Text>Message2: {message2}</Text>
        </Card>
    </Card>
  </Card>
</App>
```

A variable declared in a Main.xmlui component is not automatically visible to a user-defined child component.

```xmlui-pg
---app display filename="Main.xmlui"
<App var.message="Hello from App">
  <Card>
    <Text>Message: {message}</Text>
  </Card>
  <MyCard />
</App>
---comp display filename="MyCard"
<Component name="MyCard">
  <Card>
    <Text>Message: {message}</Text>
  </Card>
</Component>
```

The variable can be passed into a user-defined component.

```xmlui-pg
---app display filename="Main.xmlui"
<App var.message="Hello from App">
  <Card>
    <Text>Message: {message}</Text>
  </Card>
  <MyCard message="{message}" />
</App>
---comp display filename="MyCard"
<Component name="MyCard">
  <Card>
    <Text>Message: {$props.message}</Text>
  </Card>
</Component>
```


Or the variable can be transposed into the user-defined component by means of the [Slot](/components/Slot) mechanism. The `Slot` content evaluates in the parent's scope, so it can see parent vars and IDs, but renders inside the child’s layout.

```xmlui-pg
---app display filename="Main.xmlui"
<App var.message="Hello from App">
  <Card>
    <Text>Message: {message}</Text>
  </Card>
  <MyCard>
    <Text>Message: {message}</Text>
  </MyCard>
</App>
---comp display filename="MyCard.xmlui"
<Component name="MyCard">
  <Card>
    <Slot/>
  </Card>
</Component>
```

A child component can redeclare a variable.

```xmlui-pg
---app display filename="Main.xmlui" /grandparent/ /parent/ /child/
<App var.message="Hello from App">
  <Card id="grandparent">
    <Text>Message: {message}</Text>
    <Card id="parent" var.message="Hello from parent Card">
      <Text>Message: {message}</Text>
        <Card id="child" var.message="Hello from child Card">
          <Text>Message: {message}</Text>
        </Card>
    </Card>
  </Card>
</App>
```


All these rules apply within a user-defined component defined in a file like `MyComponent.xmlui`.

```xmlui-pg
---app display filename="Main.xmlui"
<App>
  <MyComponent />
</App>
---comp display filename="MyComponent.xmlui"
<Component name="MyComponent" var.message="Hello from MyComponent">
  <Card id="grandparent">
    <Text>Message: {message}</Text>
    <Card id="parent" var.message2="Hello from Card">
      <Text>Message: {message}</Text>
      <Text>Message2: {message2}</Text>
        <Card id="child">
          <Text>Message: {message}</Text>
          <Text>Message2: {message2}</Text>
        </Card>
    </Card>
  </Card>
</Component>
```

A variable declared in a user-defined component can be passed into another user-defined component.


```xmlui-pg
---app display filename="Main.xmlui"
<App>
  <MyComponent />
</App>
---comp display filename="MyComponent.xmlui"
<Component name="MyComponent" var.message="Hello from MyComponent">
  <Card>
    <Text>Message: {message}</Text>
  </Card>
  <MyOtherComponent message="{message}" />
</Component>
---comp display filename="MyOtherComponent.xmlui"
<Component name="MyOtherComponent">
  <Card>
    <Text>Passed message: {$props.message}</Text>
  </Card>
</Component>
```

## Global variables

A [global variable](../markup#global-variables) declared in the root element of `Main.xmlui`, or in the `Main.xmlui.xs` file is visible in all files at any level.

Local variables can shadow global variables:

```xmlui-pg name="Global and local variables"
---app copy display /<global/ /stations/
<App global.count="{42}">
  <Text>Current global count: {count}</Text>
  <Button onClick="count++">
    Increment global count (from Main): {count}
  </Button>
  <IncButton />
  <Button var.count="{0}" onClick="count++">
    Increment local count: {count}
  </Button>
</App>
---comp display copy
<Component name="IncButton">
  <Button onClick="count++">
    Increment global count (from component): {count}
  </Button>
</Component>
```



## Component IDs

A component ID declared on a Main.xmlui component is visible to built-in child components (e.g. `Text`) at any level.

```xmlui-pg
---app display filename="Main.xmlui" /parent/ /child/ /textBox/
<App var.message="Hello from App">
  <TextBox id="textBox" initialValue="{message}" />
  <Card id="parent">
    <Text>
      { textBox.value }
    </Text>
    <Card id="child">
      <Text>
        { textBox.value }
      </Text>
    </Card>
  </Card>
</App>
```

A component ID declared on a Main.xmlui component is not automatically visible to a user-defined child component.


```xmlui-pg
---app display filename="Main.xmlui"
<App var.message="Hello from App">
  <TextBox id="textBox" initialValue="{message}" />
  <MyCard />
</App>
---comp display filename="MyCard.xmlui"
<Component name="MyCard">
  <Card>
    <Text>Message: {textBox.value}</Text>
  </Card>
</Component>
```

The id can be passed into a user-defined component.

```xmlui-pg
---app display filename="Main.xmlui"
<App var.message="Hello from App">
  <TextBox id="textBox" initialValue="{message}" />
  <MyCard textBox="{textBox}" />
</App>
---comp display filename="MyCard.xmlui"
<Component name="MyCard">
  <Card>
    <Text>Message: {$props.textBox.value}</Text>
  </Card>
</Component>
```

Or the component ID can be transposed into the user-defined component by means of the [Slot](/components/Slot) mechanism.

```xmlui-pg
---app display filename="Main.xmlui"
<App var.message="Hello from App">
  <TextBox id="textBox" initialValue="{message}" />
  <MyCard>
    <Text>Message: {textBox.value}</Text>
  </MyCard>
</App>
---comp display filename="MyCard.xmlui"
<Component name="MyCard">
  <Card>
    <Slot/>
  </Card>
</Component>
```

All these rules apply within a user-defined component defined in a file like `MyComponent.xmlui`.
