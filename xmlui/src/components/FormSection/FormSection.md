%-PROP-START columnGap

```xmlui-pg copy display name="Example: columnGap"
<Form padding="1rem">
  <FormSection columnGap="1rem">
    <FormItem width="50%" label="Name" bindTo="" />
    <FormItem width="50%" label="Occupation" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-STARt rowGap

```xmlui-pg copy display name="Example: rowGap"
<Form padding="1rem">
  <FormSection rowGap="2rem">
    <FormItem label="Name" bindTo="" />
    <FormItem label="Occupation" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-START info

```xmlui-pg copy display name="Example: info"
<Form padding="1rem">
  <FormSection info="This is some information about a particular section.">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-START infoFontSize

```xmlui-pg copy {4} display name="Example: infoFontSize"
<Form padding="1rem">
  <FormSection
    info="This is some information about a particular section."
    infoFontSize="18px"
  >
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-START heading

```xmlui-pg copy display name="Example: heading"
<Form padding="1rem">
  <FormSection heading="Basic Heading">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-START headingLevel

```xmlui-pg copy display name="Example: headingLevel"
<Form padding="1rem">
  <FormSection heading="Basic Heading" headingLevel="h1">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-START headingWeight

The default weight is `bold`.

```xmlui-pg copy display name="Example: headingWeight"
<Form padding="1rem">
  <FormSection heading="Basic Heading" headingWeight="normal">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END

%-PROP-START paddingBottom

```xmlui-pg copy display name="Example: paddingBottom"
<Form padding="1rem">
  <FormSection paddingBottom="3rem" heading="Basic Info">
    <FormItem width="50%" label="First Name" bindTo="" />
    <FormItem width="50%" label="Last Name" bindTo="" />
  </FormSection>
  <FormSection paddingBottom="0" heading="Job Related">
    <FormItem width="50%" label="Occupation" bindTo="" />
    <FormItem width="50%" label="Job Description" bindTo="" />
  </FormSection>
</Form>
```

%-PROP-END
