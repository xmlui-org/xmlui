import * as RAccordion from "@radix-ui/react-accordion";
import { AccordionContext, AccordionItem } from "@components/Accordion/AccordionContext";
import styles from "./Accordion.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_ARRAY, noop } from "@components-core/constants";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";
import produce from "immer";

type Props = {
  children?: React.ReactNode;
  triggerPosition?: string;
  collapsedIcon?: string;
  expandedIcon?: string;
  hideIcon?: boolean;
  rotateExpanded?: string;
  registerComponentApi?: RegisterComponentApiFn;
  onDisplayDidChange?: (changedValue: string[]) => void;
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
  const [accordionItems, setAccordionItems] = useState(EMPTY_ARRAY);

  useEffect(() => {
    registerComponentApi?.({});
  }, [registerComponentApi]);

  /*  useEffect(() => {
                    onDisplayDidChange?.(activeItems);
                  }, [activeItems]);*/

  const registerOrUpdate = useCallback(
    (column: AccordionItem) => {
      setAccordionItems(
        produce((draft) => {
          const existing = draft.findIndex((col) => col.id === column.id);
          if (existing < 0) {
            draft.push(column);
          } else {
            draft[existing] = column;
          }
        }),
      );
    },
    [setAccordionItems],
  );

  const unRegister = useCallback(
    (id: string) => {
      setAccordionItems(
        produce((draft) => {
          return draft.filter((col) => col.id !== id);
        }),
      );
    },
    [setAccordionItems],
  );

  const contextValue = useMemo(
    () => ({
      registerOrUpdate,
      unRegister,
      hideIcon,
      expandedIcon,
      collapsedIcon,
      triggerPosition,
    }),
    [registerOrUpdate, unRegister, hideIcon, expandedIcon, collapsedIcon, triggerPosition],
  );

  const expandedItems = useMemo(() => {
    return accordionItems.filter((item) => item.expanded).map((item) => item.id);
  }, [accordionItems]);

  return (
    <AccordionContext.Provider value={contextValue}>
      {children}
      <RAccordion.Root value={expandedItems} type="multiple" className={styles.root}>
        {accordionItems.map((item) => item.content)}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
};
