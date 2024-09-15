import { type CSSProperties, type ReactNode, useState } from "react";
import * as RTabs from "@radix-ui/react-tabs";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "./Tabs.module.scss";
import { createComponentRenderer } from "@components-core/renderers";
import { MemoizedItem } from "@components/container-helpers";
import { TabContext, useTabContextValue } from "@components/Tabs/TabContext";

type TabsProps = {
  activeTab?: number;
  orientation?: "horizontal" | "vertical";
  tabRenderer?: (item: { label: string; isActive: boolean }) => ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
};

const Tabs = ({
  activeTab = 0,
  orientation = "vertical",
  tabRenderer,
  style,
  children,
}: TabsProps) => {
  const { tabItems, tabContextValue } = useTabContextValue();
  const _activeTab =
    activeTab <= 0 ? 0 : activeTab > tabItems.length - 1 ? tabItems.length - 1 : activeTab;
  const [currentTab, setCurrentTab] = useState(`${_activeTab}`);

  return (
    <TabContext.Provider value={tabContextValue}>
      {children}
      <RTabs.Root
        className={styles.tabs}
        value={`${currentTab}`}
        onValueChange={setCurrentTab}
        orientation={orientation}
        style={style}
      >
        <RTabs.List className={styles.tabsList}>
          {tabItems.map((tab, index) =>
            tabRenderer ? (
              <RTabs.Trigger key={index} value={`${index}`}>
                {tabRenderer({ label: tab.label, isActive: `${index}` === currentTab })}
              </RTabs.Trigger>
            ) : (
              <RTabs.Trigger className={styles.tabTrigger} key={index} value={`${index}`}>
                {tab.label}
              </RTabs.Trigger>
            ),
          )}
          <div className={styles.filler} data-orientation={orientation} />
        </RTabs.List>
        {tabItems.map((tab, index) => (
          <RTabs.Content key={index} value={`${index}`} className={styles.tabsContent}>
            {tab.content}
          </RTabs.Content>
        ))}
      </RTabs.Root>
    </TabContext.Provider>
  );
};

/**
 * The \`Tabs\` component provides a tabbed layout where each tab has a clickable label and content.
 * The label is displayed on the button associated with the content.
 * @descriptionRef
 */
export interface TabsComponentDef extends ComponentDef<"Tabs"> {
  props: {
    /**
     * Indicates which tab index is active. The indexing starts from 0. The default value is 0 (aka the first tab from left to right).
     * @descriptionRef
     */
    activeTab?: number;
    /**
     * Indicates the orientation of the tabs.
     * Horizontal orientation has the tab buttons layed out on the left side of the content panel.
     * Vertical orientation places the buttons at the top.
     * The default value is vertical.
     * @descriptionRef
     */
    orientation?: "horizontal" | "vertical";
    /**
     * Defines how a tab button should look like.
     * @descriptionRef
     */
    tabTemplate?: ComponentDef;

    children?: ReactNode;
  };
}

export const TabsMd: ComponentDescriptor<TabsComponentDef> = {
  displayName: "Tabs",
  description: "Tabs component",
  props: {
    activeTab: desc("The active tab index"),
    orientation: desc("The orientation of the tabs"),
    tabTemplate: desc("The template for the tab"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-bg-Tabs": "$color-bg-primary",
    "style-border-Tabs": "solid",
    "color-border-Tabs": "$color-border",
    "color-border-active-Tabs": "$color-primary",
    "thickness-border-Tabs": "2px",
    "color-bg-trigger-Tabs": "$color-bg-primary",
    light: {
      "color-bg-trigger-Tabs--hover": "$color-primary-50",
    },
    dark: {
      "color-bg-trigger-Tabs--hover": "$color-primary-800",
    },
  },
};

export const tabsComponentRenderer = createComponentRenderer<TabsComponentDef>(
  "Tabs",
  ({ extractValue, node, renderChild, layoutCss }) => {
    return (
      <Tabs
        style={layoutCss}
        tabRenderer={
          !!node?.props?.tabTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.tabTemplate!}
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
  TabsMd,
);
