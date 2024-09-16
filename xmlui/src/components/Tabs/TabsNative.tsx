import { type CSSProperties, type ReactNode, useState } from "react";
import * as RTabs from "@radix-ui/react-tabs";
import styles from "./Tabs.module.scss";
import { TabContext, useTabContextValue } from "@components/Tabs/TabContext";

type Props = {
  activeTab?: number;
  orientation?: "horizontal" | "vertical";
  tabRenderer?: (item: { label: string; isActive: boolean }) => ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
};

export const Tabs = ({
  activeTab = 0,
  orientation = "vertical",
  tabRenderer,
  style,
  children,
}: Props) => {
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
