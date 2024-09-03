const components = [
  `
  <Component name="ComponentSection">
    <VStack paddingBottom="1rem" gap="1rem">
      <H2 value="{$props.heading}" />
      <Slot />
      <ContentSeparator />
    </VStack>
  </Component>
    `,
  `
    <Component name="Subsection">
        <Stack orientation="{$props.orientation ?? 'vertical'}" horizontalAlignment="{$props.horizontalAlignment}"
               gap="0.5rem" width="{$props.width || '*'}">
          <H3 value="{$props.heading}" />
          <Slot />
        </Stack>
      </Component>
      `,
  `
    <!-- Why this component? Input field validation status colors can't be set through FormItem using metadata, need to use the underlying controls directly -->
      <Component name="NoFormLabelContainer">
        <HStack gap="0.5rem" verticalAlignment="center">
          <Slot />
          <Text value="{$props.label}" />
        </HStack>
      </Component>
`,
]

export default components;