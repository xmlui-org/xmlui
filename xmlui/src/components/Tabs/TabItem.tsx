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
    headerTemplate: dComponent("This property allows the customization of the TabItem header."),
  },
  contextVars: {
    $header: d("This context value represents the header context with props: id (optional), index, label, isActive."),
  },
});

export const tabItemComponentRenderer = createComponentRenderer(
  COMP,
  TabItemMd,
  (rendererContext) => {
    const { node, renderChild, extractValue } = rendererContext;
    return (
      <TabItemComponent id={extractValue(node.uid)} label={extractValue(node.props.label)} headerRenderer={node.props.headerTemplate
        ? (item) => {
            return (
              <MemoizedItem
                node={node.props.headerTemplate}
                itemKey="$header"
                contextVars={{
                  $header: {
                    id: item.id,
                    index: item.index,
                    label: item.label,
                    isActive: item.isActive,
                  },
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
