import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useMemo } from "react";
import { useTheme } from "../../components-core/theming/ThemeContext";
import styles from "./Select.module.scss";
import { useSelect } from "./SelectContext";
import Icon from "../Icon/IconNative";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";
import type { SingleValueType } from "./SelectNative";
import type { ValidationStatus } from "../abstractions";
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
  width: number;
  readOnly: boolean;
  emptyListNode: ReactNode;
  modal?: boolean;
  groupBy?: string;
  groupHeaderRenderer?: (groupName: string) => ReactNode;
  clearable?: boolean;
  onClear?: () => void;
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
      width,
      readOnly,
      emptyListNode,
      className,
      modal,
      groupBy,
      groupHeaderRenderer,
      clearable,
      onClear,
      ...rest
    } = props;

    const { options } = useSelect();
    const composedRef = forwardRef ? composeRefs(triggerRef, forwardedRef) : triggerRef;

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

    const optionsArray = useMemo(() => Array.from(options), [options]);

    const selectedOption = useMemo(() => {
      return optionsArray.find((option) => String(option.value) === String(value));
    }, [optionsArray, value]);

    // Group options if groupBy is provided
    const groupedOptions = useMemo(() => {
      if (!groupBy) return null;

      const groups: Record<string, typeof optionsArray> = {};

      optionsArray.forEach((option) => {
        const groupKey = (option as any)[groupBy] || "Ungrouped";
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(option);
      });

      return groups;
    }, [groupBy, optionsArray]);

    return (
      <Root value={stringValue} onValueChange={handleValueChange}>
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
            {selectedOption ? selectedOption.label : readOnly ? "" : placeholder}
          </div>
          {clearable && value !== undefined && !readOnly && (
            <button
              type="button"
              className={styles.clearButton}
              data-part-id="clearButton"
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              tabIndex={-1}
            >
              <Icon name="close" />
            </button>
          )}
          <span className={styles.action}>
            <Icon name="chevrondown" />
          </span>
        </Trigger>
        <Portal container={root}>
          <Content
            className={styles.selectDropdownContent}
            position="popper"
            style={{ maxHeight: height, minWidth: width }}
          >
            <ScrollUpButton className={styles.selectScrollUpButton}>
              <Icon name="chevronup" />
            </ScrollUpButton>
            <Viewport className={styles.selectViewport} role="listbox" data-part-id="listWrapper">
              {groupBy && groupedOptions ? (
                // Render grouped options directly from options array
                <>
                  {Object.keys(groupedOptions).length === 0
                    ? emptyListNode
                    : Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                        <Group key={groupName}>
                          <Label className={styles.groupHeader}>
                            {groupHeaderRenderer ? groupHeaderRenderer(groupName) : groupName}
                          </Label>
                          {groupOptions.map((option) => (
                            <SelectOption
                              key={option.value}
                              value={option.value}
                              label={option.label}
                              enabled={option.enabled}
                              className={styles.selectOption}
                            />
                          ))}
                        </Group>
                      ))}
                </>
              ) : (
                // Render flat options
                <>
                  {optionsArray.map((option) => (
                    <SelectOption
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option?.enabled === false}
                      className={styles.selectOption}
                    />
                  ))}
                  {optionsArray.length === 0 && emptyListNode}
                </>
              )}
            </Viewport>
            <ScrollDownButton className={styles.selectScrollDownButton}>
              <Icon name="chevrondown" />
            </ScrollDownButton>
          </Content>
        </Portal>
      </Root>
    );
  },
);
