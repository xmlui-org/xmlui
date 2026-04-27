import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../components-core/theming/ThemeContext";
import styles from "./Select.module.scss";
import { ThemedIcon } from "../Icon/Icon";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";
import type { SingleValueType } from "./SelectReact";
import type { Option, ValidationStatus } from "../abstractions";
import {
  Root,
  Trigger,
  Content,
  Viewport,
  ScrollUpButton,
  ScrollDownButton,
  Portal,
  Group,
  Label,
} from "@radix-ui/react-select";
import { SelectOption } from "./SelectOption";
import { Part } from "../Part/Part";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { PART_CONCISE_VALIDATION_FEEDBACK } from "../../components-core/parts";
import { ConciseValidationFeedback } from "../ConciseValidationFeedback/ConciseValidationFeedback";

interface SimpleSelectProps {
  value: SingleValueType;
  onValueChange: (selectedValue: SingleValueType) => void;
  id: string;
  style: CSSProperties;
  className?: string;
  contentClassName?: string;
  onFocus: () => void;
  onBlur: () => void;
  enabled: boolean;
  triggerRef: (value: ((prevState: HTMLElement) => HTMLElement) | HTMLElement) => void;
  autoFocus: boolean;
  placeholder: string;
  height: CSSProperties["height"];
  panelWidth: number;
  readOnly: boolean;
  emptyListNode: ReactNode;
  modal?: boolean;
  groupBy?: string;
  groupHeaderRenderer?: (contextVars: Record<string, any>) => ReactNode;
  ungroupedHeaderRenderer?: () => ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  valueRenderer?: (item: Option, removeItem: () => void) => ReactNode;
  children?: ReactNode;
  options: Option[];
  scrollIndicators?: boolean;
  validationIcon?: string | null;
  validationStatus: ValidationStatus;
  variant?: "default" | "outlined";
  invalidMessages: string[];
  finalValidationIconSuccess: string;
  finalValidationIconError: string;
  finalVerboseValidationFeedback: boolean;
}

