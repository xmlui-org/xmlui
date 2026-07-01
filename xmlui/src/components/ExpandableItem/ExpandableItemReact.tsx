import type React from "react";
import {
  type CSSProperties,
  forwardRef,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import classNames from "classnames";

import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { Part } from "../Part/Part";
import { ThemedIcon } from "../Icon/Icon";
import { Toggle } from "../Toggle/Toggle";
import { PART_CONTENT, PART_SUMMARY } from "./ExpandableItem.constants";
import { defaultProps } from "./ExpandableItem.defaults";
import styles from "./ExpandableItem.module.scss";

export type ExpandableItemProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "summary"> & {
  children?: ReactNode;
  classes?: Record<string, string>;
  contentWidth?: string;
  enabled?: boolean;
  fullWidthSummary?: boolean;
  iconCollapsed?: string;
  iconExpanded?: string;
  iconPosition?: "start" | "end";
  initiallyExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void | Promise<void>;
  registerComponentApi?: RegisterComponentApiFn;
  summary?: ReactNode;
  withSwitch?: boolean;
};

export const ExpandableItemComponent = memo(forwardRef<HTMLDivElement, ExpandableItemProps>(
  function ExpandableItemComponent(
    {
      summary,
      children,
      className,
      classes,
      style,
      initiallyExpanded = defaultProps.initiallyExpanded,
      enabled = defaultProps.enabled,
      iconExpanded = defaultProps.iconExpanded,
      iconCollapsed = defaultProps.iconCollapsed,
      iconPosition = defaultProps.iconPosition,
      withSwitch = defaultProps.withSwitch,
      contentWidth = defaultProps.contentWidth,
      fullWidthSummary = defaultProps.fullWidthSummary,
      onExpandedChange,
      registerComponentApi,
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
      if (isOpen === nextValue) {
        return;
      }
      setIsOpen(nextValue);
      void onExpandedChange?.(nextValue);
    }, [enabled, isOpen, onExpandedChange]);

    const toggleOpen = useCallback(() => {
      setExpanded(!isOpen);
    }, [isOpen, setExpanded]);

    const expand = useCallback(() => {
      setExpanded(true);
    }, [setExpanded]);

    const collapse = useCallback(() => {
      setExpanded(false);
    }, [setExpanded]);

    const toggle = useCallback(() => {
      toggleOpen();
    }, [toggleOpen]);

    const getIsExpanded = useCallback(() => isOpen, [isOpen]);

    const handleSwitchChange = useCallback(
      (value: boolean) => {
        setExpanded(value);
      },
      [setExpanded],
    );

    useEffect(() => {
      registerComponentApi?.({
        expand,
        collapse,
        toggle,
        isExpanded: getIsExpanded,
      });
    }, [registerComponentApi, expand, collapse, toggle, getIsExpanded]);

    const handleSummaryClick = useCallback(() => {
      if (!enabled || !withSwitch) {
        return;
      }
      setExpanded(!isOpen);
    }, [enabled, withSwitch, isOpen, setExpanded]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (!enabled) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (withSwitch) {
            handleSwitchChange(!isOpen);
          } else {
            toggleOpen();
          }
        }
      },
      [enabled, withSwitch, isOpen, handleSwitchChange, toggleOpen],
    );

    return (
      <div
        {...rest}
        className={classNames(styles.expandableItem, classes?.[COMPONENT_PART_KEY], className, {
          [styles.open]: isOpen,
          [styles.disabled]: !enabled,
          [styles.withSwitch]: withSwitch,
        })}
        style={style as CSSProperties}
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
      >
        <Part partId={PART_SUMMARY}>
          <div
            className={classNames(styles.summary, {
              [styles.iconStart]: iconPosition === "start",
              [styles.iconEnd]: iconPosition === "end",
              [styles.fullWidth]: fullWidthSummary,
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
                <ThemedIcon
                  name={isOpen ? iconExpanded : iconCollapsed}
                  fallback={isOpen ? "chevrondown" : "chevronright"}
                />
              )}
            </div>
            <div className={styles.summaryContent}>{summary}</div>
          </div>
        </Part>
        <Part partId={PART_CONTENT}>
          <div
            className={classNames(styles.content, {
              [styles.contentHidden]: !isOpen,
            })}
            style={{ width: contentWidth }}
            role="region"
            aria-labelledby={summaryId}
            aria-hidden={!isOpen}
            id={contentId}
          >
            {children}
          </div>
        </Part>
      </div>
    );
  },
));
