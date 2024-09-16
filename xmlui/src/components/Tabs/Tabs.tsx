import { createMetadata, d } from "@abstractions/ComponentDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "./Tabs.module.scss";
import { MemoizedItem } from "@components/container-helpers";
import { dComponent } from "@components/metadata-helpers";
import { Tabs } from "./TabsNative";
import { createComponentRendererNew } from "@components-core/renderers";

const COMP = "Tabs";

export const TabsMd = createMetadata({
  description: `The \`${COMP}\` component provides a tabbed layout where each tab has a clickable label and content.`,
  props: {
    activeTab: d(
      `This property indicates the index of the active tab. The indexing starts from 0, ` +
        `representing the starting (leftmost) tab.`,
    ),
    orientation: d(
      `This property indicates the orientation of the component. In horizontal orientation, ` +
        `the tab sections are laid out on the left side of the content panel, while in vertical ` +
        `orientation, the buttons are at the top.`,
    ),
    tabTemplate: dComponent(`This property declares the template for the clickable tab area.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`color-bg-${COMP}`]: "$color-bg-primary",
    [`style-border-${COMP}`]: "solid",
    [`color-border-${COMP}`]: "$color-border",
    [`color-border-active-${COMP}`]: "$color-primary",
    [`thickness-border-${COMP}`]: "2px",
    [`color-bg-trigger-${COMP}`]: "$color-bg-primary",
    light: {
      [`color-bg-trigger-${COMP}--hover`]: "$color-primary-50",
    },
    dark: {
      [`color-bg-trigger-${COMP}--hover`]: "$color-primary-800",
    },
  },
});

export const tabsComponentRenderer = createComponentRendererNew(
  COMP,
  TabsMd,
  ({ extractValue, node, renderChild, layoutCss }) => {
    return (
      <Tabs
        style={layoutCss}
        tabRenderer={
          !!node?.props?.tabTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.tabTemplate! as any}
                  item={item}
                  renderChild={renderChild}
                />
              )
            : undefined
        }
        activeTab={extractValue(node.props?.activeTab)}
        orientation={extractValue(node.props?.orientation)}
      >
        {renderChild(node.children)}
      </Tabs>
    );
  },
);