export const SimpleSelect = forwardRef<HTMLElement, SimpleSelectProps>(
  function SimpleSelect(props, forwardedRef) {
    const { root } = useTheme();
    const {
      enabled,
      onBlur,
      autoFocus,
      onValueChange,
      value,
      height,
      style,
      placeholder,
      id,
      triggerRef,
      onFocus,
      panelWidth,
      readOnly,
      emptyListNode,
      className,
      contentClassName,
      modal,
      groupBy,
      groupHeaderRenderer,
      ungroupedHeaderRenderer,
      clearable,
      onClear,
      valueRenderer,
      options,
      children,
      scrollIndicators = true,
      validationIcon,
      validationStatus,
      variant,
      invalidMessages,
      finalValidationIconSuccess,
      finalValidationIconError,
      finalVerboseValidationFeedback,
      ...rest
    } = props;

    const composedRef = forwardRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;
    const [open, setOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Radix Select's Content hardcodes RemoveScroll which locks page scroll whenever
    // the dropdown is open. When the Select is not modal, counteract this by:
    // 1. Decrementing the data-scroll-locked attribute on body (removes overflow:hidden CSS)
    // 2. Adding capture-phase wheel/touchmove handlers to prevent RemoveScroll from
    //    calling preventDefault on scroll events outside the dropdown
    useEffect(() => {
      if (!open || modal) return;

      const body = document.body;
      const LOCK_ATTR = "data-scroll-locked";

      // Decrement the lock counter that RemoveScroll set
      let didDecrement = false;
      const decrement = () => {
        const count = parseInt(body.getAttribute(LOCK_ATTR) || "0", 10);
        if (count > 0 && !didDecrement) {
          didDecrement = true;
          if (count <= 1) {
            body.removeAttribute(LOCK_ATTR);
          } else {
            body.setAttribute(LOCK_ATTR, String(count - 1));
          }
        }
      };

      // RemoveScroll applies the lock in a layout effect. Use rAF to run after paint.
      const raf = requestAnimationFrame(decrement);

      // Intercept wheel/touchmove events in capture phase for events outside the
      // dropdown content. This prevents RemoveScroll's bubble-phase handler from
      // calling preventDefault(), allowing the page to scroll normally.
      const handler = (e: Event) => {
        const viewport = body.querySelector("[data-radix-select-viewport]");
        if (!viewport || !viewport.contains(e.target as Node)) {
          e.stopPropagation();
        }
      };
      document.addEventListener("wheel", handler, true);
      document.addEventListener("touchmove", handler, true);

      return () => {
        cancelAnimationFrame(raf);

        // Restore the lock counter so RemoveScroll's own cleanup stays balanced
        if (didDecrement) {
          const count = parseInt(body.getAttribute(LOCK_ATTR) || "0", 10);
          body.setAttribute(LOCK_ATTR, String(count + 1));
        }

        document.removeEventListener("wheel", handler, true);
        document.removeEventListener("touchmove", handler, true);
      };
    }, [open, modal]);

    // When the dropdown opens, pin Content to its initial clientHeight so that
    // scroll buttons mounting/unmounting cannot change the outer container size.
    // The Radix Viewport has flex:1 so it absorbs the scroll button heights instead.
    useEffect(() => {
      if (!open) return;
      const el = contentRef.current;
      if (!el) return;

      let rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          el.style.height = `${el.clientHeight}px`;
        });
      });

      return () => {
        cancelAnimationFrame(rafId);
        if (contentRef.current) {
          contentRef.current.style.height = "auto";
        }
      };
    }, [open]);

    // Convert value to string for Radix UI compatibility.
    // Always produce a string (defaulting to "") so Radix stays in controlled mode.
    // Passing undefined would trigger a controlled→uncontrolled transition that
    // causes Radix to fire onValueChange("") unexpectedly.
    const stringValue = useMemo(() => {
      return value != null && value !== "" ? String(value) : "";
    }, [value]);

    // Handle value changes with proper type conversion
    const handleValueChange = useCallback(
      (val: string) => {
        if (readOnly) return;
        onValueChange(val);
      },
      [onValueChange, readOnly],
    );

    const selectedOption = useMemo(() => {
      return options.find((option) => `${option.value}` === `${value}`);
    }, [options, value]);

    // Group options if groupBy is provided
    const groupedOptions = useMemo(() => {
      if (!groupBy) return null;

      // Early return if no options to group - prevents empty dropdown issue
      if (options.length === 0) return null;

      const groups: Record<string, typeof options> = {};

      options.forEach((option) => {
        // Use nullish coalescing to properly handle falsy values like 0, "", or false
        const groupKey = (option as any)[groupBy] ?? "Ungrouped";
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(option);
      });

      // Sort groups to put "Ungrouped" first
      const sortedGroups: Record<string, typeof options> = {};
      if (groups["Ungrouped"]) {
        sortedGroups["Ungrouped"] = groups["Ungrouped"];
      }
      Object.keys(groups)
        .filter((key) => key !== "Ungrouped")
        .sort()
        .forEach((key) => {
          sortedGroups[key] = groups[key];
        });

      // Return null if no groups have any options
      return Object.keys(sortedGroups).length > 0 ? sortedGroups : null;
    }, [groupBy, options]);

    return (
      <Root
        open={open}
        value={stringValue}
        onValueChange={handleValueChange}
        onOpenChange={() => enabled && !readOnly && setOpen(!open)}
      >
        <Trigger
          {...rest}
          id={id}
          ref={composedRef}
          aria-haspopup="listbox"
          style={style}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={!enabled}
          className={classnames(className, styles.selectTrigger, {
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
            [styles.outlined]: variant === "outlined",
          })}
          onClick={(event) => {
            // Prevent event propagation to parent elements (e.g., DropdownMenu)
            // This ensures that clicking the Select trigger doesn't close the containing DropdownMenu
            event.stopPropagation();
          }}
          autoFocus={autoFocus}
        >
          <div
            className={classnames(styles.selectValue, {
              [styles.placeholder]: value === undefined,
            })}
          >
            {selectedOption
              ? valueRenderer
                ? valueRenderer(selectedOption, () => {
                    if (!readOnly) onClear?.();
                  })
                : selectedOption.label
              : readOnly
                ? ""
                : placeholder}
          </div>
          {!finalVerboseValidationFeedback && (
            <Part partId={PART_CONCISE_VALIDATION_FEEDBACK}>
              <ConciseValidationFeedback
                validationStatus={validationStatus}
                invalidMessages={invalidMessages}
                successIcon={finalValidationIconSuccess}
                errorIcon={finalValidationIconError}
              />
            </Part>
          )}
          {clearable && value !== undefined && value !== "" && !readOnly && enabled && (
            <Part partId="clearButton">
              <button
                type="button"
                className={styles.clearButton}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClear?.();
                }}
                tabIndex={-1}
              >
                <ThemedIcon name="close" />
              </button>
            </Part>
          )}
          <span className={styles.action}>
            <ThemedIcon name="chevrondown" />
          </span>
        </Trigger>
        <Portal container={root}>
          <Content
            ref={contentRef}
            collisionPadding={0}
            className={classnames(contentClassName, styles.selectDropdownContent)}
            position="popper"
            align="start"
            style={{ height: "auto", maxHeight: height, minWidth: panelWidth }}
          >
            {scrollIndicators && (
              <ScrollUpButton className={styles.selectScrollUpButton}>
                <ThemedIcon name="chevronup" />
              </ScrollUpButton>
            )}
            <Part partId="listWrapper">
              <Viewport className={styles.selectViewport}>
                {groupBy && groupedOptions ? (
                  // Render grouped options directly from options array
                  <>
                    {Object.keys(groupedOptions).length === 0
                      ? emptyListNode
                      : Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                          <Group key={groupName}>
                            {groupName === "Ungrouped" ? (
                              ungroupedHeaderRenderer && (
                                <Label className={styles.groupHeader}>
                                  {ungroupedHeaderRenderer()}
                                </Label>
                              )
                            ) : (
                              <Label className={styles.groupHeader}>
                                {groupHeaderRenderer
                                  ? groupHeaderRenderer({ $group: groupName })
                                  : groupName}
                              </Label>
                            )}
                            {groupOptions.map((option) => (
                              <SelectOption
                                key={option.value ?? option.label}
                                value={option.value}
                                label={option.label}
                                enabled={option.enabled}
                                className={styles.selectOption}
                              >
                                {option.children}
                              </SelectOption>
                            ))}
                          </Group>
                        ))}
                  </>
                ) : (
                  // Render flat options.
                  // If options are provided as an array (data prop), render them directly.
                  // Otherwise fall through to OptionTypeProvider which renders Option children.
                  <>
                    {options.length > 0 && !children ? (
                      options.map((option) => (
                        <SelectOption
                          key={option.value ?? option.label}
                          value={String(option.value)}
                          label={option.label}
                          enabled={option.enabled}
                          className={styles.selectOption}
                        />
                      ))
                    ) : (
                      <OptionTypeProvider Component={SelectOption}>{children}</OptionTypeProvider>
                    )}
                    {options.length === 0 && emptyListNode}
                  </>
                )}
              </Viewport>
            </Part>
            {scrollIndicators && (
              <ScrollDownButton className={styles.selectScrollDownButton}>
                <ThemedIcon name="chevrondown" />
              </ScrollDownButton>
            )}
          </Content>
        </Portal>
      </Root>
    );
  },
);
