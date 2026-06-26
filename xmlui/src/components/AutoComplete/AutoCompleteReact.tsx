import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";

import { defaultProps } from "./AutoComplete.defaults";
import { useFormContext } from "../Form/FormContext";
import styles from "./AutoComplete.module.scss";

export type AutoCompleteOption = {
  value: unknown;
  label: ReactNode;
  enabled: boolean;
  keywords?: string[];
};

export type AutoCompleteApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: unknown;
};

export type AutoCompleteProps = {
  id?: string;
  bindTo?: string;
  initialValue?: unknown;
  value?: unknown;
  enabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  initiallyOpen?: boolean;
  creatable?: boolean;
  className?: string;
  style?: CSSProperties;
  options?: AutoCompleteOption[];
  emptyListTemplate?: ReactNode;
  onDidChange?: (value: unknown) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  onItemCreated?: (value: string) => void | Promise<void>;
  "data-testid"?: string;
};

export const AutoCompleteNative = memo(forwardRef<AutoCompleteApi, AutoCompleteProps>(function AutoCompleteNative(
  {
    id,
    bindTo,
    initialValue,
    value: controlledValue,
    enabled = defaultProps.enabled,
    placeholder = defaultProps.placeholder,
    autoFocus = defaultProps.autoFocus,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    initiallyOpen = defaultProps.initiallyOpen,
    creatable = defaultProps.creatable,
    className,
    style,
    options = [],
    emptyListTemplate,
    onDidChange,
    onFocus,
    onBlur,
    onItemCreated,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const validateFormField = form?.validateField;
  const registerFormItem = form?.registerItem;
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = useState<unknown>(initialValue ?? "");
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(initiallyOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const effectiveControlledValue = formValue ?? controlledValue;
  const currentValue = effectiveControlledValue === undefined ? internalValue : effectiveControlledValue;

  useEffect(() => {
    setInternalValue(initialValue ?? "");
  }, [initialValue]);

  useEffect(() => {
    if (!getFormValue || !setFormValue || fieldName === undefined || getFormValue(fieldName) != null || initialValue === undefined) {
      return;
    }
    setFormValue(fieldName, initialValue ?? "");
  }, [fieldName, getFormValue, initialValue, setFormValue]);

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      required,
    });
  }, [fieldName, registerFormItem, required]);

  useEffect(() => {
    const selected = options.find((option) => Object.is(option.value, currentValue));
    if (selected && typeof selected.label === "string") {
      setInputValue(selected.label);
    }
  }, [currentValue, options]);

  const updateValue = useCallback((nextValue: unknown) => {
    setInternalValue(nextValue);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, nextValue);
      void validateFormField?.(fieldName, nextValue);
    }
    void onDidChange?.(nextValue);
  }, [fieldName, onDidChange, setFormValue, validateFormField]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setValue: (nextValue) => {
      updateValue(nextValue);
    },
    get value() {
      return currentValue;
    },
  }), [currentValue, updateValue]);

  const filteredOptions = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term) {
      return options;
    }
    return options.filter((option) => {
      const haystack = [
        String(option.value ?? ""),
        labelText(option.label),
        ...(option.keywords ?? []),
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [inputValue, options]);

  const showCreatable = creatable &&
    inputValue.trim() !== "" &&
    !options.some((option) => String(option.value) === inputValue || labelText(option.label) === inputValue);

  const createValue = () => {
    if (!showCreatable || readOnly || !enabled) {
      return;
    }
    const value = inputValue.trim();
    updateValue(value);
    setOpen(false);
    setActiveIndex(-1);
    void onItemCreated?.(value);
  };

  const selectValue = (value: unknown, label: ReactNode) => {
    if (readOnly || !enabled) {
      return;
    }
    updateValue(value);
    setInputValue(labelText(label));
    setOpen(false);
    setActiveIndex(-1);
  };

  const moveActive = useCallback((offset: number) => {
    if (readOnly || !enabled) {
      return;
    }
    setOpen(true);
    const enabledIndexes = filteredOptions
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
  }, [activeIndex, enabled, filteredOptions, readOnly]);

  return (
    <div
      {...rest}
      data-xmlui-component="AutoComplete"
      data-xmlui-id={id}
      data-testid={dataTestId}
      className={cx(styles.autoCompleteRoot, className)}
      style={style}
    >
      <input
        ref={inputRef}
        id={id}
        className={styles.autoCompleteInput}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        placeholder={placeholder}
        disabled={!enabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        value={inputValue}
        onFocus={() => {
          if (enabled && !readOnly) {
            setOpen(true);
          }
          void onFocus?.();
        }}
        onBlur={() => {
          void onBlur?.();
        }}
        onChange={(event) => {
          setInputValue(event.currentTarget.value);
          setActiveIndex(-1);
          if (enabled && !readOnly) {
            setOpen(true);
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
          if (event.key === "Enter" && activeIndex >= 0 && filteredOptions[activeIndex]) {
            event.preventDefault();
            const option = filteredOptions[activeIndex];
            if (option.enabled) {
              selectValue(option.value, option.label);
            }
            return;
          }
          if (event.key === "Enter" && !open && enabled && !readOnly) {
            event.preventDefault();
            setOpen(true);
            return;
          }
          if (event.key === "Enter" && showCreatable) {
            event.preventDefault();
            createValue();
          }
        }}
      />
      <div
        className={styles.autoCompleteMenu}
        role="listbox"
        data-xmlui-part="listWrapper"
        data-part-id="listWrapper"
        aria-expanded={open}
        hidden={!open || !enabled}
      >
          {filteredOptions.map((option, index) => (
            <button
              key={`${String(option.value)}:${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={styles.autoCompleteItem}
              disabled={!option.enabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (option.enabled) {
                  selectValue(option.value, option.label);
                }
              }}
            >
              {option.label}
            </button>
          ))}
          {showCreatable ? (
            <button
              type="button"
              role="option"
              className={styles.autoCompleteItem}
              onMouseDown={(event) => event.preventDefault()}
              onClick={createValue}
            >
              {inputValue.trim()}
            </button>
          ) : null}
          {filteredOptions.length === 0 && !showCreatable ? (
            <div className={styles.autoCompleteEmpty}>{emptyListTemplate ?? "No options"}</div>
          ) : null}
      </div>
    </div>
  );
}));

function labelText(label: ReactNode): string {
  if (typeof label === "string" || typeof label === "number" || typeof label === "boolean") {
    return String(label);
  }
  return "";
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  return fieldPrefix ? `${fieldPrefix}.${bindTo}` : bindTo;
}
