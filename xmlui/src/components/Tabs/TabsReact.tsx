import type { CSSProperties, HTMLAttributes } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { defaultProps } from "./Tabs.defaults";
import styles from "./Tabs.module.scss";
import { TabsContext, type RegisteredTab } from "./TabContext";

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onContextMenu"> & {
  accordionView?: boolean;
  activeTab?: number;
  children?: ReactNode;
  distributeEvenly?: boolean;
  gap?: string;
  keepMounted?: boolean;
  onContextMenu?: HTMLAttributes<HTMLDivElement>["onContextMenu"];
  onDidChange?: (index: number, id: string, label: string) => void | Promise<void>;
  orientation?: "horizontal" | "vertical";
  registerComponentApi?: (api: Record<string, unknown>) => void;
  tabAlignment?: "start" | "end" | "center" | "stretch";
};

export const TabsComponent = forwardRef<HTMLDivElement, TabsProps>(function TabsComponent(
  {
    accordionView = defaultProps.accordionView,
    activeTab = defaultProps.activeTab,
    children,
    className,
    distributeEvenly = defaultProps.distributeEvenly,
    gap,
    keepMounted = defaultProps.keepMounted,
    onContextMenu,
    onDidChange,
    orientation = defaultProps.orientation,
    registerComponentApi,
    style,
    tabAlignment = defaultProps.tabAlignment,
    ...rest
  },
  ref,
) {
  const [tabs, setTabs] = useState<RegisteredTab[]>([]);
  const [activeIndex, setActiveIndex] = useState(activeTab);
  const sortedTabs = useMemo(() => [...tabs].sort((a, b) => a.index - b.index), [tabs]);
  const normalizedActiveIndex = sortedTabs.length === 0
    ? 0
    : activeIndex < 0 || activeIndex >= sortedTabs.length
      ? 0
      : activeIndex;
  const activeTabItem = sortedTabs[normalizedActiveIndex];
  const resolvedKeepMounted = keepMounted ?? false;
  const resolvedOrientation = accordionView ? "horizontal" : orientation;

  useEffect(() => {
    setActiveIndex(activeTab);
  }, [activeTab]);

  const register = useCallback((tab: RegisteredTab) => {
    setTabs((current) => {
      const next = current.filter((candidate) => candidate.innerId !== tab.innerId);
      next.push(tab);
      return next;
    });
  }, []);

  const unregister = useCallback((innerId: string) => {
    setTabs((current) => current.filter((candidate) => candidate.innerId !== innerId));
  }, []);

  const selectIndex = useCallback((index: number) => {
    if (index < 0 || index >= sortedTabs.length) {
      return;
    }
    setActiveIndex(index);
    const tab = sortedTabs[index];
    if (tab) {
      tab.activated?.();
      void onDidChange?.(index, tab.id || tab.innerId, tab.label);
    }
  }, [onDidChange, sortedTabs]);

  const next = useCallback(() => {
    if (sortedTabs.length === 0) {
      return;
    }
    selectIndex(normalizedActiveIndex >= sortedTabs.length - 1 ? 0 : normalizedActiveIndex + 1);
  }, [normalizedActiveIndex, selectIndex, sortedTabs.length]);

  const prev = useCallback(() => {
    if (sortedTabs.length === 0) {
      return;
    }
    selectIndex(normalizedActiveIndex <= 0 ? sortedTabs.length - 1 : normalizedActiveIndex - 1);
  }, [normalizedActiveIndex, selectIndex, sortedTabs.length]);

  const setActiveTabIndex = useCallback((index: number) => {
    selectIndex(index);
  }, [selectIndex]);

  const setActiveTabById = useCallback((id: string) => {
    const index = sortedTabs.findIndex((tab) => tab.id === id || tab.innerId === id);
    if (index >= 0) {
      selectIndex(index);
    }
  }, [selectIndex, sortedTabs]);

  useEffect(() => {
    registerComponentApi?.({ next, prev, setActiveTabIndex, setActiveTabById });
  }, [next, prev, registerComponentApi, setActiveTabById, setActiveTabIndex]);

  const contextValue = useMemo(() => ({
    activeId: activeTabItem?.innerId,
    keepMounted: resolvedKeepMounted,
    register,
    unregister,
  }), [activeTabItem?.innerId, register, resolvedKeepMounted, unregister]);

  const mergedStyle = {
    ...(style as CSSProperties),
    ...(gap !== undefined ? { "--xmlui-paddingTop-TabItem": gap } as CSSProperties : {}),
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        {...rest}
        ref={ref}
        className={cx(
          styles.tabs,
          styles[resolvedOrientation],
          accordionView && styles.accordionView,
          className,
        )}
        data-orientation={resolvedOrientation}
        onContextMenu={onContextMenu}
        style={mergedStyle}
      >
        <div hidden aria-hidden="true">{children}</div>
        {accordionView ? (
          <div className={styles.tabsList} role="tablist" aria-orientation="vertical">
            {sortedTabs.map((tab, index) => renderAccordionTab(tab, index, normalizedActiveIndex, selectIndex))}
          </div>
        ) : (
          <>
            <div
              className={cx(
                styles.tabsList,
                tabAlignment === "start" && styles.alignStart,
                tabAlignment === "end" && styles.alignEnd,
                tabAlignment === "center" && styles.alignCenter,
                tabAlignment === "stretch" && styles.alignStretch,
              )}
              role="tablist"
              aria-orientation={resolvedOrientation}
            >
              {sortedTabs.map((tab, index) =>
                renderTabTrigger(tab, index, normalizedActiveIndex, selectIndex, distributeEvenly || tabAlignment === "stretch"),
              )}
            </div>
            {sortedTabs.map((tab, index) => renderPanel(tab, index, normalizedActiveIndex, resolvedKeepMounted))}
          </>
        )}
      </div>
    </TabsContext.Provider>
  );
});

function renderTabTrigger(
  tab: RegisteredTab,
  index: number,
  activeIndex: number,
  selectIndex: (index: number) => void,
  stretch: boolean,
) {
  const active = index === activeIndex;
  return (
    <button
      aria-controls={`${tab.innerId}-panel`}
      aria-selected={active}
      className={cx(styles.tabTrigger, stretch && styles.distributeEvenly)}
      data-state={active ? "active" : "inactive"}
      id={`${tab.innerId}-trigger`}
      key={tab.innerId}
      onClick={() => selectIndex(index)}
      role="tab"
      type="button"
    >
      {tab.header ?? tab.label}
    </button>
  );
}

function renderPanel(tab: RegisteredTab, index: number, activeIndex: number, keepMounted: boolean) {
  const active = index === activeIndex;
  if (!active && !keepMounted) {
    return null;
  }
  return (
    <div
      aria-labelledby={`${tab.innerId}-trigger`}
      className={cx(styles.tabsContent, !active && styles.hiddenContent)}
      data-state={active ? "active" : "inactive"}
      hidden={!active && keepMounted}
      id={`${tab.innerId}-panel`}
      key={`${tab.innerId}-panel`}
      role="tabpanel"
    >
      {tab.content}
    </div>
  );
}

function renderAccordionTab(
  tab: RegisteredTab,
  index: number,
  activeIndex: number,
  selectIndex: (index: number) => void,
) {
  return (
    <div className={styles.accordionItem} key={tab.innerId}>
      {renderTabTrigger(tab, index, activeIndex, selectIndex, true)}
      {renderPanel(tab, index, activeIndex, false)}
    </div>
  );
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
