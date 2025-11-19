import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";
import styles from "./Select.module.scss";

import type { SingleValueType, ValueType } from "./SelectNative";
import { SelectTriggerValue, SelectTriggerActions } from "./SelectNative";
import type { ValidationStatus, Option } from "../abstractions";
import Icon from "../Icon/IconNative";
import { Part } from "../Part/Part";

const PART_CLEAR_BUTTON = "clearButton";

interface SimpleSelectProps {
  id?: string;
  value: SingleValueType;
  onValueChange: (value: SingleValueType) => void;
  enabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  style?: CSSProperties;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  validationStatus?: ValidationStatus;
  triggerRef?: (element: HTMLElement | null) => void;
  height?: CSSProperties["height"];
  width?: number;
  emptyListNode?: ReactNode;
  clearable?: boolean;
  clearValue?: () => void;
  children?: ReactNode;
  options?: Set<Option>;
  valueRenderer?: (item: Option, removeItem: () => void) => ReactNode;
}

export const SimpleSelect = forwardRef<HTMLDivElement, SimpleSelectProps>(function SimpleSelect(
  {
    id,
    value,
    onValueChange,
    enabled = true,
    placeholder = "",
    autoFocus = false,
    readOnly = false,
    style,
    className,
    onFocus,
    onBlur,
    validationStatus = "none",
    triggerRef,
    height,
    width,
    emptyListNode,
    clearable = false,
    clearValue,
    options = new Set(),
    valueRenderer,
    children,
    ...rest
  },
  forwardedRef,
) {
  const localRef = useRef<HTMLButtonElement>(null);

  // Dummy toggleOption for SelectTriggerValue (not used in single select)
  const toggleOption = useCallback(() => {}, []);

  return (
    <RadixSelect.Root value={value ? String(value) : undefined} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        {...rest}
        ref={composeRefs(localRef, forwardedRef as any, triggerRef as any)}
        id={id}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={!enabled || readOnly}
        className={classnames(className, styles.selectTrigger, styles[validationStatus], {
          [styles.disabled]: !enabled,
        })}
        autoFocus={autoFocus}
      >
        <SelectTriggerValue
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          multiSelect={false}
          options={options}
          valueRenderer={valueRenderer}
          toggleOption={toggleOption}
        />
        <SelectTriggerActions
          value={value}
          multiSelect={false}
          enabled={enabled}
          readOnly={readOnly}
          clearable={clearable}
          clearValue={clearValue || (() => {})}
        />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={classnames(styles.selectContent, styles[validationStatus])}
          style={{ minWidth: width, height }}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport className={styles.commandList}>{children}</RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});
