# FormSection [#formsection]

`FormSection` groups elements within a `Form`. Child components are placed in a [FlowLayout](/components/FlowLayout).

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties [#properties]

### `columnGap` [#columngap]

> [!DEF]  default: **"3rem"**

The gap between columns of items within the section.

```xmlui-pg copy display name="Example: columnGap"
<Form padding="1rem">
  <FormSection columnGap="1rem">
    <FormItem width="50%" label="Name" bindTo="" />
    <FormItem width="50%" label="Occupation" bindTo="" />
  </FormSection>
</Form>
```

### `heading` [#heading]

The heading text to be displayed at the top of the form section.

```xmlui-pg copy display name="Example: heading"
<Form padding="1rem">
  <FormSection heading="Basic Heading">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

### `headingLevel` [#headinglevel]

> [!DEF]  default: **"h3"**

The semantic and visual level of the heading.

Available values: `h1`, `h2`, `h3` **(default)**, `h4`, `h5`, `h6`

```xmlui-pg copy display name="Example: headingLevel"
<Form padding="1rem">
  <FormSection heading="Basic Heading" headingLevel="h1">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

### `headingWeight` [#headingweight]

> [!DEF]  default: **"bold"**

The font weight of the heading.

The default weight is `bold`.

```xmlui-pg copy display name="Example: headingWeight"
<Form padding="1rem">
  <FormSection heading="Basic Heading" headingWeight="normal">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

### `info` [#info]

Informational text displayed below the heading.

```xmlui-pg copy display name="Example: info"
<Form padding="1rem">
  <FormSection info="This is some information about a particular section.">
    <FormItem label="Input Field" bindTo="" />
  </FormSection>
</Form>
```

### `infoFontSize` [#infofontsize]

> [!DEF]  default: **"0.8rem"**

The font size of the informational text.

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

### `paddingTop` [#paddingtop]

> [!DEF]  default: **"$space-normal"**

The top padding of the FlowLayout where the section's children are placed.

### `rowGap` [#rowgap]

> [!DEF]  default: **"$space-normal"**

The gap between rows of items within the section.

```xmlui-pg copy display name="Example: rowGap"
<Form padding="1rem">
  <FormSection rowGap="2rem">
    <FormItem label="Name" bindTo="" />
    <FormItem label="Occupation" bindTo="" />
  </FormSection>
</Form>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.
