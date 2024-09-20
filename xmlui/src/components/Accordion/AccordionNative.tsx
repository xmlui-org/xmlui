import * as RAccordion from "@radix-ui/react-accordion";
import { AccordionContext } from "@components/Accordion/AccordionContext";
import styles from "./Accordion.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

type Props = {
  children?: React.ReactNode;
  triggerPosition?: "start" | "end";
  collapsedIcon?: string;
  expandedIcon?: string;
  hideIcon?: boolean;
  rotateExpanded?: string;
  registerComponentApi?: RegisterComponentApiFn;
  onDisplayDidChange?: (changedValue: string[]) => void;
};

export const AccordionComponent = ({
  children,
  hideIcon = false,
  expandedIcon = "chevronup",
  collapsedIcon = "chevrondown",
  triggerPosition = "end",
  onDisplayDidChange = noop,
  registerComponentApi,
}: Props) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [itemElements, setItemElements] = useState<Record<string, HTMLButtonElement>>({});

  const collapseItem = useCallback(
    (id: string) => {
      setExpandedItems((prev) => prev.filter((item) => item !== `${id}`));
    },
    [setExpandedItems],
  );

  const expandItem = useCallback(
    (id: string) => {
      if (!expandedItems.includes(`${id}`)) {
        setExpandedItems((prev) => [...prev, `${id}`]);
      }
    },
    [setExpandedItems, expandedItems],
  );

  const toggleItem = useCallback(
    (id: string) => {
      if (expandedItems.includes(`${id}`)) {
        collapseItem(id);
      } else {
        expandItem(id);
      }
    },
    [setExpandedItems, expandedItems],
  );

  const register = useCallback(
    (id: string, el: HTMLButtonElement) => {
      setItemElements((prev) => ({ ...prev, [id]: el }));
    },
    [setItemElements],
  );

  const unRegister = useCallback(
    (id: string) => {
      setItemElements((prev) => {
        delete prev[id];
        return prev;
      });
    },
    [setItemElements],
  );

  const focusItem = useCallback(
    (id: string) => {
      if (itemElements[id]) {
        itemElements[id].focus();
      }
    },
    [itemElements],
  );

  useEffect(() => {
    registerComponentApi?.({
      expand: expandItem,
      collapse: collapseItem,
      toggle: toggleItem,
      focus: focusItem,
    });
  }, [registerComponentApi, expandItem, collapseItem, toggleItem, focusItem]);

  const contextValue = useMemo(
    () => ({
      register,
      unRegister,
      expandedItems,
      hideIcon,
      expandedIcon,
      collapsedIcon,
      triggerPosition,
    }),
    [register, unRegister, expandedItems, hideIcon, expandedIcon, collapsedIcon, triggerPosition],
  );

  useEffect(() => {
    onDisplayDidChange?.(expandedItems);
  }, [expandedItems, onDisplayDidChange]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <RAccordion.Root
        value={expandedItems}
        type="multiple"
        className={styles.root}
        onValueChange={(value) => setExpandedItems(value)}
      >
        {children}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
};
