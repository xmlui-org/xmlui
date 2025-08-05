import { createComponentRenderer } from "../../components-core/renderers";
import { TabItemComponent } from "./TabItemNative";
import { createMetadata, d, dComponent, dLabel } from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";

const COMP = "TabItem";

export const TabItemMd = createMetadata({
  status: "stable",
  description:
    "`TabItem` defines individual tabs within a [Tabs](/components/Tabs) component, " +
    "providing both the tab header label and the content that displays when the tab " +
    "is selected. As a non-visual structural component, it serves as a container that " +
    "organizes content into distinct, switchable sections.",
  docFolder: "Tabs",
  props: {
    label: dLabel(),
    labelTemplate: dComponent("This property allows the customization of the TabItem label."),
  },
  contextVars: {
    $item: d("This context value represents an item when you define a tab item template."),
  },
});

export const tabItemComponentRenderer = createComponentRenderer(
  COMP,
  TabItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue } = rendererContext;
    return (
      <TabItemComponent label={extractValue(node.props.label)} labelRenderer={node.props.labelTemplate
        ? (item) => {
            return (
              <MemoizedItem
                node={node.props.labelTemplate}
                item={item}
                context={{
                  $item: item,
                }}
                renderChild={renderChild}
              />
            );
          }
        : undefined}>
        {renderChild(node.children)}
      </TabItemComponent>
    );
  },
)
