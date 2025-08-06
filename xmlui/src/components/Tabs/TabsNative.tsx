import type { ForwardedRef } from "react";
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Root as RTabsRoot,
  List as RTabsList,
  Trigger as RTabsTrigger,
} from "@radix-ui/react-tabs";

import styles from "./Tabs.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useEvent } from "../../components-core/utils/misc";
import { TabContext, useTabContextValue } from "./TabContext";
import classnames from "classnames";

type Props = {
  id?: string;
  activeTab?: number;
  orientation?: "horizontal" | "vertical";
  headerRenderer?: (item: { id?: string; index: number; label: string; isActive: boolean }) => ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  className?: string;
  distributeEvenly?: boolean;
};

export const defaultProps = {
  activeTab: 0,
  orientation: "horizontal" as "horizontal" | "vertical",
  distributeEvenly: false,
};

export const Tabs = forwardRef(function Tabs(
  {
    activeTab = defaultProps.activeTab,
    orientation = defaultProps.orientation,
    headerRenderer,
    style,
    children,
    id,
    registerComponentApi,
    className,
    distributeEvenly = defaultProps.distributeEvenly,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { tabItems, tabContextValue } = useTabContextValue();
  
  // Ensure activeTab is within valid bounds
  const validActiveTab = useMemo(() => {
    if (tabItems.length === 0) return 0;
    if (activeTab < 0) return 0;
    if (activeTab >= tabItems.length) return 0; // Default to first tab if out of bounds
    return activeTab;
  }, [activeTab, tabItems.length]);
  
  const [activeIndex, setActiveIndex] = useState(validActiveTab);
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
        const newIndex = activeTab; // activeTab should be 0-based index
        return newIndex < 0 ? 0 : newIndex > maxIndex ? 0 : newIndex; // Default to first tab (0) when out of bounds
      });
    }
  }, [activeTab, tabItems.length]);

  const next = useEvent(() => {
    setActiveIndex((prevIndex) => {
      const maxIndex = tabItems.length - 1;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  });

  const prev = useEvent(() => {
    setActiveIndex((prevIndex) => {
      const maxIndex = tabItems.length - 1;
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  });

  const setActiveTabIndex = useEvent((index: number) => {
    if (index >= 0 && index < tabItems.length) {
      setActiveIndex(index);
    }
  });

  const setActiveTabById = useEvent((tabId: string) => {
    const index = tabItems.findIndex((item) => item.id === tabId);
    if (index !== -1) {
      setActiveIndex(index);
    }
  });

  useEffect(() => {
    registerComponentApi?.({
      next,
      prev,
      setActiveTabIndex,
      setActiveTabById,
    });
  }, [next, prev, setActiveTabIndex, setActiveTabById, registerComponentApi]);

  return (
    <TabContext.Provider value={tabContextValue}>
      <RTabsRoot
        id={id}
        ref={forwardedRef}
        className={classnames(styles.tabs, className)}
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
        <RTabsList className={styles.tabsList}>
          {tabItems.map((tab, index) =>
            tab.headerRenderer ? (
              <RTabsTrigger
                role="tab"
                className={classnames(styles.tabTrigger, {
                  [styles.distributeEvenly]: distributeEvenly,
                })}
                key={tab.id}
                value={tab.id}
              >
                {tab.headerRenderer({ id: tab.id, index, label: tab.label, isActive: tab.id === currentTab })}
              </RTabsTrigger>
            ) : headerRenderer ? (
              <RTabsTrigger key={tab.id} value={tab.id} asChild={true} role="tab">
                {headerRenderer({ id: tab.id, index, label: tab.label, isActive: tab.id === currentTab })}
              </RTabsTrigger>
            ) : (
              <RTabsTrigger
                role="tab"
                className={classnames(styles.tabTrigger, {
                  [styles.distributeEvenly]: distributeEvenly,
                })}
                key={tab.id}
                value={tab.id}
              >
                {tab.label}
              </RTabsTrigger>
            ),
          )}
          {!distributeEvenly && !headerRenderer && (
            <div className={styles.filler} data-orientation={orientation} />
          )}
        </RTabsList>
        {children}
      </RTabsRoot>
    </TabContext.Provider>
  );
});
