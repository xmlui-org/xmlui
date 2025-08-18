import type { ForwardedRef } from "react";
import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useEffect,
  useId,
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
import { noop } from "../../components-core/constants";

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
  onDidChange?: (index: number, id: string, label: string) => void;
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
    onDidChange = noop,
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { tabItems, tabContextValue } = useTabContextValue();
  const tabsId = id || useId();

  // Ensure activeTab is within valid bounds
  const validActiveTab = useMemo(() => {
    if (tabItems.length === 0) return 0;
    if (activeTab < 0) return 0;
    if (activeTab >= tabItems.length) return 0; // Default to first tab if out of bounds
    return activeTab;
  }, [activeTab, tabItems.length]);

  const [activeIndex, setActiveIndex] = useState(validActiveTab);
  const currentTab = useMemo(() => {
    return tabItems[activeIndex]?.innerId;
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
    // First try to find by external id, then by innerId
    let index = tabItems.findIndex((item) => item.id === tabId);
    if (index === -1) {
      index = tabItems.findIndex((item) => item.innerId === tabId);
    }
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
        id={tabsId}
        ref={forwardedRef}
        className={classnames(styles.tabs, className)}
        value={`${currentTab}`}
        onValueChange={(tab) => {
          const newIndex = tabItems.findIndex((item) => item.innerId === tab);
          if (newIndex !== activeIndex) {
            tabContextValue.setActiveTabId(tab);
            setActiveIndex(newIndex);
            onDidChange?.(newIndex, tab, tabItems[newIndex]?.label);
          }
        }}
        orientation={orientation}
        style={style}
      >
        <RTabsList className={styles.tabsList} role="tablist">
          {tabItems.map((tab, index) => (
            <RTabsTrigger
              key={tab.innerId}
              value={tab.innerId}
              asChild
            >
              <div
                role="tab"
                aria-label={tab.label}
                className={classnames(styles.tabTrigger, {
                  [styles.distributeEvenly]: distributeEvenly,
                })}
              >
                {
                  tab.headerRenderer ?
                    tab.headerRenderer({
                      ...(tab.id !== undefined && { id: tab.id }),
                      index,
                      label: tab.label,
                      isActive: tab.innerId === currentTab
                    })
                    : headerRenderer ?
                      headerRenderer({
                        ...(tab.id !== undefined && { id: tab.id }),
                        index,
                        label: tab.label,
                        isActive: tab.innerId === currentTab
                      })
                      : tab.label
                }
              </div>
            </RTabsTrigger>
          ))}
          {!distributeEvenly && !headerRenderer && (
            <div className={styles.filler} data-orientation={orientation} />
          )}
        </RTabsList>
        {children}
      </RTabsRoot>
    </TabContext.Provider>
  );
});
