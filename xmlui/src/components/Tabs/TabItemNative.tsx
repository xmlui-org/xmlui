import type { ForwardedRef } from "react";
import { forwardRef, useEffect, useId } from "react";
import { Content } from "@radix-ui/react-tabs";

import styles from "../Tabs/Tabs.module.scss";

import type { Tab } from "../abstractions";
import { useTabContext } from "./TabContext";

export const TabItemComponent = forwardRef(function TabItemComponent(
  { children, label, headerRenderer, style, id, activated, ...rest }: Tab,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const innerId = useId();
  const { register, unRegister, activeTabId, getTabItems } = useTabContext();

  useEffect(() => {
    register({
      label,
      headerRenderer,
      innerId,
      id, // Store the external id (can be undefined)
    });
  }, [innerId, id, label, headerRenderer, register]);

  useEffect(() => {
    return () => {
      unRegister(innerId);
    };
  }, [innerId, unRegister]);

  useEffect(() => {
    if (activeTabId === innerId && activated) {
      activated();
    }
  }, [activeTabId, innerId, activated]);

  if (activeTabId !== innerId) return null;

  // Find the index of this tab for ordering
  const tabItems = getTabItems();
  const tabIndex = tabItems?.findIndex(item => item.innerId === innerId) ?? 0;
  const contentOrder = tabIndex * 2 + 1;

  return (
    <Content
      {...rest}
      key={innerId}
      value={innerId}
      className={styles.tabsContent}
      ref={forwardedRef}
      style={{ ...style, order: contentOrder }}
    >
      {children}
    </Content>
  );
});
