import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { CompoundComponentRendererInfo } from "@abstractions/RendererDefs";
import { desc } from "@components-core/descriptorHelper";

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

export const TableHeaderMd: ComponentDescriptor<TableHeaderComponentDef> = {
  displayName: "TableHeader",
  description:
    "The `TableHeader` component can be used within a `Table` to define a particular table column's visual properties and data bindings.",
  props: {
    title: desc("The title of the table header."),
  },
  defaultThemeVars: {
    "padding-vertical-TableHeader": "$space-4",
    "padding-horizontal-TableHeader": "$space-5",
  },
};

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
  hints: TableHeaderMd,
};
