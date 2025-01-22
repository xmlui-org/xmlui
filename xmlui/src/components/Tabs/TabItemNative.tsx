import { ForwardedRef, forwardRef, useEffect, useId } from "react";
import type { Tab } from "@components/abstractions";
import styles from "@components/Tabs/Tabs.module.scss";
import { Content } from "@radix-ui/react-tabs";
import { useTabContext } from "@components/Tabs/TabContext";

export const TabItemComponent = forwardRef(function TabItemComponent(
  props: Tab,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { register, unRegister } = useTabContext();

  useEffect(() => {
    register({
      ...props,
      id,
    });
  }, [id, props, register]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);

  return (
    <Content key={id} value={id} className={styles.tabsContent} ref={forwardedRef}>
      {props.content}
    </Content>
  );
});
