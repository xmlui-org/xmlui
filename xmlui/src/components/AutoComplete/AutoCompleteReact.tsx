import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { defaultProps } from "./AutoComplete.defaults";
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = useState<unknown>(initialValue ?? "");
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(initiallyOpen);
  const currentValue = controlledValue === undefined ? internalValue : controlledValue;

  useEffect(() => {
    setInternalValue(initialValue ?? "");
  }, [initialValue]);

  useEffect(() => {
    const selected = options.find((option) => Object.is(option.value, currentValue));
    if (selected && typeof selected.label === "string") {
      setInputValue(selected.label);
    }
  }, [currentValue, options]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setValue: (nextValue) => {
      setInternalValue(nextValue);
      void onDidChange?.(nextValue);
    },
    get value() {
      return currentValue;
    },
  }), [currentValue, onDidChange]);

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

  const selectValue = (value: unknown, label: ReactNode) => {
    if (readOnly || !enabled) {
      return;
    }
    setInternalValue(value);
    setInputValue(labelText(label));
    setOpen(false);
    void onDidChange?.(value);
  };

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
          setOpen(true);
          void onFocus?.();
        }}
        onBlur={() => {
          void onBlur?.();
        }}
        onChange={(event) => {
          setInputValue(event.currentTarget.value);
          setOpen(true);
        }}
      />
      {open && enabled ? (
        <div className={styles.autoCompleteMenu} role="listbox" data-xmlui-part="listWrapper">
          {filteredOptions.map((option, index) => (
            <button
              key={`${String(option.value)}:${index}`}
              type="button"
              role="option"
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
              onClick={() => {
                const value = inputValue.trim();
                setInternalValue(value);
                setOpen(false);
                void onItemCreated?.(value);
                void onDidChange?.(value);
              }}
            >
              {inputValue.trim()}
            </button>
          ) : null}
          {filteredOptions.length === 0 && !showCreatable ? (
            <div className={styles.autoCompleteEmpty}>{emptyListTemplate ?? "No options"}</div>
          ) : null}
        </div>
      ) : null}
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
