import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useId, useState } from "react";

import { PART_CONTENT, PART_SUMMARY } from "./ExpandableItem.constants";
import { defaultProps } from "./ExpandableItem.defaults";
import styles from "./ExpandableItem.module.scss";

export type ExpandableItemProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "summary"> & {
  children?: ReactNode;
  contentWidth?: string;
  enabled?: boolean;
  fullWidthSummary?: boolean;
  iconCollapsed?: string;
  iconExpanded?: string;
  iconPosition?: "start" | "end";
  initiallyExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void | Promise<void>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
  summary?: ReactNode;
  withSwitch?: boolean;
};

export const ExpandableItemComponent = forwardRef<HTMLDivElement, ExpandableItemProps>(function ExpandableItemComponent(
  {
    children,
    className,
    contentWidth = defaultProps.contentWidth,
    enabled = defaultProps.enabled,
    fullWidthSummary = defaultProps.fullWidthSummary,
    iconCollapsed = defaultProps.iconCollapsed,
    iconExpanded = defaultProps.iconExpanded,
    iconPosition = defaultProps.iconPosition,
    initiallyExpanded = defaultProps.initiallyExpanded,
    onExpandedChange,
    registerComponentApi,
    style,
    summary,
    withSwitch = defaultProps.withSwitch,
    ...rest
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  const generatedId = useId();
  const summaryId = `${generatedId}-${PART_SUMMARY}`;
  const contentId = `${generatedId}-${PART_CONTENT}`;

  const setExpanded = useCallback((nextValue: boolean) => {
    if (!enabled) {
      return;
    }
    setIsOpen((current) => {
      if (current !== nextValue) {
        void onExpandedChange?.(nextValue);
      }
      return nextValue;
    });
  }, [enabled, onExpandedChange]);

  const toggle = useCallback(() => {
    setExpanded(!isOpen);
  }, [isOpen, setExpanded]);
  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
  const isExpanded = useCallback(() => isOpen, [isOpen]);

  useEffect(() => {
    registerComponentApi?.({ expand, collapse, toggle, isExpanded });
  }, [collapse, expand, isExpanded, registerComponentApi, toggle]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!enabled) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  }, [enabled, toggle]);

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        styles.expandableItem,
        isOpen && styles.open,
        !enabled && styles.disabled,
        withSwitch && styles.withSwitch,
        className,
      )}
      style={style as CSSProperties}
      data-state={isOpen ? "open" : "closed"}
    >
      <div
        className={cx(
          styles.summary,
          iconPosition === "start" ? styles.iconStart : styles.iconEnd,
          fullWidthSummary && styles.fullWidth,
        )}
        onClick={enabled ? toggle : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={enabled ? 0 : undefined}
        role="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-disabled={!enabled}
        id={summaryId}
        data-xmlui-part={PART_SUMMARY}
      >
        <div className={withSwitch ? styles.switch : styles.icon} aria-hidden="true">
          {withSwitch ? (
            <span className={styles.switchControl} role="presentation" />
          ) : (
            <span>{isOpen ? iconExpanded : iconCollapsed}</span>
          )}
        </div>
        <div className={styles.summaryContent}>{summary}</div>
      </div>
      <div
        className={cx(styles.content, !isOpen && styles.contentHidden)}
        style={{ width: contentWidth }}
        role="region"
        aria-labelledby={summaryId}
        aria-hidden={!isOpen}
        id={contentId}
        data-xmlui-part={PART_CONTENT}
      >
        {children}
      </div>
    </div>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
