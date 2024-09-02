import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";

/**
 * (Document it)
 */
export interface IconInfoCardComponentDef extends ComponentDef<"IconInfoCard"> {
  props: {
    /**
     * @descriptionRef
     */
    height?: string;
    /**
     * @descriptionRef
     */
    iconBackgroundColor?: string;
    /**
     * @descriptionRef
     */
    iconName?: string;
  };
}

export const iconInfoCardRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: {
    name: "IconInfoCard",
    component: {
      type: "Card",
      props: {
        height: "{$props.height}",
      },
      children: [
        {
          type: "HStack",
          props: {
            gap: "$space-4",
            verticalAlignment: "center",
          },
          children: [
            {
              type: "CHStack",
              props: {
                backgroundColor: "{$props.iconBackgroundColor}",
                color: "white",
                width: "$space-10",
                height: "$space-10",
                radius: "$radius",
              },
              children: [
                {
                  type: "Icon",
                  props: {
                    name: "{$props.iconName}",
                    size: "$space-6",
                  },
                },
              ],
            },
            {
              type: "VStack",
              children: [
                {
                  type: "ChildrenSlot",
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
