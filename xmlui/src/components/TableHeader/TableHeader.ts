import { createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "@components-core/utils/compound-utils";
// --- We cannot use this with nextra
//import componentSource from "./TableHeader.xmlui?raw";

const COMP = "TableHeader";

export const TableHeaderMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component can be used within a \`Table\` to define a particular table ` +
    `column's visual properties and data bindings.`,
  props: {
    title: d("The title of the table header."),
  },
  defaultThemeVars: {
    [`padding-vertical-${COMP}`]: "$space-4",
    [`padding-horizontal-${COMP}`]: "$space-5",
  },
});

const componentSource = `
<Component name="TableHeader">
  <VStack 
    verticalAlignment="center"
    verticalPadding="$padding-vertical-TableHeader"
    horizontalPadding="$padding-horizontal-TableHeader">
    <Text variant="strong" value="{$props.title}"/>
  </VStack>
</Component>
`;

export const tableHeaderRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  hints: TableHeaderMd,
};
