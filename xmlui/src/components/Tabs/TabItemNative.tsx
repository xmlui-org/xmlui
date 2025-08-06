import type { ForwardedRef } from "react";
import { forwardRef, useEffect, useId } from "react";
import { Content } from "@radix-ui/react-tabs";

import styles from "../Tabs/Tabs.module.scss";

import type { Tab } from "../abstractions";
import { useTabContext } from "./TabContext";

export const TabItemComponent = forwardRef(function TabItemComponent(
  { children, label, headerRenderer, id, style }: Tab,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const tabId = useId();
  const { register, unRegister, activeTabId } = useTabContext();

  useEffect(() => {
    register({
      label,
      headerRenderer,
      innerId: tabId,
      id,
    });
  }, [tabId, id, label, headerRenderer, register]);

  useEffect(() => {
    return () => {
      unRegister(tabId);
    };
  }, [tabId, unRegister]);

  if (activeTabId !== tabId) return null;

  return (
    <Content
      key={tabId}
      value={tabId}
      className={styles.tabsContent}
      ref={forwardedRef}
      style={style}
    >
      {children}
    </Content>
  );
});
