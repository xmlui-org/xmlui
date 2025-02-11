import { createMetadata, d } from "../../abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
// --- We cannot use this with nextra
// import componentSource from "./Toolbar.xmlui?raw";

const COMP = "Toolbar";

export const ToolbarMd = createMetadata({
  status: "experimental",
  description: "This component is a container for a toolbar.",
  props: {
    alignment: d("The alignment of the toolbar."),
  },
  defaultThemeVars: {
    "gap-Toolbar": "$space-2",
  },
});

const componentSource = `
<Component name="Toolbar">
  <HStack 
    gap="$gap-Toolbar" 
    verticalAlignment="center"
    horizontalAlignment="{$props.alignment ?? 'end' }">
    <Slot />
  </HStack>
</Component>
`;

export const toolbarRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: ToolbarMd,
};
