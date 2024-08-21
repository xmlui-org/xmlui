import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

/**
 * (Document it)
 */
export interface TableHeaderComponentDef extends ComponentDef<"TableHeader"> {
  props: {
    /**
     * @descriptionRef
     */
    title?: string;
  };
}

export const tableHeaderRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "TableHeader",
    component: {
      type: "VStack",
      props: {
        verticalAlignment: "center",
        verticalPadding: "$padding-vertical-TableHeader",
        horizontalPadding: "$padding-horizontal-TableHeader",
      },
      children: [
        {
          type: "Text",
          props: {
            variant: "strong",
            value: "{$props.title}",
          },
        },
      ],
    },
  },
  hints: {
    defaultThemeVars: {
      "padding-vertical-TableHeader": "$space-4",
      "padding-horizontal-TableHeader": "$space-5",
    },
  },
};
