%-DESC-START

The `Choose` component provides switch-like conditional rendering in XMLUI. It evaluates a condition and renders only the first child whose `case` attribute matches the condition value. If no match is found, it renders a child without a `case` attribute (the default case).

**Key features:**
- **First-match rendering**: Only the first matching child is rendered, similar to a switch statement
- **Default case support**: Child components without a `case` attribute serve as fallback content
- **Type flexibility**: Matches strings, numbers, booleans, and other comparable values
- **Property preservation**: The `$case` attribute allows child components to use their own `case` property
- **Sequential evaluation**: Children are evaluated in order from first to last

## Basic Usage

The component traverses its children from first to last. When a child's `case` attribute matches the `condition` value, that child is rendered and all remaining children are skipped.

```xmlui-pg copy display name="Example: basic usage"
<App>
  <variable name="userRole" value="admin" />
  <Choose condition="{userRole}">
    <Text case="admin" value="Admin Dashboard" />
    <Text case="user" value="User Dashboard" />
    <Text case="guest" value="Guest Access" />
  </Choose>
</App>
```

```xmlui-pg copy display name="Example: with default case"
<App>
  <variable name="status" value="unknown" />
  <Choose condition="{status}">
    <Text case="active" value="Status: Active" />
    <Text case="inactive" value="Status: Inactive" />
    <Text value="Status: Unknown (default)" />
  </Choose>
</App>
```

```xmlui-pg copy display name="Example: with no match"
<App>
  <variable name="category" value="other" />
  <VStack>
    <Text value="Categories:" />
    <Choose condition="{category}">
      <Text case="electronics" value="📱 Electronics" />
      <Text case="books" value="📚 Books" />
      <Text case="clothing" value="👕 Clothing" />
    </Choose>
    <Text value="(No category displayed above)" />
  </VStack>
</App>
```

%-DESC-END

%-PROP-START condition

The `condition` property accepts any value type (string, number, boolean, etc.) that will be matched against child `case` attributes. The matching uses strict equality (===).

```xmlui-pg copy display name="Example: condition with strings"
<App>
  <variable name="status" value="active" />
  <Choose condition="{status}">
    <Badge case="active" variant="success">Active</Badge>
    <Badge case="pending" variant="warning">Pending</Badge>
    <Badge case="inactive" variant="neutral">Inactive</Badge>
  </Choose>
</App>
```

```xmlui-pg copy display name="Example: condition with numbers"
<App>
  <variable name="errorCode" value="{404}" />
  <Choose condition="{errorCode}">
    <Text case="200" value="✓ Success" />
    <Text case="404" value="⚠ Not Found" />
    <Text case="500" value="✗ Server Error" />
  </Choose>
</App>
```

```xmlui-pg copy display name="Example: condition with booleans"
<App>
  <variable name="isLoggedIn" value="{true}" />
  <Choose condition="{isLoggedIn}">
    <Text case="true" value="Welcome back!" />
    <Text case="false" value="Please log in" />
  </Choose>
</App>
```

%-PROP-END

%-PROP-START case

The `case` attribute on child components defines the value to match against the `condition`. Children are evaluated in order, and only the first match is rendered.

```xmlui-pg copy display name="Example: case matching" height="320px"
<App>
  <variable name="viewMode" value="grid" />
  <VStack gap="16px">
    <HStack gap="8px">
      <Button onClick="viewMode = 'list'">List View</Button>
      <Button onClick="viewMode = 'grid'">Grid View</Button>
      <Button onClick="viewMode = 'table'">Table View</Button>
    </HStack>
    
    <Choose condition="{viewMode}">
      <Card case="list">
        <Text variant="strong">List View</Text>
        <Text>Items displayed in a vertical list</Text>
      </Card>
      <Card case="grid">
        <Text variant="strong">Grid View</Text>
        <Text>Items arranged in a grid layout</Text>
      </Card>
      <Card case="table">
        <Text variant="strong">Table View</Text>
        <Text>Items shown in a data table</Text>
      </Card>
    </Choose>
  </VStack>
</App>
```

**First-match behavior:** When multiple children have the same `case` value, only the first one is rendered.

