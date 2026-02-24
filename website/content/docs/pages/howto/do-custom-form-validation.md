# Do custom form validation

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test" var.limit="{100}">

<Form
  data="{{ spending: 0 }}"
  onSubmit="(data) => console.log('Submitted:', data)"
>

  <FormItem
    label="Requested Amount (limit {limit})"
    bindTo="total"
    type="integer"
    onValidate="{ (value) => value > 0 && value <= limit }"
  />
</Form>

</Component>
```
