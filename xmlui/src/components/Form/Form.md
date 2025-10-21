%-DESC-START

**Key features:**
- **Automatic data binding**: Form controls automatically sync with form data using `bindTo` properties
- **Built-in validation**: Validates individual fields and overall form state before submission
- **Context sharing**: Provides `$data` and other context values accessible to all nested components
- **Submission handling**: Manages form submission workflow and prevents invalid submissions

See [this guide](/forms) for details.

%-DESC-END

%-CONTEXT_VAR-START $data

The following sample demonstrates enabling a field based on another field's current value.

`$data` is also available in these event handlers: `willSubmit`, `submit`, `cancel`, `reset`, and `success`.

```xmlui-pg copy {5} display name="Example: referencing field values"
<App>
  <Form
    data="{{ isEnabled: true, name: 'Joe' }}" paddingHorizontal="1rem">
    <FormItem label="Enable name" bindTo="isEnabled" type="switch" />
    <FormItem enabled="{$data.isEnabled}" label="Name" bindTo="name" />
  </Form>
</App>
```

%-CONTEXT_VAR-END

%-PROP-START buttonRowTemplate

The following example demonstrates using it:

```xmlui-pg copy display name="Example: buttonRowTemplate"
---app copy display {10-19}
<App>
  <Form id="searchForm" padding="0.5rem"
    data="{{ search: 'Seattle', caseSensitive: false }}"
    onSubmit="() => {isSearching = true; delay(1000); isSearching = false; }"
    saveLabel="Search"
    var.isSearching="{false}">
      <Text>Please specify the name to include in the search:</Text>
      <FormItem bindTo="search" width="280px" />
      <FormItem type="checkbox" label="Case sensitive?" bindTo="caseSensitive" />
      <property name="buttonRowTemplate">
        <HStack gap="0.5rem" borderTop="1px solid #ddd" paddingVertical="1rem">
          <Button label="Test Search Server" type="button"
            themeColor="secondary" variant="outlined"
            onClick="toast('Search server is ok.')"/>
          <SpaceFiller/>
          <Button type="submit" enabled="{!isSearching}" icon="search"
            label="{isSearching ? 'Searching...' : 'Search'}"/>
        </HStack>
      </property>
  </Form>
</App>  
---desc
This example mimics a one-second search and turns off the submit button during the operation. Also, it adds a Test Search Server button:
```

%-PROP-END

%-EVENT-START submit

```xmlui-pg copy {4} display name="Example: submit"
<App>
  <Form padding="0.5rem"
    data="{{ name: 'Joe', age: 43 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FlowLayout columnGap="12px" paddingBottom="6px">
      <FormItem bindTo="name" label="Customer name" width="50%" />
      <FormItem bindTo="age" label="Age" type="integer" width="50%"
        zeroOrPositive="true" />
    </FlowLayout>
  </Form>
</App>  
```

%-EVENT-END

%-EVENT-START willSubmit

The following example allows saving customer data only when the age is an even number. The `willSubmit` event handler returns `false` if this condition is not met.

```xmlui-pg display copy {4-9} name="Example: willSubmit"
<App>
  <Form padding="0.5rem"
    data="{{ name: 'Joe', age: 43 }}"
    onWillSubmit="(toSubmit) => {
      if (toSubmit.age % 2) {
        toast.error('Age must be an even number');
        return false;
      }
    }"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FlowLayout columnGap="12px" paddingBottom="6px">
      <FormItem bindTo="name" label="Customer name" width="50%" />
      <FormItem bindTo="age" label="Age" type="integer" width="50%"
        zeroOrPositive="true" />
    </FlowLayout>
  </Form>
</App>  
```

%-EVENT-END

%-API-START update

This method updates the form data with the change passed in its parameter. The parameter is a hash object, and this method updates the Form's properties accordingly. 

```xmlui-pg copy display name="Example: update"
<App>
  <Form id="myForm" padding="0.5rem"
    data="{{ name: 'Joe', age: 43, $update: 123 }}"
    onSubmit="(toSave) => toast(JSON.stringify(toSave))">
    <FlowLayout columnGap="12px" paddingBottom="6px">
      <FormItem bindTo="name" label="Customer name" width="50%" />
      <FormItem bindTo="age" label="Age" type="integer" width="50%"
        zeroOrPositive="true" />
    </FlowLayout>
    <Button onClick="() => $data.update({age: $data.age + 1})" >
      Increment age (1)
    </Button>
    <Button onClick="() => myForm.update({age: $data.age + 1})" >
      Increment age (2)
    </Button>
    <Button onClick="() => myForm.update({name: $data.name + '!', age: $data.age + 1})" >
      Update name and age
    </Button>
  </Form>
</App>  
```

%-API-END
