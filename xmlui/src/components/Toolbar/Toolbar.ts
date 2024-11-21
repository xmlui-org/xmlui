import { CompoundComponentDef, createMetadata, d } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";
import { xmlUiMarkupToComponent } from "@components-core/xmlui-parser";
import componentSource from "./Toolbar.xmlui?raw";

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

const compoundComponentDef = xmlUiMarkupToComponent(componentSource).component as CompoundComponentDef;
if (!compoundComponentDef) {
  throw new Error(`Failed to parse ${COMP} component definition during build.`);
}

export const toolbarRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef,
  hints: ToolbarMd,
};
