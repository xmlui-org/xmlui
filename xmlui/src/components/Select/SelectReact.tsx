import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { defaultProps } from "./Select.defaults";
import styles from "./Select.module.scss?xmlui-css-module";
import type { XmluiOption } from "../Option/OptionReact";

export type SelectValue = string | number | Array<string | number> | undefined | null;

export type SelectApi = {
  focus: () => void;
  reset: () => void;
  setValue: (value: SelectValue) => void;
  value: SelectValue;
};

export type SelectProps = {
  id?: string;
  initialValue?: SelectValue;
  value?: SelectValue;
  enabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  multiSelect?: boolean;
  className?: string;
  style?: CSSProperties;
  options?: XmluiOption[];
  onDidChange?: (value: SelectValue) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const SelectNative = memo(forwardRef<SelectApi, SelectProps>(function SelectNative(
  {
    id,
    initialValue,
    value: controlledValue,
    enabled = defaultProps.enabled,
    placeholder = defaultProps.placeholder,
    autoFocus = defaultProps.autoFocus,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    multiSelect = defaultProps.multiSelect,
    className,
    style,
    options = [],
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const normalizedInitialValue = normalizeValue(initialValue, multiSelect);
  const [internalValue, setInternalValue] = useState<SelectValue>(normalizedInitialValue);
  const currentValue = controlledValue === undefined
    ? internalValue
    : normalizeValue(controlledValue, multiSelect);

  useEffect(() => {
    setInternalValue(normalizedInitialValue);
  }, [normalizedInitialValue]);

  useImperativeHandle(ref, () => ({
    focus: () => selectRef.current?.focus(),
    reset: () => {
      setInternalValue(normalizedInitialValue);
      void onDidChange?.(normalizedInitialValue);
    },
    setValue: (nextValue) => {
      const normalized = normalizeValue(nextValue, multiSelect);
      setInternalValue(normalized);
      void onDidChange?.(normalized);
    },
    get value() {
      return currentValue;
    },
  }), [currentValue, multiSelect, normalizedInitialValue, onDidChange]);

  const stringValue = useMemo(
    () => multiSelect
      ? normalizeArrayValue(currentValue).map(String)
      : String(currentValue ?? ""),
    [currentValue, multiSelect],
  );

  return (
    <select
      {...rest}
      id={id}
      ref={selectRef}
      data-testid={dataTestId}
      className={cx(styles.selectRoot, className)}
      style={style}
      value={stringValue}
      multiple={multiSelect}
      disabled={!enabled}
      required={required}
      aria-readonly={readOnly}
      autoFocus={autoFocus}
      onFocus={() => void onFocus?.()}
      onBlur={() => void onBlur?.()}
      onChange={(event) => {
        if (readOnly) {
          event.preventDefault();
          return;
        }
        const nextValue = multiSelect
          ? Array.from(event.currentTarget.selectedOptions).map((option) => option.value)
          : event.currentTarget.value;
        setInternalValue(nextValue);
        void onDidChange?.(nextValue);
      }}
    >
      {!multiSelect && placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option, index) => (
        <option key={`${String(option.value)}:${index}`} value={String(option.value ?? "")} disabled={!option.enabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}));

function normalizeValue(value: SelectValue, multiSelect: boolean): SelectValue {
  if (multiSelect) {
    return normalizeArrayValue(value);
  }
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function normalizeArrayValue(value: SelectValue): Array<string | number> {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return [value];
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
