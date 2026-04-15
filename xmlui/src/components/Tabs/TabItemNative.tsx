import type { ForwardedRef } from "react";
import { forwardRef, useEffect, useId } from "react";
import { Content } from "@radix-ui/react-tabs";
import classnames from "classnames";

import styles from "../Tabs/Tabs.module.scss";

import type { Tab } from "../abstractions";
import { useTabContext } from "./TabContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

export const TabItemComponent = forwardRef(function TabItemComponent(
  { children, label, headerRenderer, style, id, className, classes, activated, ...rest }: Tab,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const innerId = useId();
  const { register, unRegister, activeTabId, getTabItems, keepMounted } = useTabContext();

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

  const isActive = activeTabId === innerId;

  if (!isActive && !keepMounted) return null;

  // Find the index of this tab for ordering
  const tabItems = getTabItems();
  const tabIndex = tabItems?.findIndex(item => item.innerId === innerId) ?? 0;
  const contentOrder = tabIndex * 2 + 1;

  return (
    <Content
      {...rest}
      key={innerId}
      value={innerId}
      forceMount={keepMounted ? true : undefined}
      className={classnames(styles.tabsContent, classes?.[COMPONENT_PART_KEY], className)}
      ref={forwardedRef}
      style={{
        ...style,
        order: contentOrder,
        ...(keepMounted && !isActive ? { display: "none" } : {}),
      }}
    >
      {children}
    </Content>
  );
});