```xmlui-pg copy display name="Example: first match wins"
<App>
  <Choose condition="option">
    <Text case="option" value="This is rendered (first match)" />
    <Text case="option" value="This is never rendered" />
  </Choose>
</App>
```

%-PROP-END

%-PROP-START $case

The `$case` attribute is a special escape mechanism that allows a child component to use its own `case` property while still participating in the `Choose` matching logic. When a match is found, the `$case` value is transposed to the child's `case` property.

```xmlui-pg copy display name="Example: $case for property preservation"
<App>
  <variable name="language" value="english" />
  <Choose condition="{language}">
    <Text case="english" $case="nominative" value="The user" />
    <Text case="german" $case="accusative" value="Den Benutzer" />
    <Text case="russian" $case="genitive" value="Пользователя" />
  </Choose>
</App>
```

In this example, if a hypothetical Text component had its own `case` property for grammatical cases, using `$case` for matching allows the component to receive its intended `case="nominative"` property after matching.

%-PROP-END

## Default Case

A child component without a `case` or `$case` attribute acts as the default case. It will be rendered if no other child matches the condition. The default case is evaluated in order, so if it appears before a matching case, the default will be rendered instead.

```xmlui-pg copy display name="Example: default case" height="340px"
<App>
  <variable name="pageState" value="loading" />
  <VStack gap="16px">
    <HStack gap="8px">
      <Button onClick="pageState = 'loading'">Loading</Button>
      <Button onClick="pageState = 'success'">Success</Button>
      <Button onClick="pageState = 'error'">Error</Button>
      <Button onClick="pageState = 'unknown'">Unknown</Button>
    </HStack>
    
    <Choose condition="{pageState}">
      <HStack case="loading" verticalAlignment="center" gap="8px">
        <Spinner size="sm" />
        <Text>Loading data...</Text>
      </HStack>
      <Card case="success">
        <Text variant="strong">Success!</Text>
        <Text>Data loaded successfully</Text>
      </Card>
      <Card case="error">
        <Text variant="strong">Error</Text>
        <Text>Failed to load data</Text>
      </Card>
      <Card>
        <Text variant="strong">Unknown State</Text>
        <Text>The current state is not recognized</Text>
      </Card>
    </Choose>
  </VStack>
</App>
```

**Important:** If the default case appears before other cases in the children list, it will be rendered instead of later matches:

```xmlui-pg copy display name="Example: default case position matters"
<App>
  <Choose condition="match">
    <Text case="option1" value="Option 1" />
    <Text value="Default (will render if condition doesn't match option1)" />
    <Text case="match" value="This will never render!" />
  </Choose>
</App>
```

## Complex Examples

### Dynamic State Management

```xmlui-pg copy display name="Example: dynamic state transitions" height="360px"
<App>
  <variable name="orderStatus" value="pending" />
  <VStack gap="16px">
    <Choose condition="{orderStatus}">
      <Card case="pending">
        <Text variant="strong">Order Pending</Text>
        <Text>Your order is being processed</Text>
        <Button onClick="orderStatus = 'confirmed'">Confirm Order</Button>
      </Card>
      <Card case="confirmed">
        <Text variant="strong">Order Confirmed</Text>
        <Text>Your order has been confirmed</Text>
        <Button onClick="orderStatus = 'shipped'">Mark as Shipped</Button>
      </Card>
      <Card case="shipped">
        <Text variant="strong">Order Shipped</Text>
        <Text>Your order is on the way</Text>
        <Button onClick="orderStatus = 'delivered'">Mark as Delivered</Button>
      </Card>
      <Card case="delivered">
        <Text variant="strong">Order Delivered</Text>
        <Text>Your order has been delivered</Text>
        <Button onClick="orderStatus = 'pending'">Reset</Button>
      </Card>
    </Choose>
  </VStack>
</App>
```

### Nested Choose Components

`Choose` components can be nested to handle complex conditional logic:

