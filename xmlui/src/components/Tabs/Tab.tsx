import { useEffect, useId } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { Tab } from "@components/abstractions";
import { createComponentRenderer } from "@components-core/renderers";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { useTabContext } from "@components/Tabs/TabContext";

function TabComponent(props: Tab) {
  const id = useId();
  const { register, unRegister } = useTabContext();
  useEffect(() => {
    register({
      ...props,
      id,
    });
  }, [id, props, register]);
  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);
  return null;
}

// =====================================================================================================================
// XMLUI Tab component definition

export interface TabComponentDef extends ComponentDef<"TabItem"> {
  props: {
    /** @descriptionRef */
    label: string;
  };
}

export const TabMd: ComponentDescriptor<TabComponentDef> = {
  displayName: "TabItem",
  description:
    "TabItem is a non-visual component describing a tab. Tabs component may use nested Tab instances from which the user can select.",
  props: {
    label: desc("The label of the tab."),
  },
};

export const tabComponentRenderer = createComponentRenderer<TabComponentDef>(
  "TabItem",
  (rendererContext) => {
    const { node, renderChild, extractValue } = rendererContext;
    return (
      <TabComponent label={extractValue(node.props.label)} content={renderChild(node.children)} />
    );
  },
  TabMd,
);
