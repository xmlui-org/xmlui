import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import * as RTabs from "@radix-ui/react-tabs";
import styles from "./Tabs.module.scss";
import { TabContext, useTabContextValue } from "@components/Tabs/TabContext";
import { useEvent } from "@components-core/utils/misc";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

type Props = {
  activeTab?: number;
  orientation?: "horizontal" | "vertical";
  tabRenderer?: (item: { label: string; isActive: boolean }) => ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const Tabs = ({
  activeTab = 0,
  orientation = "vertical",
  tabRenderer,
  style,
  children,
  registerComponentApi,
}: Props) => {
  const { tabItems, tabContextValue } = useTabContextValue();
  const [currentTab, setCurrentTab] = useState(`${activeTab}`);

  useEffect(() => {
    const _activeTab = activeTab - 1;
    const maxIndex = tabItems.length > 0 ? tabItems.length - 1 : 0;
    const _newActiveTab = _activeTab < 0 ? 0 : _activeTab > maxIndex ? maxIndex : _activeTab;
    setCurrentTab(`${_newActiveTab}`);
  }, [tabItems, activeTab]);

  const next = useEvent(() => {
    const nextIndex = parseInt(currentTab) + 1;
    const maxIndex = tabItems.length > 0 ? tabItems.length - 1 : 0;
    setCurrentTab(`${nextIndex > maxIndex ? 0 : nextIndex}`);
  });

  useEffect(() => {
    registerComponentApi?.({
      next,
    });
  }, [next, registerComponentApi]);

  return (
    <TabContext.Provider value={tabContextValue}>
      {children}
      <RTabs.Root
        className={styles.tabs}
        value={`${currentTab}`}
        onValueChange={(tab) => {
          setCurrentTab(tab);
        }}
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
