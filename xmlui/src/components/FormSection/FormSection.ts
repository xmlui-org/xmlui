import { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
import { createMetadata } from "../metadata-helpers";
// --- We cannot use this with nextra
// import componentSource from "./FormSection.xmlui?raw";

const COMP = "FormSection";

export const FormSectionMd = createMetadata({
  status: "experimental",
  description:
    "`FormSection` groups elements within a `Form`. Child components are placed in " +
    "a [FlowLayout](/components/FlowLayout).",
  props: {
    heading: {
      description: "The heading text to be displayed at the top of the form section.",
      type: "string",
    },
    headingLevel: {
      description: "The semantic and visual level of the heading.",
      availableValues: ["h1", "h2", "h3", "h4", "h5", "h6"],
      defaultValue: "h3",
    },
    headingWeight: {
      description: "The font weight of the heading.",
      type: "string",
      defaultValue: "bold",
    },
    info: {
      description: "Informational text displayed below the heading.",
      type: "string",
    },
    infoFontSize: {
      description: "The font size of the informational text.",
      type: "string",
      defaultValue: "0.8rem",
    },
    paddingTop: {
      description: "The top padding of the FlowLayout where the section's children are placed.",
      type: "string",
      defaultValue: "$space-normal",
    },
    columnGap: {
      description: "The gap between columns of items within the section.",
      type: "string",
      defaultValue: "3rem",
    },
    rowGap: {
      description: "The gap between rows of items within the section.",
      type: "string",
      defaultValue: "$space-normal",
    },
  },
});

const componentSource = `
<Component name="FormSection">
  <VStack paddingBottom="{$props.paddingBottom ?? '1rem'}" gap="0" width="100%">
    <Heading
      when="{!!$props.heading}"
      marginBottom="$space-tight"
      level="{$props.headingLevel ?? 'h3'}"
      fontWeight="{$props.headingWeight ?? 'bold'}"
      value="{$props.heading}" />
    <Text
      when="{!!$props.info}"
      fontSize="{$props.infoFontSize ?? '0.8rem'}"
      paddingBottom="$space-normal"
      value="{$props.info}" />
    <FlowLayout
      width="100%"
      paddingTop="{$props.paddingTop ?? '$space-normal'}"
      columnGap="{$props.columnGap ?? '3rem'}"
      rowGap="{$props.rowGap ?? '$space-normal'}" >
      <Slot />
    </FlowLayout>
  </VStack>
</Component>
`;

export const formSectionRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: FormSectionMd,
};
