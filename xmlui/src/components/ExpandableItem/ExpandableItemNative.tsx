import { type CSSProperties, forwardRef, type ReactNode, useCallback, useEffect, useId, useRef } from "react";
import { useState } from "react";
import classNames from "classnames";

import styles from "./ExpandableItem.module.scss";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { Icon } from "../Icon/IconNative";
import { Toggle } from "../Toggle/Toggle";

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
  withSwitch?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultExpandableItemProps: Pick<
  ExpandableItemProps,
  "initiallyExpanded" | "enabled" | "iconExpanded" | "iconCollapsed" | "iconPosition" | "withSwitch"
> = {
  initiallyExpanded: false,
  enabled: true,
  iconExpanded: "chevrondown",
  iconCollapsed: "chevronright",
  iconPosition: "end",
  withSwitch: false,
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
    withSwitch = defaultExpandableItemProps.withSwitch,
    onExpandedChange,
    registerComponentApi,
    ...rest
  }: ExpandableItemProps,
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  const generatedId = useId();
  const summaryId = `${generatedId}-summary`;
  const contentId = `${generatedId}-content`;

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

  // Handle switch value change
  const handleSwitchChange = useCallback(
    (value: boolean) => {
      if (!enabled) return;
      setIsOpen(value);
      onExpandedChange?.(value);
    },
    [enabled, onExpandedChange],
  );

  // Register these functions with the component API using useEffect
  useEffect(() => {
    registerComponentApi?.({
      expand,
      collapse,
      toggle,
      isExpanded: getIsExpanded,
    });
  }, [registerComponentApi, expand, collapse, toggle, getIsExpanded]);

  // Handler for clicking on the summary when using a switch
  const handleSummaryClick = useCallback(() => {
    if (!enabled || !withSwitch) return;
    
    const newValue = !isOpen;
    setIsOpen(newValue);
    onExpandedChange?.(newValue);
  }, [enabled, withSwitch, isOpen, onExpandedChange]);

  // Handle keyboard events for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (withSwitch) {
        handleSwitchChange(!isOpen);
      } else {
        toggleOpen();
      }
    }
  }, [enabled, withSwitch, isOpen, handleSwitchChange, toggleOpen]);

  return (
    <div
      {...rest}
      className={classNames(styles.expandableItem, className, {
        [styles.open]: isOpen,
        [styles.disabled]: !enabled,
        [styles.withSwitch]: withSwitch,
      })}
      style={style}
      ref={ref as any}
    >
      <div
        className={classNames(styles.summary, {
          [styles.iconStart]: iconPosition === "start",
          [styles.iconEnd]: iconPosition === "end",
        })}
        onClick={enabled ? (withSwitch ? handleSummaryClick : toggleOpen) : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={enabled ? 0 : undefined}
        role="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-disabled={!enabled}
        id={summaryId}
      >
        <div className={withSwitch ? styles.switch : styles.icon} aria-hidden="true">
          {withSwitch ? (
            <Toggle
              variant="switch"
              value={isOpen}
              enabled={enabled}
              onDidChange={handleSwitchChange}
            />
          ) : (
            <Icon
              name={isOpen ? iconExpanded : iconCollapsed}
              fallback={isOpen ? "chevrondown" : "chevronright"}
            />
          )}
        </div>
        <div className={styles.summaryContent}>
          {summary}
        </div>
      </div>
      {isOpen && (
        <div 
          className={styles.content}
          role="region"
          aria-labelledby={summaryId}
          id={contentId}
        >
          {children}
        </div>
      )}
    </div>
  );
});
