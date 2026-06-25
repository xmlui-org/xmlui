import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  isValidElement,
} from "react";

import { defaultProps } from "./Select.defaults";
import styles from "./Select.module.scss";
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const normalizedInitialValue = normalizeValue(initialValue, multiSelect);
  const [internalValue, setInternalValue] = useState<SelectValue>(normalizedInitialValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const currentValue = controlledValue === undefined
    ? internalValue
    : normalizeValue(controlledValue, multiSelect);

  useEffect(() => {
    setInternalValue(normalizedInitialValue);
  }, [normalizedInitialValue]);

  const updateValue = useCallback((nextValue: SelectValue) => {
    setInternalValue(nextValue);
    void onDidChange?.(nextValue);
  }, [onDidChange]);

  useImperativeHandle(ref, () => ({
    focus: () => triggerRef.current?.focus(),
    reset: () => {
      setOpen(false);
      updateValue(normalizedInitialValue);
    },
    setValue: (nextValue) => {
      updateValue(normalizeValue(nextValue, multiSelect));
    },
    get value() {
      return currentValue;
    },
  }), [currentValue, multiSelect, normalizedInitialValue, updateValue]);

  const selectedValues = useMemo(
    () => multiSelect
      ? normalizeArrayValue(currentValue).map(String)
      : [String(currentValue ?? "")],
    [currentValue, multiSelect],
  );
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(String(option.value ?? ""))),
    [options, selectedValues],
  );
  const displayText = selectedOptions.length > 0
    ? selectedOptions.map((option) => optionText(option)).join(", ")
    : placeholder;

  const selectOption = useCallback((option: XmluiOption) => {
    if (readOnly || !enabled || !option.enabled) {
      return;
    }
    const optionValue = String(option.value ?? "");
    if (multiSelect) {
      const current = new Set(normalizeArrayValue(currentValue).map(String));
      if (current.has(optionValue)) {
        current.delete(optionValue);
      } else {
        current.add(optionValue);
      }
      updateValue([...current]);
      return;
    }
    updateValue(selectValueForOption(option));
    setOpen(false);
  }, [currentValue, enabled, multiSelect, readOnly, updateValue]);

  const moveActive = useCallback((offset: number) => {
    if (!open) {
      setOpen(true);
    }
    const enabledIndexes = options
      .map((option, index) => option.enabled ? index : -1)
      .filter((index) => index >= 0);
    if (enabledIndexes.length === 0) {
      return;
    }
    const currentEnabledPosition = enabledIndexes.indexOf(activeIndex);
    const nextPosition = currentEnabledPosition < 0
      ? 0
      : Math.max(0, Math.min(enabledIndexes.length - 1, currentEnabledPosition + offset));
    setActiveIndex(enabledIndexes[nextPosition]);
  }, [activeIndex, open, options]);

  return (
    <div
      {...rest}
      id={id}
      data-xmlui-component="Select"
      data-testid={dataTestId}
      data-value={multiSelect ? selectedValues.join(",") : selectedValues[0] ?? ""}
      className={cx(styles.selectRoot, className)}
      style={style}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open || readOnly}
        aria-controls={id ? `${id}__options` : undefined}
        aria-readonly={readOnly || undefined}
        disabled={!enabled}
        autoFocus={autoFocus}
        className={styles.selectTrigger}
        onClick={() => {
          if (enabled) {
            setOpen((visible) => {
              const nextVisible = readOnly ? true : !visible;
              if (nextVisible && activeIndex < 0) {
                setActiveIndex(options.findIndex((option) => option.enabled));
              }
              return nextVisible;
            });
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            moveActive(1);
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            moveActive(-1);
            return;
          }
          if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            selectOption(options[activeIndex]);
          }
        }}
        onFocus={() => void onFocus?.()}
        onBlur={() => void onBlur?.()}
      >
        {displayText}
      </button>
      <select
        aria-hidden="true"
        tabIndex={-1}
        className={styles.nativeMirror}
        value={multiSelect ? selectedValues : selectedValues[0] ?? ""}
        multiple={multiSelect}
        disabled={!enabled}
        required={required}
        onChange={(event) => {
          const nextValue = multiSelect
            ? Array.from(event.currentTarget.selectedOptions).map((option) => option.value)
            : event.currentTarget.value;
          updateValue(nextValue);
        }}
      >
        {!multiSelect && placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option, index) => (
          <option key={`${String(option.value ?? "")}:${index}`} value={String(option.value ?? "")} disabled={!option.enabled}>
            {optionText(option)}
          </option>
        ))}
      </select>
      {open || readOnly ? (
        <div
          id={id ? `${id}__options` : undefined}
          role="listbox"
          aria-multiselectable={multiSelect || undefined}
          className={styles.selectOptions}
        >
          {options.map((option, index) => {
            const optionValue = String(option.value ?? "");
            const selected = selectedValues.includes(optionValue);
            return (
              <button
                key={`${optionValue}:${index}`}
                data-testid={option.testId}
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={!option.enabled || undefined}
                disabled={!option.enabled}
                className={cx(
                  styles.selectOption,
                  selected ? styles.selectOptionSelected : undefined,
                  index === activeIndex ? styles.selectOptionActive : undefined,
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {renderOptionLabel(option)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}));

function optionText(option: XmluiOption): string {
  return labelText(option.label, option.value);
}

function renderOptionLabel(option: XmluiOption) {
  const label = option.label;
  if (label === undefined || label === null || label === "") {
    return optionText(option);
  }
  if (isValidElement(label) || Array.isArray(label)) {
    return label;
  }
  return String(label);
}

function selectValueForOption(option: XmluiOption): SelectValue {
  if (option.__xmluiRawValue === "{null}" || option.__xmluiParsedValueSource === "null") {
    return null;
  }
  return (option.value === "" ? optionText(option) : option.value) as SelectValue;
}

function labelText(label: unknown, value: unknown): string {
  if (Array.isArray(label)) {
    return label.map((item) => labelText(item, undefined)).join("");
  }
  if (isValidElement(label)) {
    return "";
  }
  if (label !== undefined && label !== null && label !== "") {
    return String(label);
  }
  if (value !== undefined && value !== null) {
    return String(value);
  }
  return "";
}

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
