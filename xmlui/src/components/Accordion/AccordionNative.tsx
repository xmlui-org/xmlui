import { forwardRef, useCallback, useEffect, useMemo, useState, type ForwardedRef } from "react";
import * as RAccordion from "@radix-ui/react-accordion";
import classnames from "classnames";

import styles from "./Accordion.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { AccordionContext } from "../../components/Accordion/AccordionContext";

type Props = {
  className?: string;
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

export const defaultProps: Pick<
  Props,
  "hideIcon" | "collapsedIcon" | "triggerPosition" | "rotateExpanded"
> = {
  hideIcon: false,
  collapsedIcon: "chevrondown",
  triggerPosition: "end",
  rotateExpanded: "180deg",
};

export const AccordionComponent = forwardRef(function AccordionComponent(
  {
    className,
    style,
    children,
    hideIcon = defaultProps.hideIcon,
    expandedIcon,
    collapsedIcon = defaultProps.collapsedIcon,
    triggerPosition = defaultProps.triggerPosition,
    onDisplayDidChange = noop,
    registerComponentApi,
    rotateExpanded = defaultProps.rotateExpanded,
    ...rest
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
    [collapseItem, expandItem, expandedItems],
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
        className={classnames(styles.root, className)}
        onValueChange={(value) => setExpandedItems(value)}
        {...rest}
      >
        {children}
      </RAccordion.Root>
    </AccordionContext.Provider>
  );
});
