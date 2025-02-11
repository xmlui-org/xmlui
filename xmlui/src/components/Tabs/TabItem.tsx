import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { TabItemComponent } from "./TabItemNative";
import { dLabel } from "../metadata-helpers";

const COMP = "TabItem";

export const TabItemMd = createMetadata({
  description:
    `\`${COMP}\` is a non-visual component describing a tab. Tabs component may use nested ` +
    `${COMP} instances from which the user can select.`,
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
