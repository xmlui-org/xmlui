import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { TabItemComponent } from "./TabItemNative";
import { dLabel } from "../metadata-helpers";

const COMP = "TabItem";

export const TabItemMd = createMetadata({
  description:
    "`TabItem` defines individual tabs within a [Tabs](/components/Tabs) component, " +
    "providing both the tab header label and the content that displays when the tab " +
    "is selected. As a non-visual structural component, it serves as a container that " +
    "organizes content into distinct, switchable sections.",
  docFolder: "Tabs",
  props: {
    label: dLabel(),
  },
});

export const tabItemComponentRenderer = createComponentRenderer(
  COMP,
  TabItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue } = rendererContext;
    return (
      <TabItemComponent label={extractValue(node.props.label)}>
        {renderChild(node.children)}
      </TabItemComponent>
    );
  },
);
