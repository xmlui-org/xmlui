import { createMetadata, d } from "../../abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
// --- We cannot use this with nextra
// import componentSource from "./PageHeader.xmlui?raw";

const COMP = "PageHeader";

export const PageHeaderMd = createMetadata({
  status: "experimental",
  description:
    `The \`${COMP}\` component is a component that displays a title and an ` +
    `optional pre-title. The pre-title is displayed above the title.`,
  props: {
    preTitle: d("The pre-title to display above the title."),
    title: d("The title to display."),
  },
  defaultThemeVars: {
    "gap-PageHeader": "$space-2",
  },
});

const componentSource = `
<Component name="PageHeader">
  <HStack gap="$gap-PageHeader" verticalAlignment="center">
    <VStack gap="$space-tight">
      <Text when="{$props.preTitle !== undefined}" variant="subheading" value="{$props.preTitle}" />
      <H2 value="{$props.title}" />
    </VStack>
    <SpaceFiller />
    <Slot />
  </HStack>
</Component>
`;

export const pageHeaderRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: PageHeaderMd,
};
