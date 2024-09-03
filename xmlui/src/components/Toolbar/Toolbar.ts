import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

/**
 * (Document it)
 */
export interface ToolbarComponentDef
  extends ComponentDef<"Toolbar"> {
  props: {
    /**
     * @descriptionRef
     */
    alignment?: string;
  };
}

export const toolbarRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "Toolbar",
    component: {
      type: "HStack",
      props: {
        gap: "$gap-Toolbar",
        verticalAlignment: "center",
        horizontalAligmnent: "{$props.alignment ?? 'end' }",
      },
      children: [
        {
          type: "Slot",
        },
      ],
    },
  },
  hints: {
    defaultThemeVars: {
        "gap-Toolbar": "$space-2",
    }
  }
};
