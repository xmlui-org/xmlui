import { useEffect, useId } from "react";
import type { Accordion } from "@components/abstractions";
import { useAccordionContext } from "@components/Accordion/AccordionContext";

export function AccordionItemComponent(props: Accordion) {
  const id = useId();
  const { register, unRegister } = useAccordionContext();
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
