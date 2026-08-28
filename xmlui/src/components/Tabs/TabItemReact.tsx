import type { ForwardedRef } from "react";
import { forwardRef, memo, useMemo, useEffect, useId, useRef } from "react";
import { Content } from "@radix-ui/react-tabs";
import classnames from "classnames";

import styles from "../Tabs/Tabs.module.scss";

import type { Tab } from "../abstractions";
import { useTabContext } from "./TabContext";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";

export const TabItemComponent = memo(forwardRef(function TabItemComponent(
  { children, label, headerRenderer, style, id, className, classes, activated, deactivated, ...rest }: Tab,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const innerId = useId();
  const { register, unRegister, activeTabId, getTabItems, keepMounted } = useTabContext();
  const wasActiveRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    register({
      label,
      headerRenderer,
      innerId,
      id, // Store the external id (can be undefined)
    });
  }, [innerId, id, label, headerRenderer, register]);

  useIsomorphicLayoutEffect(() => {
    return () => {
      unRegister(innerId);
    };
  }, [innerId, unRegister]);

  const isActive = activeTabId === innerId;

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    if (isActive && !wasActive) {
      activated?.();
    }
    if (!isActive && wasActive) {
      deactivated?.();
    }
    wasActiveRef.current = isActive;
  }, [isActive, activated, deactivated]);

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
