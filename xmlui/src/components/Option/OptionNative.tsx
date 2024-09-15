import { useEffect, useId } from "react";

import type { Option } from "@components/abstractions";
import { useSelectContext } from "@components/Select/SelectContext";

export function OptionComponent(props: Option) {
  const id = useId();
  const { register, unRegister } = useSelectContext();
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
