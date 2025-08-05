import type { ForwardedRef } from "react";
import { forwardRef, useEffect, useId } from "react";
import { Content } from "@radix-ui/react-tabs";

import styles from "../Tabs/Tabs.module.scss";

import type { Tab } from "../abstractions";
import { useTabContext } from "./TabContext";

export const TabItemComponent = forwardRef(function TabItemComponent(
  { children, label, labelRenderer, style }: Tab,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { register, unRegister, activeTabId } = useTabContext();

  useEffect(() => {
    register({
      label,
      labelRenderer,
      id,
    });
  }, [id, label, labelRenderer, register]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);

  if (activeTabId !== id) return null;

  return (
    <Content key={id} value={id} className={styles.tabsContent} ref={forwardedRef} style={style}>
      {children}
    </Content>
  );
});
