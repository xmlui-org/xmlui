import { useEffect, useId } from "react";
import type { Tab } from "@components/abstractions";
import { useTabContext } from "@components/Tabs/TabContext";

export function TabItemComponent(props: Tab) {
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
  return null;
}
