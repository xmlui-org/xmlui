import type {
  ComponentDef,
  CompoundComponentDef,
} from "@abstractions/ComponentDefs";

/**
 * (Document it)
 */
export interface PageHeaderComponentDef
  extends ComponentDef<"PageHeaderSection"> {
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

export const pageHeaderRenderer: CompoundComponentDef = {
  name: "PageHeader",
  component: {
    type: "HStack",
    props: {
      gap: "$space-4",
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
};
