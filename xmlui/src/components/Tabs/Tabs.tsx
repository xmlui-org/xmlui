import styles from "./Tabs.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../components-core/renderers";

import { MemoizedItem } from "../container-helpers";
import { dComponent } from "../metadata-helpers";
import { Tabs, defaultProps } from "./TabsNative";

const COMP = "Tabs";

export const TabsMd = createMetadata({
  status: "experimental",
  description:
    "`Tabs` enables users to switch among content panels using clickable tab headers. " +
    "It provides an efficient way to present multiple related sections in a single " +
    "interface area, with each tab containing distinct content defined by " +
    "[TabItem](/components/TabItem) components.",
  props: {
    activeTab: d(
      `This property indicates the index of the active tab. The indexing starts from 0, ` +
        `representing the starting (leftmost) tab. If not set, the first tab is selected by default.`,
    ),
    orientation: {
      description:
        `This property indicates the orientation of the component. In horizontal orientation, ` +
        `the tab sections are laid out on the left side of the content panel, while in vertical ` +
        `orientation, the buttons are at the top.`,
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
      valueType: "string",
    },
    tabTemplate: {
      description: `This property declares the template for the clickable tab area.`,
      valueType: "ComponentDef",
      isInternal: true,
    },
  },
  apis: {
    next: d(`This method selects the next tab.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // [`backgroundColor-${COMP}`]: "transparent",
    [`borderStyle-${COMP}`]: "solid",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderColor-active-${COMP}`]: "$color-primary",
    [`borderWidth-${COMP}`]: "2px",
    // [`backgroundColor-trigger-${COMP}`]: "transparent",
    [`backgroundColor-trigger-${COMP}--hover`]: "$color-surface-100",
    [`padding-trigger-${COMP}`]: "$space-4",
    // [`backgroundColor-list-${COMP}`]: "$color-primary-50",
    // [`textColor-trigger-${COMP}`]: "$color-primary-100",
  },
});

export const tabsComponentRenderer = createComponentRenderer(
  COMP,
  TabsMd,
  ({ extractValue, node, renderChild, layoutCss, registerComponentApi }) => {
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
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </Tabs>
    );
  },
);
