import styles from "./Tabs.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { createComponentRenderer } from "../../components-core/renderers";

import { MemoizedItem } from "../container-helpers";
import { Tabs, defaultProps } from "./TabsNative";
import { createMetadata, d, dComponent, dDidChange, dContextMenu } from "../metadata-helpers";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";

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
        `orientation, the buttons are at the top. Note: This property is ignored when ` +
        `accordionView is set to true.`,
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
      valueType: "string",
    },
    tabAlignment: {
      description:
        `This property controls how tabs are aligned within the tab header container in ` +
        `horizontal orientation. Use 'start' to align tabs to the left, 'end' to align to the ` +
        `right, 'center' to center the tabs, and 'stretch' to make tabs fill the full width ` +
        `of the header. Note: This property is ignored when orientation is set to 'vertical' ` +
        `or when accordionView is enabled.`,
      availableValues: ["start", "end", "center", "stretch"],
      defaultValue: defaultProps.tabAlignment,
      valueType: "string",
    },
    accordionView: {
      description:
        `When enabled, displays tabs in an accordion-like view where tab headers are stacked ` +
        `vertically and only the active tab's content is visible. Each tab header remains visible ` +
        `and clicking a header opens its content while closing others. When enabled, the ` +
        `orientation property is ignored.`,
      defaultValue: defaultProps.accordionView,
      valueType: "boolean",
    },
    headerTemplate: {
      ...dComponent(`This property declares the template for the clickable tab area.`),
    },
  },
  events: {
    contextMenu: dContextMenu(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    next: {
      description: `This method selects the next tab. If the current tab is the last one, it wraps around to the first tab.`,
      signature: "next(): void",
    },
    prev: {
      description: `This method selects the previous tab. If the current tab is the first one, it wraps around to the last tab.`,
      signature: "prev(): void",
    },
    setActiveTabIndex: {
      description: `This method sets the active tab by index (0-based).`,
      signature: "setActiveTabIndex(index: number): void",
    },
    setActiveTabById: {
      description: `This method sets the active tab by its ID.`,
      signature: "setActiveTabById(id: string): void",
    },
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
    [`textColor-trigger-${COMP}`]: "$color-primary-600",
    [`textColor-trigger-${COMP}--active`]: "$color-primary-900",
    [`textColor-trigger-${COMP}--hover`]: "$color-primary-900",
    [`gap-list-${COMP}`]: "0px",
  },
});

type ThemedTabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;

export const ThemedTabs = React.forwardRef<React.ElementRef<typeof Tabs>, ThemedTabsProps>(
  function ThemedTabs({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(TabsMd);
    return (
      <Tabs
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const tabsComponentRenderer = createComponentRenderer(
  COMP,
  TabsMd,
  ({ extractValue, node, renderChild, className, registerComponentApi, lookupEventHandler }) => {
    return (
      <Tabs
        id={node?.uid}
        className={className}
        headerRenderer={
          node?.props?.headerTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.headerTemplate! as any}
                  contextVars={{
                    $header: item,
                  }}
                  renderChild={renderChild}
                />
              )
            : undefined
        }
        activeTab={extractValue(node.props?.activeTab)}
        orientation={extractValue(node.props?.orientation)}
        tabAlignment={extractValue(node.props?.tabAlignment)}
        accordionView={extractValue(node.props?.accordionView)}
        onDidChange={lookupEventHandler("didChange")}
        onContextMenu={lookupEventHandler("contextMenu")}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </Tabs>
    );
  },
);
