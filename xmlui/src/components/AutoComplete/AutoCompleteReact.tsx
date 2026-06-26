import {
  Fragment,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";

import { defaultProps } from "./AutoComplete.defaults";
import { useFormContext } from "../Form/FormContext";
import styles from "./AutoComplete.module.scss";
import { isTopLayer, registerLayer } from "../layerStack";

export type AutoCompleteOption = {
  value: unknown;
  label: ReactNode;
  enabled: boolean;
  searchText?: string;
  selectionLabel?: string;
  group?: string;
  groupHeader?: ReactNode;
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
  label?: string;
  initialValue?: unknown;
  value?: unknown;
  enabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  requireLabelMode?: string;
  validationStatus?: string;
  verboseValidationFeedback?: boolean;
  validationMode?: string;
  multi?: boolean;
  initiallyOpen?: boolean;
  creatable?: boolean;
  dropdownHeight?: string | number;
  className?: string;
  style?: CSSProperties;
  options?: AutoCompleteOption[];
  popupChildren?: ReactNode;
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
    label,
    initialValue,
    value: controlledValue,
    enabled = defaultProps.enabled,
    placeholder = defaultProps.placeholder,
    autoFocus = defaultProps.autoFocus,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    requireLabelMode,
    validationStatus,
    verboseValidationFeedback,
    validationMode,
    multi = defaultProps.multi,
    initiallyOpen = defaultProps.initiallyOpen,
    creatable = defaultProps.creatable,
    dropdownHeight,
    className,
    style,
    options = [],
    popupChildren,
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
  const generatedInputId = useId();
  const inputId = id ?? generatedInputId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerIdRef = useRef<symbol>(Symbol("AutoComplete"));
  const closeOnInputClickRef = useRef(false);
  const ignoreNextMultiArrowDownRef = useRef(false);
  const [internalValue, setInternalValue] = useState<unknown>(() => normalizeValue(initialValue, multi));
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(initiallyOpen);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validationTooltipVisible, setValidationTooltipVisible] = useState(false);
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const effectiveControlledValue = formValue ?? controlledValue;
  const currentValue = effectiveControlledValue === undefined ? internalValue : normalizeValue(effectiveControlledValue, multi);
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    Boolean(required) && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");

  useEffect(() => {
    setInternalValue(normalizeValue(initialValue, multi));
  }, [initialValue, multi]);

  useEffect(() => {
    if (!getFormValue || !setFormValue || fieldName === undefined || getFormValue(fieldName) != null || initialValue === undefined) {
      return;
    }
    setFormValue(fieldName, normalizeValue(initialValue, multi));
  }, [fieldName, getFormValue, initialValue, multi, setFormValue]);

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      label,
      required,
    });
  }, [fieldName, label, registerFormItem, required]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const unregisterLayer = registerLayer(layerIdRef.current);
    const onPointerDown = (event: PointerEvent) => {
      if (!isTopLayer(layerIdRef.current)) {
        return;
      }
      if ((event as PointerEvent & { __xmluiLayerHandled?: boolean }).__xmluiLayerHandled) {
        return;
      }
      if ((event.target as Element | null)?.closest("[data-xmlui-confirm-layer]")) {
        return;
      }
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }
      (event as PointerEvent & { __xmluiLayerHandled?: boolean }).__xmluiLayerHandled = true;
      setOpen(false);
      setActiveIndex(-1);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      unregisterLayer();
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  useEffect(() => {
    if (multi) {
      return;
    }
    const selected = options.find((option) => valuesEqual(option.value, currentValue));
    if (selected && typeof selected.label === "string") {
      setInputValue(selected.label);
    }
  }, [currentValue, multi, options]);

  const updateValue = useCallback((nextValue: unknown) => {
    const normalizedNextValue = normalizeValue(nextValue, multi);
    setInternalValue(normalizedNextValue);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, normalizedNextValue);
      void validateFormField?.(fieldName, normalizedNextValue);
    }
    void onDidChange?.(normalizedNextValue);
  }, [fieldName, multi, onDidChange, setFormValue, validateFormField]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setValue: (nextValue) => {
      updateValue(nextValue);
    },
    get value() {
      return currentValue;
    },
  }), [currentValue, updateValue]);

  const selectedValues = useMemo(() => normalizeArrayValue(currentValue), [currentValue]);
  const selectedOptions = useMemo(
    () => selectedValues
      .map((selectedValue) => options.find((option) => valuesEqual(option.value, selectedValue)))
      .filter((option): option is AutoCompleteOption => option !== undefined),
    [options, selectedValues],
  );
  const validationMessage = fieldName ? form?.errors[fieldName] : undefined;
  const effectiveVerboseValidation = verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;
  const validAfterChange =
    !validationMessage &&
    required &&
    selectedValues.length > 0 &&
    (validationMode === "onChanged" || validationMode === undefined);
  const showConciseValidation =
    !effectiveVerboseValidation && (Boolean(validationMessage) || validAfterChange);

  const filteredOptions = useMemo(() => {
    const term = inputValue.trim().toLowerCase();
    if (!term) {
      return options;
    }
    return options.filter((option) => {
      const haystack = [
        String(option.value ?? ""),
        option.searchText ?? labelText(option.label),
        ...(option.keywords ?? []),
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [inputValue, options]);

  const showCreatable = creatable &&
    inputValue.trim() !== "" &&
    !options.some((option) =>
      String(option.value) === inputValue ||
      (option.searchText ?? labelText(option.label)) === inputValue
    );

  const createValue = () => {
    if (!showCreatable || readOnly || !enabled) {
      return;
    }
    const value = inputValue.trim();
    if (multi) {
      updateValue([...selectedValues, value]);
      setInputValue("");
      setOpen(true);
    } else {
      updateValue(value);
      setOpen(false);
    }
    setActiveIndex(-1);
    void onItemCreated?.(value);
  };

  const selectValue = (value: unknown, label: ReactNode, inputLabel = labelText(label)) => {
    if (readOnly || !enabled) {
      return;
    }
    if (multi) {
      const exists = selectedValues.some((selectedValue) => valuesEqual(selectedValue, value));
      updateValue(exists
        ? selectedValues.filter((selectedValue) => !valuesEqual(selectedValue, value))
        : [...selectedValues, value]);
      setInputValue("");
      setOpen(true);
    } else {
      updateValue(value);
      setInputValue(inputLabel);
      setOpen(false);
    }
    setActiveIndex(-1);
  };

  const visibleBadgeCount = selectedOptions.length > 3 ? 2 : selectedOptions.length;
  const visibleBadges = selectedOptions.slice(0, visibleBadgeCount);
  const overflowOptions = selectedOptions.slice(visibleBadgeCount);
  const removeOverflowValues = () => {
    if (overflowOptions.length === 0) {
      return;
    }
    const overflowValues = new Set(overflowOptions.map((option) => String(option.value ?? "")));
    updateValue(selectedValues.filter((value) => !overflowValues.has(String(value ?? ""))));
  };

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      className={multi ? styles.autoCompleteMultiInput : styles.autoCompleteInput}
      type="text"
      role="combobox"
      aria-expanded={open}
      aria-autocomplete="list"
      placeholder={multi && selectedOptions.length > 0 ? "" : placeholder}
      disabled={!enabled}
      readOnly={readOnly}
      required={required}
      autoFocus={autoFocus}
      value={inputValue}
      data-xmlui-part="input"
      data-part-id="input"
      onFocus={() => {
        if (enabled && !readOnly) {
          ignoreNextMultiArrowDownRef.current = multi;
          setOpen(true);
        }
        void onFocus?.();
      }}
      onBlur={() => {
        if (fieldName !== undefined) {
          void validateFormField?.(fieldName, currentValue);
        }
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
          if (multi && open && activeIndex < 0 && ignoreNextMultiArrowDownRef.current) {
            ignoreNextMultiArrowDownRef.current = false;
            setOpen(true);
            return;
          }
          ignoreNextMultiArrowDownRef.current = false;
          moveActive(1);
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          moveActive(-1);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          return;
        }
        if (event.key === "Enter" && activeIndex >= 0 && filteredOptions[activeIndex]) {
          event.preventDefault();
          const option = filteredOptions[activeIndex];
          if (option.enabled) {
            selectValue(option.value, option.label, option.selectionLabel);
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
      onMouseDown={() => {
        closeOnInputClickRef.current = multi && open && document.activeElement === inputRef.current;
      }}
      onClick={() => {
        if (!multi || !enabled || readOnly) {
          return;
        }
        if (closeOnInputClickRef.current) {
          setOpen(false);
          setActiveIndex(-1);
          return;
        }
        setOpen(true);
      }}
    />
  );

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
      ref={rootRef}
      data-xmlui-component="AutoComplete"
      data-xmlui-id={id}
      data-testid={dataTestId}
      className={cx(styles.autoCompleteRoot, validationStatusClass(validationStatus), className)}
      style={style}
    >
      {label ? (
        <label className={styles.autoCompleteLabel} htmlFor={inputId}>
          {label}
          {showRequiredIndicator ? <span className={styles.requiredIndicator}>*</span> : null}
          {showOptionalIndicator ? <span className={styles.optionalIndicator}>(Optional)</span> : null}
        </label>
      ) : null}
      {multi ? (
        <div
          className={styles.autoCompleteMultiTrigger}
          onMouseDown={(event) => {
            if (event.target !== inputRef.current) {
              event.preventDefault();
            }
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {visibleBadges.map((option) => (
            <span className={styles.autoCompleteBadge} key={String(option.value)}>
              {option.selectionLabel ?? labelText(option.label)}
            </span>
          ))}
          {overflowOptions.length > 0 ? (
            <button
              type="button"
              className={styles.autoCompleteMoreChip}
              aria-label={`${overflowOptions.length} more selected`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
                inputRef.current?.focus();
              }}
            >
              +{overflowOptions.length} more
              <svg
                viewBox="0 0 10 10"
                aria-hidden="true"
                focusable="false"
                onClick={(event) => {
                  event.stopPropagation();
                  removeOverflowValues();
                }}
              >
                <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
          {selectedOptions.map((option) => (
            <span
              className={styles.autoCompleteGhostBadge}
              data-ghost="badge"
              aria-hidden="true"
              key={`ghost:${String(option.value)}`}
            >
              {option.selectionLabel ?? labelText(option.label)}
            </span>
          ))}
          {input}
        </div>
      ) : input}
      {showConciseValidation ? (
        <span
          className={styles.autoCompleteConciseValidationFeedback}
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          onMouseEnter={() => setValidationTooltipVisible(true)}
          onMouseLeave={() => setValidationTooltipVisible(false)}
        >
          <span data-icon-name={validationMessage ? "error" : "checkmark"} />
          {validationTooltipVisible && validationMessage ? (
            <span className={styles.autoCompleteValidationTooltip} data-tooltip-container="">
              {validationMessage}
            </span>
          ) : null}
        </span>
      ) : null}
      <div
        className={styles.autoCompleteMenu}
        role="listbox"
        data-xmlui-part="listWrapper"
        data-part-id="listWrapper"
        aria-expanded={open}
        hidden={!open || !enabled}
        style={dropdownHeight !== undefined ? { maxHeight: cssLength(dropdownHeight) } : undefined}
      >
          {filteredOptions.map((option, index) => {
            const previousGroup = index > 0 ? filteredOptions[index - 1]?.group : undefined;
            const showGroupHeader = option.group !== undefined && option.group !== previousGroup;
            return (
              <Fragment key={`${String(option.value)}:${index}`}>
                {showGroupHeader ? (
                  <div className={styles.autoCompleteGroupHeader}>
                    {option.groupHeader ?? option.group}
                  </div>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={styles.autoCompleteItem}
                  disabled={!option.enabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (option.enabled) {
                      selectValue(option.value, option.label, option.selectionLabel);
                    }
                  }}
                >
                  {option.label}
                </button>
              </Fragment>
            );
          })}
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
          {popupChildren}
      </div>
      {effectiveVerboseValidation && validationMessage ? (
        <div className={styles.autoCompleteValidationMessage} data-xmlui-part="validationMessage">
          {validationMessage}
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

function normalizeValue(value: unknown, multi: boolean): unknown {
  if (multi) {
    return normalizeArrayValue(value);
  }
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function normalizeArrayValue(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return [value];
}

function valuesEqual(left: unknown, right: unknown): boolean {
  return Object.is(left, right) || String(left ?? "") === String(right ?? "");
}

function cssLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  return fieldPrefix ? `${fieldPrefix}.${bindTo}` : bindTo;
}

function validationStatusClass(status?: string): string | undefined {
  if (status === "warning") {
    return styles.autoCompleteValidationWarning;
  }
  if (status === "error") {
    return styles.autoCompleteValidationError;
  }
  if (status === "valid" || status === "success") {
    return styles.autoCompleteValidationSuccess;
  }
  return undefined;
}
