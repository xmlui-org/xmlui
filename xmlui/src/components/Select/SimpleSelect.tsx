import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { useTheme } from "../../components-core/theming/ThemeContext";
import styles from "./Select.module.scss";
import Icon from "../Icon/IconNative";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";
import type { SingleValueType } from "./SelectNative";
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

interface SimpleSelectProps {
  value: SingleValueType;
  onValueChange: (selectedValue: SingleValueType) => void;
  id: string;
  style: CSSProperties;
  className?: string;
  onFocus: () => void;
  onBlur: () => void;
  enabled: boolean;
  validationStatus: ValidationStatus;
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
  validationIcon?: string | null;
}

export const SimpleSelect = forwardRef<HTMLElement, SimpleSelectProps>(
  function SimpleSelect(props, forwardedRef) {
    const { root } = useTheme();
    const {
      enabled,
      onBlur,
      autoFocus,
      onValueChange,
      validationStatus,
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
      modal,
      groupBy,
      groupHeaderRenderer,
      ungroupedHeaderRenderer,
      clearable,
      onClear,
      valueRenderer,
      options,
      children,
      validationIcon,
      ...rest
    } = props;

    const composedRef = forwardRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;
    const [open, setOpen] = useState(false);

    // Convert value to string for Radix UI compatibility
    const stringValue = useMemo(() => {
      return value != undefined ? String(value) : undefined;
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
                <Icon name="close" />
              </button>
            </Part>
          )}
          {validationIcon && (
            <span className={classnames(styles.action)}>
              <Icon name={validationIcon} />
            </span>
          )}
          <span className={styles.action}>
            <Icon name="chevrondown" />
          </span>
        </Trigger>
        <Portal container={root}>
          <Content
            collisionPadding={0}
            className={styles.selectDropdownContent}
            position="popper"
            align="start"
            style={{ maxHeight: height, minWidth: panelWidth }}
          >
            <ScrollUpButton className={styles.selectScrollUpButton}>
              <Icon name="chevronup" />
            </ScrollUpButton>
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
                                {groupHeaderRenderer ? groupHeaderRenderer({ $group: groupName }) : groupName}
                              </Label>
                            )}
                            {groupOptions.map((option) => (
                              <SelectOption
                                key={option.value}
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
                  // Render flat options
                  <>
                    {<OptionTypeProvider Component={SelectOption}>{children}</OptionTypeProvider>}
                    {options.length === 0 && emptyListNode}
                  </>
                )}
              </Viewport>
            </Part>
            <ScrollDownButton className={styles.selectScrollDownButton}>
              <Icon name="chevrondown" />
            </ScrollDownButton>
          </Content>
        </Portal>
      </Root>
    );
  },
);
