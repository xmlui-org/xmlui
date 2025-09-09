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
  const { register, unRegister, activeTabId } = useTabContext();

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

  return (
    <Content
      {...rest}
      key={innerId}
      value={innerId}
      className={styles.tabsContent}
      ref={forwardedRef}
      style={style}
    >
      {children}
    </Content>
  );
});
