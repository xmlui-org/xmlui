import * as RAccordion from "@radix-ui/react-accordion";
import { AccordionContext, useAccordionContextValue } from "@components/Accordion/AccordionContext";
import styles from "./Accordion.module.scss";
import { useCallback, useEffect } from "react";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

type Props = {
  children?: React.ReactNode;
  triggerPosition?: string;
  collapsedIcon?: string;
  expandedIcon?: string;
  hideIcon?: boolean;
  rotateExpanded?: string;
  registerComponentApi?: RegisterComponentApiFn;
  onDisplayDidChange?: (value: string) => void;
};

const positionInGroupValues = ["single", "first", "middle", "last"] as const;
export const positionInGroupNames: string[] = [...positionInGroupValues];

export const AccordionComponent = ({
  children,
  hideIcon = false,
  expandedIcon = "chevronup",
  collapsedIcon = "chevrondown",
  triggerPosition = "end",
  registerComponentApi,
  onDisplayDidChange = noop,
}: Props) => {
  const { register, unRegister, accordionItems, activeItems, setAccordionActive } =
    useAccordionContextValue();

  useEffect(() => {
    registerComponentApi?.({});
  }, [registerComponentApi]);

  const onValueChange = useCallback(
    (changedValue: string[]) => {
      //onDisplayDidChange?.(changedValue);
    },
    [onDisplayDidChange],
  );

  return (
    <AccordionContext.Provider
      value={{
        register,
        unRegister,
        hideIcon,
        expandedIcon,
        collapsedIcon,
        triggerPosition,
        activeItems: [],
        setAccordionActive,
      }}
    >
      {children}
      <RAccordion.Root
        value={activeItems}
        type="multiple"
        className={styles.root}
        onValueChange={onValueChange}
      >
        {accordionItems.map((item) => item.content)}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
};
