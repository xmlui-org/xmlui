%-PROP-START hideIcon

```xmlui-pg copy display name="Example: hideIcon"
<App>
  <FlowLayout>
    <NoResult hideIcon="true" width="50%" />
    <NoResult hideIcon="false" width="50%" />
  </FlowLayout>
</App>
```

%-PROP-END

%-PROP-START icon

This property defines the icon to display with the component. For a list of of available icons consult [`Icon` documentation](/docs/reference/components/Icon).

```xmlui-pg copy display name="Example: icon"
<App>
  <NoResult icon="error" height="100%" />
</App>
```

%-PROP-END

%-PROP-START label

Customize the displayed text using this property. Leave empty to omit it.

```xmlui-pg copy display name="Example: label"
<App>
  <NoResult label="Sorry, found nothing!" height="100%" />
</App>
```

%-PROP-END
