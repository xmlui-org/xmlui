import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

/**
 * (Document it)
 */
export interface PageHeaderComponentDef
  extends ComponentDef<"PageHeader"> {
  props: {
    /**
     * @descriptionRef
     */
    preTitle?: string;
    /**
     * @descriptionRef
     */
    title?: string;
  };
}

export const pageHeaderRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "PageHeader",
    component: {
      type: "HStack",
      props: {
        gap: "$gap-PageHeader",
        verticalAlignment: "center",
      },
      children: [
        {
          type: "VStack",
          children: [
            {
              type: "Text",
              props: {
                variant: "subheading",
                when: "{$props.preTitle !== undefined}",
                value: "{$props.preTitle}",
              },
            },
            {
              type: "H2",
              props: {
                value: "{$props.title}",
                margin: "0",
              },
            },
          ],
        },
        {
          type: "SpaceFiller",
        },
        {
          type: "ChildrenSlot",
        },
      ],
    },
  },
  hints: {
    defaultThemeVars: {
        "gap-PageHeader": "$space-2",
    }
  }
};
