# Choose [#choose]

`Choose` is a non-visual component that provides switch-like conditional rendering. It evaluates a condition and renders the first child whose `case` attribute matches the condition value. If no match is found, it renders a child without a `case` attribute (the default case). Only one child is rendered. If a child component needs its own `case` property, use `$case` for matching instead, which will be transposed to `case` in the rendered child.

The `Choose` component provides switch-like conditional rendering in XMLUI. It evaluates a condition and renders only the first child whose `case` attribute matches the condition value. If no match is found, it renders a child without a `case` attribute (the default case).

**Key features:**
- **First-match rendering**: Only the first matching child is rendered, similar to a switch statement
- **Default case support**: Child components without a `case` attribute serve as fallback content
- **Type flexibility**: Matches strings, numbers, booleans, and other comparable values
- **Property preservation**: The `$case` attribute allows child components to use their own `case` property
- **Sequential evaluation**: Children are evaluated in order from first to last

## Basic Usage [#basic-usage]

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

## Properties [#properties]

### `condition` [#condition]

The value to match against child `case` or `$case` attributes. This can be any expression that evaluates to a comparable value (string, number, boolean, etc.).

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
