import * as RAccordion from "@radix-ui/react-accordion";
import { AccordionContext } from "@components/Accordion/AccordionContext";
import styles from "./Accordion.module.scss";
import { forwardRef, useCallback, useEffect, useMemo, useState, ForwardedRef } from "react";
import { noop } from "@components-core/constants";
import type { RegisterComponentApiFn } from "@abstractions/RendererDefs";

type Props = {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  triggerPosition?: "start" | "end";
  collapsedIcon?: string;
  expandedIcon?: string;
  hideIcon?: boolean;
  rotateExpanded?: string;
  registerComponentApi?: RegisterComponentApiFn;
  onDisplayDidChange?: (changedValue: string[]) => void;
};

export const AccordionComponent = forwardRef(function AccordionComponent(
  {
    style,
    children,
    hideIcon = false,
    expandedIcon,
    collapsedIcon = "chevrondown",
    triggerPosition = "end",
    onDisplayDidChange = noop,
    registerComponentApi,
    rotateExpanded = "180deg",
  }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [itemElements, setItemElements] = useState<Set<string>>(new Set());

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
    (id: string) => {
      setItemElements((prev) => {
        prev.add(id);
        return prev;
      });
    },
    [setItemElements],
  );

  const unRegister = useCallback(
    (id: string) => {
      setItemElements((prev) => {
        prev.delete(id);
        return prev;
      });
    },
    [setItemElements],
  );

  const focusItem = useCallback(
    (id: string) => {
      if (itemElements.has(`trigger_${id}`)) {
        const trigger = document.getElementById(`trigger_${id}`);
        if (trigger) {
          trigger.focus();
        }
      }
    },
    [itemElements],
  );

  const isExpanded = useCallback(
    (id: string) => {
      return expandedItems.includes(`${id}`);
    },
    [expandedItems],
  );

  useEffect(() => {
    registerComponentApi?.({
      expanded: isExpanded,
      expand: expandItem,
      collapse: collapseItem,
      toggle: toggleItem,
      focus: focusItem,
    });
  }, [registerComponentApi, expandItem, collapseItem, toggleItem, focusItem, isExpanded]);

  const contextValue = useMemo(
    () => ({
      register,
      unRegister,
      expandItem,
      expandedItems,
      hideIcon,
      expandedIcon,
      collapsedIcon,
      triggerPosition,
      rotateExpanded,
    }),
    [
      register,
      unRegister,
      expandedItems,
      hideIcon,
      expandedIcon,
      collapsedIcon,
      triggerPosition,
      expandItem,
      rotateExpanded,
    ],
  );

  useEffect(() => {
    onDisplayDidChange?.(expandedItems);
  }, [expandedItems, onDisplayDidChange]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <RAccordion.Root
        style={style}
        ref={forwardedRef}
        value={expandedItems}
        type="multiple"
        className={styles.root}
        onValueChange={(value) => setExpandedItems(value)}
      >
        {children}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
});