```xmlui-pg copy display name="Example: nested Choose" height="380px"
<App>
  <variable name="userType" value="premium" />
  <variable name="accessLevel" value="read" />
  <VStack gap="16px">
    <HStack gap="8px">
      <Button onClick="userType = 'free'">Free User</Button>
      <Button onClick="userType = 'premium'">Premium User</Button>
    </HStack>
    <HStack gap="8px">
      <Button onClick="accessLevel = 'read'">Read Only</Button>
      <Button onClick="accessLevel = 'write'">Write Access</Button>
    </HStack>
    
    <Choose condition="{userType}">
      <Card case="free">
        <Text variant="strong">Free Account</Text>
        <Text>Limited access to features</Text>
      </Card>
      <Choose case="premium">
        <Card case="read">
          <Text variant="strong">Premium - Read Access</Text>
          <Text>You can view all premium content</Text>
        </Card>
        <Card case="write">
          <Text variant="strong">Premium - Full Access</Text>
          <Text>You can view and edit premium content</Text>
        </Card>
      </Choose>
    </Choose>
  </VStack>
</App>
```

### Integration with Forms

```xmlui-pg copy display name="Example: form field types" height="400px"
<App>
  <variable name="fieldType" value="text" />
  <variable name="fieldValue" value="" />
  <VStack gap="16px">
    <Select
      placeholder="Choose field type"
      initialValue="text"
      onDidChange="v => fieldType = v">
      <Option value="text" label="Text Input" />
      <Option value="number" label="Number Input" />
      <Option value="password" label="Password Input" />
      <Option value="checkbox" label="Checkbox" />
    </Select>
    
    <Choose condition="{fieldType}">
      <TextBox
        case="text"
        label="Text Field"
        placeholder="Enter text"
        onDidChange="v => fieldValue = v"
      />
      <NumberBox
        case="number"
        label="Number Field"
        placeholder="Enter number"
        onDidChange="v => fieldValue = v"
      />
      <PasswordInput
        case="password"
        label="Password Field"
        placeholder="Enter password"
        onDidChange="v => fieldValue = v"
      />
      <Checkbox
        case="checkbox"
        label="Checkbox Field"
        onDidChange="v => fieldValue = v ? 'checked' : 'unchecked'"
      />
    </Choose>
    
    <Text>Current value: {fieldValue || '(empty)'}</Text>
  </VStack>
</App>
```

### Matching with Multiple Data Types

```xmlui-pg copy display name="Example: type-specific rendering" height="280px"
<App>
  <variable name="value" value="{null}" />
  <VStack gap="16px">
    <HStack gap="8px">
      <Button onClick="value = 'text'">String</Button>
      <Button onClick="value = 42">Number</Button>
      <Button onClick="value = true">Boolean</Button>
      <Button onClick="value = null">Null</Button>
    </HStack>
    
    <Choose condition="{value}">
      <Text case="text" value="You selected text" />
      <Text case="42" value="You selected the number 42" />
      <Text case="true" value="You selected true" />
      <Text value="No selection or null" />
    </Choose>
  </VStack>
</App>
```

## Edge Cases and Considerations

**Case sensitivity:** Matching is case-sensitive and uses strict equality:

```xmlui-pg copy display name="Example: case-sensitive matching"
<App>
  <Choose condition="Option">
    <Text case="option" value="lowercase - not matched" />
    <Text case="Option" value="Capitalized - matched!" />
    <Text case="OPTION" value="UPPERCASE - not matched" />
  </Choose>
</App>
```

**Empty and special values:** The component correctly distinguishes between empty strings, zero, false, null, and undefined:

```xmlui-pg copy display name="Example: special values" height="280px"
<App>
  <variable name="value" value="" />
  <VStack gap="16px">
    <HStack gap="8px">
      <Button onClick="value = ''">Empty String</Button>
      <Button onClick="value = 0">Zero</Button>
      <Button onClick="value = false">False</Button>
      <Button onClick="value = null">Null</Button>
    </HStack>
    
    <Choose condition="{value}">
      <Text case="" value='Empty string: ""' />
      <Text case="0" value="Number: 0" />
      <Text case="false" value="Boolean: false" />
      <Text value="Null or undefined (default)" />
    </Choose>
  </VStack>
</App>
```

**No children:** If `Choose` has no children or no match is found without a default case, nothing is rendered:

```xmlui-pg copy display name="Example: no rendering"
<App>
  <VStack>
    <Text value="Before Choose" />
    <Choose condition="nomatch">
      <Text case="option1" value="Option 1" />
      <Text case="option2" value="Option 2" />
    </Choose>
    <Text value="After Choose (no gap above)" />
  </VStack>
</App>
```
