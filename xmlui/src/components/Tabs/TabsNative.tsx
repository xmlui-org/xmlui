import {
  type CSSProperties,
  ForwardedRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
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

export const Tabs = forwardRef(function Tabs(
  {
    activeTab = 1,
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
    const _activeTab = activeTab - 1;
    const maxIndex = tabItems.length > 0 ? tabItems.length - 1 : 0;
    const _newActiveTab = _activeTab < 0 ? 0 : _activeTab > maxIndex ? maxIndex : _activeTab;
    setActiveIndex(_newActiveTab);
  }, [tabItems, activeTab]);

  const next = useEvent(() => {
    const nextIndex = tabItems.findIndex(item => item.id === currentTab) + 1;
    const maxIndex = tabItems.length > 0 ? tabItems.length - 1 : 0;
    setActiveIndex(nextIndex > maxIndex ? 0 : nextIndex);
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
          setActiveIndex(tabItems.findIndex((item) => item.id === tab));
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
