import * as RAccordion from "@radix-ui/react-accordion";
import type { AccordionItem } from "@components/Accordion/AccordionContext";
import { AccordionContext } from "@components/Accordion/AccordionContext";
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
  onDisplayDidChange = noop,
}: Props) => {
  const [accordionItems, setAccordionItems] = useState(EMPTY_ARRAY);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const collapseItem = useCallback(
    (id: string) => {
      setExpandedItems((prev) => prev.filter((item) => item !== id));
    },
    [setExpandedItems],
  );

  const expandItem = useCallback(
    (id: string) => {
      setExpandedItems((prev) => [...prev, id]);
    },
    [setExpandedItems],
  );

  const register = useCallback(
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
      expandItem,
      collapseItem,
      unRegister,
      register,
      hideIcon,
      expandedIcon,
      collapsedIcon,
      triggerPosition,
    }),
    [
      expandItem,
      collapseItem,
      register,
      unRegister,
      hideIcon,
      expandedIcon,
      collapsedIcon,
      triggerPosition,
    ],
  );

  useEffect(() => {
    onDisplayDidChange?.(expandedItems);
  }, [expandedItems, onDisplayDidChange]);

  return (
    <AccordionContext.Provider value={contextValue}>
      {children}
      <RAccordion.Root value={expandedItems} type="multiple" className={styles.root}>
        {accordionItems.map((item) => item.content)}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
};
