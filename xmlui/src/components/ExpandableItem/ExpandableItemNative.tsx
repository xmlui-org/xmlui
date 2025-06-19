import { type CSSProperties, forwardRef, type ReactNode, useCallback, useEffect } from "react";
import { useState } from "react";
import classNames from "classnames";

import styles from "./ExpandableItem.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { Icon } from "../Icon/IconNative";

type ExpandableItemProps = {
  children?: ReactNode;
  summary?: ReactNode;
  className?: string;
  style?: CSSProperties;
  initiallyExpanded?: boolean;
  enabled?: boolean;
  iconExpanded?: string;
  iconCollapsed?: string;
  iconPosition?: "start" | "end";
  onExpandedChange?: (isExpanded: boolean) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultExpandableItemProps: Pick<
  ExpandableItemProps,
  "initiallyExpanded" | "enabled" | "iconExpanded" | "iconCollapsed" | "iconPosition"
> = {
  initiallyExpanded: false,
  enabled: true,
  iconExpanded: "chevrondown",
  iconCollapsed: "chevronright",
  iconPosition: "end"
};

export const ExpandableItem = forwardRef(function ExpandableItem(
  {
    summary,
    children,
    className,
    style,
    initiallyExpanded = defaultExpandableItemProps.initiallyExpanded,
    enabled = defaultExpandableItemProps.enabled,
    iconExpanded = defaultExpandableItemProps.iconExpanded,
    iconCollapsed = defaultExpandableItemProps.iconCollapsed,
    iconPosition = defaultExpandableItemProps.iconPosition,
    onExpandedChange,
    registerComponentApi,
  }: ExpandableItemProps,
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  
  const toggleOpen = useCallback(() => {
    if (!enabled) return;
    
    const newValue = !isOpen;
    setIsOpen(newValue);
    onExpandedChange?.(newValue);
  }, [enabled, isOpen, onExpandedChange]);

  // Register component API
  const expand = useCallback(() => {
    if (!isOpen && enabled) {
      setIsOpen(true);
      onExpandedChange?.(true);
    }
  }, [enabled, isOpen, onExpandedChange]);

  const collapse = useCallback(() => {
    if (isOpen && enabled) {
      setIsOpen(false);
      onExpandedChange?.(false);
    }
  }, [enabled, isOpen, onExpandedChange]);

  const toggle = useCallback(() => {
    toggleOpen();
  }, [toggleOpen]);

  const getIsExpanded = useCallback(() => isOpen, [isOpen]);

  // Register these functions with the component API using useEffect
  useEffect(() => {
    registerComponentApi?.({
      expand,
      collapse,
      toggle,
      isExpanded: getIsExpanded,
    });
  }, [registerComponentApi, expand, collapse, toggle, getIsExpanded]);

  return (
    <div 
      className={classNames(styles.expandableItem, className, {
        [styles.open]: isOpen,
        [styles.disabled]: !enabled,
      })}
      style={style}
      ref={ref as any}
    >
      <div 
        className={classNames(styles.summary, {
          [styles.iconStart]: iconPosition === "start",
          [styles.iconEnd]: iconPosition === "end",
        })}
        onClick={toggleOpen}
      >
        {iconPosition === "start" && (
          <div className={styles.icon}>
            <Icon 
              name={isOpen ? iconExpanded : iconCollapsed}
              fallback={isOpen ? "chevrondown" : "chevronright"}
            />
          </div>
        )}
        <div className={styles.summaryContent}>
          {summary}
        </div>
        {iconPosition === "end" && (
          <div className={styles.icon}>
            <Icon 
              name={isOpen ? iconExpanded : iconCollapsed}
              fallback={isOpen ? "chevrondown" : "chevronright"}
            />
          </div>
        )}
      </div>
      {isOpen && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
});
