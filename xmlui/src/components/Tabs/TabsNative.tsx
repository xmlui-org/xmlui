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
  tabAlignment?: "start" | "end" | "center" | "stretch";
  accordionView?: boolean;
  headerRenderer?: (item: {
    id?: string;
    index: number;
    label: string;
    isActive: boolean;
  }) => ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
  className?: string;
  distributeEvenly?: boolean;
  onDidChange?: (index: number, id: string, label: string) => void;
  onContextMenu?: any;
};

export const defaultProps = {
  activeTab: 0,
  orientation: "horizontal" as "horizontal" | "vertical",
  tabAlignment: "start" as "start" | "end" | "center" | "stretch",
  accordionView: false,
  distributeEvenly: false,
};

export const Tabs = forwardRef(function Tabs(
  {
    activeTab = defaultProps.activeTab,
    orientation = defaultProps.orientation,
    tabAlignment = defaultProps.tabAlignment,
    accordionView = defaultProps.accordionView,
    headerRenderer,
    style,
    children,
    id,
    registerComponentApi,
    className,
    distributeEvenly = defaultProps.distributeEvenly,
    onDidChange = noop,
    onContextMenu,
    ...rest
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { tabItems, tabContextValue } = useTabContextValue();
  const _id = useId();
  const tabsId = id || _id;

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

  // Accordion view: render tabs with interleaved headers and content
  if (accordionView) {
    return (
      <TabContext.Provider value={tabContextValue}>
        <div
          {...rest}
          id={tabsId}
          ref={forwardedRef}
          className={classnames(className, styles.tabs, styles.accordionView)}
          style={style}
        >
          <RTabsRoot
            value={`${currentTab}`}
            onValueChange={(tab) => {
              const tabItem = tabItems.find((item) => item.innerId === tab);
              const newIndex = tabItems.findIndex((item) => item.innerId === tab);
              if (newIndex !== activeIndex) {
                tabContextValue.setActiveTabId(tab);
                setActiveIndex(newIndex);
                onDidChange?.(newIndex, tabItem.id || tabItem.innerId, tabItem?.label);
                if (typeof window !== "undefined") {
                  const w = window as any;
                  if (Array.isArray(w._xsLogs)) {
                    w._xsLogs.push({
                      ts: Date.now(),
                      perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
                      traceId: w._xsCurrentTrace,
                      kind: "focus:change",
                      component: "Tabs",
                      tabIndex: newIndex,
                      tabId: tabItem.id || tabItem.innerId,
                      tabLabel: tabItem?.label,
                    });
                  }
                }
              }
            }}
            orientation="vertical"
            className={styles.accordionRoot}
          >
            <div className={styles.accordionInterleaved}>
              <RTabsList className={styles.accordionList}>
                {tabItems.map((tab, index) => (
                  <RTabsTrigger 
                    key={tab.innerId} 
                    value={tab.innerId} 
                    asChild
                    style={{ order: index * 2 }}
                  >
                    <div
                      role="tab"
                      aria-label={tab.label}
                      className={classnames(styles.tabTrigger, styles.accordionTrigger)}
                    >
                      {tab.headerRenderer
                        ? tab.headerRenderer({
                            ...(tab.id !== undefined && { id: tab.id }),
                            index,
                            label: tab.label,
                            isActive: tab.innerId === currentTab,
                          })
                        : headerRenderer
                          ? headerRenderer({
                              ...(tab.id !== undefined && { id: tab.id }),
                              index,
                              label: tab.label,
                              isActive: tab.innerId === currentTab,
                            })
                          : tab.label}
                    </div>
                  </RTabsTrigger>
                ))}
              </RTabsList>
              {children}
            </div>
          </RTabsRoot>
        </div>
      </TabContext.Provider>
    );
  }

  // Standard tabs view
  return (
    <TabContext.Provider value={tabContextValue}>
      <RTabsRoot
        {...rest}
        id={tabsId}
        ref={forwardedRef}
        className={classnames(className, styles.tabs)}
        value={`${currentTab}`}
        onContextMenu={onContextMenu}
        onValueChange={(tab) => {
          const tabItem = tabItems.find((item) => item.innerId === tab);
          const newIndex = tabItems.findIndex((item) => item.innerId === tab);
          if (newIndex !== activeIndex) {
            tabContextValue.setActiveTabId(tab);
            setActiveIndex(newIndex);
            onDidChange?.(newIndex, tabItem.id || tabItem.innerId, tabItem?.label);
            if (typeof window !== "undefined") {
              const w = window as any;
              if (Array.isArray(w._xsLogs)) {
                w._xsLogs.push({
                  ts: Date.now(),
                  perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
                  traceId: w._xsCurrentTrace,
                  kind: "focus:change",
                  component: "Tabs",
                  tabIndex: newIndex,
                  tabId: tabItem.id || tabItem.innerId,
                  tabLabel: tabItem?.label,
                });
              }
            }
          }
        }}
        orientation={orientation}
        style={style}
      >
        <RTabsList
          className={classnames(styles.tabsList, {
            [styles.alignStart]: tabAlignment === "start",
            [styles.alignEnd]: tabAlignment === "end",
            [styles.alignCenter]: tabAlignment === "center",
            [styles.alignStretch]: tabAlignment === "stretch",
          })}
          role="tablist"
        >
          {!distributeEvenly && !headerRenderer && tabAlignment === "end" && (
            <div className={styles.filler} data-orientation={orientation} />
          )}
          {!distributeEvenly && !headerRenderer && tabAlignment === "center" && (
            <div className={styles.filler} data-orientation={orientation} />
          )}
          {tabItems.map((tab, index) => (
            <RTabsTrigger key={tab.innerId} value={tab.innerId} asChild>
              <div
                role="tab"
                aria-label={tab.label}
                className={classnames(styles.tabTrigger, {
                  [styles.distributeEvenly]: distributeEvenly || tabAlignment === "stretch",
                })}
              >
                {tab.headerRenderer
                  ? tab.headerRenderer({
                      ...(tab.id !== undefined && { id: tab.id }),
                      index,
                      label: tab.label,
                      isActive: tab.innerId === currentTab,
                    })
                  : headerRenderer
                    ? headerRenderer({
                        ...(tab.id !== undefined && { id: tab.id }),
                        index,
                        label: tab.label,
                        isActive: tab.innerId === currentTab,
                      })
                    : tab.label}
              </div>
            </RTabsTrigger>
          ))}
          {!distributeEvenly && !headerRenderer && tabAlignment !== "stretch" && (tabAlignment === "start" || tabAlignment === "center") && (
            <div className={styles.filler} data-orientation={orientation} />
          )}
        </RTabsList>
        {children}
      </RTabsRoot>
    </TabContext.Provider>
  );
});
