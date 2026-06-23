import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";

import { AccordionContext } from "./AccordionContext";
import { defaultProps } from "./Accordion.defaults";

const styles = {
  root: "root",
};

export type AccordionProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: ReactNode;
  collapsedIcon?: string;
  expandedIcon?: string;
  hideIcon?: boolean;
  onDisplayDidChange?: (changedValue: string[]) => void | Promise<void>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
  rotateExpanded?: string;
  triggerPosition?: "start" | "end";
};

export const AccordionComponent = forwardRef<HTMLDivElement, AccordionProps>(function AccordionComponent(
  {
    children,
    className,
    collapsedIcon = defaultProps.collapsedIcon,
    expandedIcon,
    hideIcon = defaultProps.hideIcon,
    onDisplayDidChange,
    registerComponentApi,
    rotateExpanded = defaultProps.rotateExpanded,
    triggerPosition = defaultProps.triggerPosition,
    ...rest
  },
  ref,
) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const expandItem = useCallback((id: string) => {
    setExpandedItems((items) => items.includes(id) ? items : [...items, id]);
  }, []);
  const collapseItem = useCallback((id: string) => {
    setExpandedItems((items) => items.filter((item) => item !== id));
  }, []);
  const toggleItem = useCallback((id: string) => {
    setExpandedItems((items) => items.includes(id)
      ? items.filter((item) => item !== id)
      : [...items, id]);
  }, []);
  const isExpanded = useCallback((id: string) => expandedItems.includes(id), [expandedItems]);
  const registerItem = useCallback((id: string, initiallyExpanded: boolean) => {
    if (initiallyExpanded) {
      expandItem(id);
    }
  }, [expandItem]);

  useEffect(() => {
    void onDisplayDidChange?.(expandedItems);
  }, [expandedItems, onDisplayDidChange]);

  useEffect(() => {
    registerComponentApi?.({
      expanded: isExpanded,
      expand: expandItem,
      collapse: collapseItem,
      toggle: toggleItem,
      focus: (id: string) => document.getElementById(`trigger_${id}`)?.focus(),
    });
  }, [collapseItem, expandItem, isExpanded, registerComponentApi, toggleItem]);

  const contextValue = useMemo(() => ({
    collapsedIcon,
    expandedIcon,
    expandedItems,
    expandItem,
    hideIcon,
    isExpanded,
    registerItem,
    rotateExpanded,
    toggleItem,
    triggerPosition,
  }), [
    collapsedIcon,
    expandedIcon,
    expandedItems,
    expandItem,
    hideIcon,
    isExpanded,
    registerItem,
    rotateExpanded,
    toggleItem,
    triggerPosition,
  ]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <div {...rest} ref={ref} className={cx(styles.root, className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
