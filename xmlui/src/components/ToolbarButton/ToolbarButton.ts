import { createMetadata, d } from "../../abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
// --- We cannot use this with nextra
// import componentSource from "./ToolbarButton.xmlui?raw";

const COMP = "ToolbarButton";

export const ToolbarButtonMd = createMetadata({
  status: "experimental",
  description: "This component is a button that is used in a toolbar.",
  props: {
    label: d("The label to display on the button."),
    icon: d("The icon to display on the button."),
  },
  defaultThemeVars: {
    "padding-horizontal-ToolbarButton": "$space-1",
    "padding-vertical-ToolbarButton": "$space-1",
  },
});

const componentSource = `
<Component name="ToolbarButton">
  <Button
    variant="ghost"
    themeColor="secondary"
    horizontalPadding="$padding-horizontal-ToolbarButton"
    verticalPadding="$padding-vertical-ToolbarButton"
    icon="{$props.icon}"
    label="{$props.label}"
    onClick="e => emitEvent('click', e)">
    <Slot />
  </Button>
</Component>
`;

export const toolbarButtonRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: ToolbarButtonMd,
};
