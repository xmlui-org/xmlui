import type { ForwardedRef } from "react";
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as RTabs from "@radix-ui/react-tabs";
import styles from "./Tabs.module.scss";
import { TabContext, useTabContextValue } from "../Tabs/TabContext";
import { useEvent } from "../../components-core/utils/misc";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

type Props = {
  activeTab?: number;
  orientation?: "horizontal" | "vertical";
  tabRenderer?: (item: { label: string; isActive: boolean }) => ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const Tabs = forwardRef(function Tabs(
  {
    activeTab = 0,
    orientation = "vertical",
    tabRenderer,
    style,
    children,
    registerComponentApi,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { tabItems, tabContextValue } = useTabContextValue();
  const [activeIndex, setActiveIndex] = useState(activeTab);
  const currentTab = useMemo(() => {
    return tabItems[activeIndex]?.id;
  }, [activeIndex, tabItems]);

  useEffect(() => {
    tabContextValue.setActiveTabId(currentTab);
  }, [currentTab, tabContextValue]);

  useEffect(() => {
    if (activeTab !== undefined) {
      setActiveIndex(() => {
        const maxIndex = tabItems.length - 1;
        const newIndex = activeTab - 1;
        return newIndex < 0 ? 0 : newIndex > maxIndex ? maxIndex : newIndex;
      });
    }
  }, [activeTab, tabItems.length]);

  const next = useEvent(() => {
    setActiveIndex((prevIndex) => {
      const maxIndex = tabItems.length - 1;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  });

  useEffect(() => {
    registerComponentApi?.({
      next,
    });
  }, [next, registerComponentApi]);

  return (
    <TabContext.Provider value={tabContextValue}>
      <RTabs.Root
        ref={forwardedRef}
        className={styles.tabs}
        value={`${currentTab}`}
        onValueChange={(tab) => {
          const newIndex = tabItems.findIndex((item) => item.id === tab);
          if (newIndex !== activeIndex) {
            tabContextValue.setActiveTabId(tab);
            setActiveIndex(newIndex);
          }
        }}
        orientation={orientation}
        style={style}
      >
        <RTabs.List className={styles.tabsList}>
          {tabItems.map((tab) =>
            tabRenderer ? (
              <RTabs.Trigger key={tab.id} value={tab.id}>
                {tabRenderer({ label: tab.label, isActive: tab.id === currentTab })}
              </RTabs.Trigger>
            ) : (
              <RTabs.Trigger className={styles.tabTrigger} key={tab.id} value={tab.id}>
                {tab.label}
              </RTabs.Trigger>
            ),
          )}
          <div className={styles.filler} data-orientation={orientation} />
        </RTabs.List>
        {children}
      </RTabs.Root>
    </TabContext.Provider>
  );
});
