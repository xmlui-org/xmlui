# Copy billing address to shipping address

Define a `PostalAddress` component shared for billing and shipping. Use the JavaScript spread operator (`...`) to copy the billing section of the form's data to the shipping section.

```xmlui-pg id="copy-billing-to-shipping-b76c"
---comp display
<Component name="PostalAddress">
    <TextBox
      label="Address"
      bindTo="{$props.type}.address"
      width="100%"
      placeholder="Street address" />

    <TextBox
      label="City"
      bindTo="{$props.type}.city"
      width="100%"
      placeholder="City" />

    <TextBox
      label="State/Province"
      bindTo="{$props.type}.state"
      width="100%"
      placeholder="State/Province" />

    <TextBox
      label="Postal code"
      bindTo="{$props.type}.postal_code"
      width="100%"
      placeholder="Postal code" />

    <TextBox
      label="Country"
      bindTo="{$props.type}.country"
      width="100%"
      placeholder="Country" />
  </Component>
---app display {15-18}
  <App>
    <Form
      id="addresses"
      data="{{
        billing: { 
          address: '123 W. 57th', city: 'New York', state: 'NY', 
          country: 'USA', postal_code: '10019' 
        },
        shipping: {}
      }}"
      onSubmit="(toSave) => toast(JSON.stringify(toSave))"
    >
      <Button
        label="Copy Billing to Shipping"
        onClick="
          addresses.update({ shipping: { ...$data.billing } });
          toast.success('Billing copied to Shipping')
        " />
      <Tabs>
        <TabItem label="Billing" paddingVertical="$padding-normal">
          <PostalAddress type="billing" />
        </TabItem>
        <TabItem label="Shipping" paddingVertical="$padding-normal">
          <PostalAddress type="shipping" />
        </TabItem>
      </Tabs>
    </Form>
  </App>
```

## Key points

**Extract shared field groups into a custom component**: `PostalAddress` is defined once and reused for both billing and shipping by passing `type` as a prop. The `bindTo` expressions use `{$props.type}.fieldName` so the same component writes to different parts of the form data depending on where it is placed.

**`Form.update()` merges data into the current form state**: Calling `addresses.update({ shipping: { ...$data.billing } })` patches only the `shipping` key, leaving all other form fields untouched.

**The spread operator copies a nested object in one step**: `{ ...$data.billing }` creates a shallow copy of the billing object. Every property is duplicated into the shipping section without listing field names individually.

**`$data` always reflects the live form values**: Inside event handlers, `$data` contains the current value of every form field, including unsaved changes. Reading `$data.billing` after the user has edited the billing section returns the latest input, not the initial data.

---

## See also

- [Form component](/docs/reference/components/Form) — `update()` method, `$data` context variable
- [Prefill a form from an API response](/docs/howto/prefill-a-form-from-an-api-response) — loading initial form data from a server
- [Transform form data before submission](/docs/howto/transform-form-data-before-submission) — reshaping data in `onWillSubmit`

