import type { ForwardedRef } from "react";
import { forwardRef, memo, useMemo, useEffect, useId } from "react";
import { Content } from "@radix-ui/react-tabs";
import classnames from "classnames";

import styles from "../Tabs/Tabs.module.scss";

import type { Tab } from "../abstractions";
import { useTabContext } from "./TabContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

export const TabItemComponent = memo(forwardRef(function TabItemComponent(
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

  const tabItems = getTabItems();
  const tabIndex = tabItems?.findIndex(item => item.innerId === innerId) ?? 0;
  const contentOrder = tabIndex * 2 + 1;

  const contentStyle = useMemo(
    () => ({
      ...style,
      order: contentOrder,
      ...(keepMounted && !isActive ? { display: "none" } as const : {}),
    }),
    [style, contentOrder, keepMounted, isActive],
  );

  if (!isActive && !keepMounted) return null;

  return (
    <Content
      {...rest}
      key={innerId}
      value={innerId}
      forceMount={keepMounted ? true : undefined}
      className={classnames(styles.tabsContent, classes?.[COMPONENT_PART_KEY], className)}
      ref={forwardedRef}
      style={contentStyle}
    >
      {children}
    </Content>
  );
}));
