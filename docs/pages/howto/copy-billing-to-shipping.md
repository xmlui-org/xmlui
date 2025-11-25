# Copy billing address to shipping address

Define a `PostalAddress` component shared for billing and shipping. Use the JavaScript spread operator (`...`) to copy the billing section of the form's data to the shipping section.

```xmlui-pg
---comp display
<Component name="PostalAddress">
    <FormItem
      label="Address"
      type="text"
      bindTo="{$props.type}.address"
      width="100%"
      placeholder="Street address" />

    <FormItem
      label="City"
      type="text"
      bindTo="{$props.type}.city"
      width="100%"
      placeholder="City" />

    <FormItem
      label="State/Province"
      type="text"
      bindTo="{$props.type}.state"
      width="100%"
      placeholder="State/Province" />

    <FormItem
      label="Postal code"
      type="text"
      bindTo="{$props.type}.postal_code"
      width="100%"
      placeholder="Postal code" />

    <FormItem
      label="Country"
      type="text"
      bindTo="{$props.type}.country"
      width="100%"
      placeholder="Country" />
  </Component>
---app display {12}
  <App>
    <Form
      id="addresses"
      data="{{
        billing: { address: '123 W. 57th', city: 'New York', state: 'NY', country: 'USA', postal_code: '10019' },
        shipping: {}
      }}"
      onSubmit="(toSave) => toast(JSON.stringify(toSave))"
    >
      <Button
        label="Copy Billing to Shipping"
        onClick="() => addresses.update({ shipping: { ...$data.billing } })" />
      <Tabs>
        <TabItem label="billing">
          <PostalAddress type="billing" />
        </TabItem>
        <TabItem label="shipping">
          <PostalAddress type="shipping" />
        </TabItem>
      </Tabs>
    </Form>
  </App>
```

