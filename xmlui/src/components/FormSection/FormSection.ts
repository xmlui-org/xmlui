import { createMetadata } from "../../abstractions/ComponentDefs";
import { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
// --- We cannot use this with nextra
// import componentSource from "./FormSection.xmlui?raw";

const COMP = "FormSection";

export const FormSectionMd = createMetadata({
  status: "experimental",
  description:
      `The \`${COMP}\` is a component that groups cohesive elements together within ` +
      `a \`Form\`. This grouping is indicated visually: the child components of the \`${COMP}\` ` +
      `are placed in a [\`FlowLayout\`](./FlowLayout.mdx) component.`,
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
