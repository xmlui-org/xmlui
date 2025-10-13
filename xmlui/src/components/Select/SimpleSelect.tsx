import type { CSSProperties, ForwardedRef, ReactNode } from "react";
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
} from "@radix-ui/react-select";

interface SimpleSelectProps {
  value: SingleValueType;
  onValueChange: (selectedValue: SingleValueType) => void;
  id: string;
  style: React.CSSProperties;
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
  children: ReactNode;
  readOnly: boolean;
  emptyListNode: ReactNode;
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
      children,
      readOnly,
      emptyListNode,
      className,
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
            <Viewport className={styles.selectViewport} role="listbox">
              {children}
              {optionsArray.length === 0 && emptyListNode}
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
