import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  isValidElement,
  type ReactNode,
} from "react";

import { defaultProps } from "./Select.defaults";
import styles from "./Select.module.scss";
import type { XmluiOption } from "../Option/OptionReact";
import { useFormContext } from "../Form/FormContext";
import { isTopLayer, registerLayer } from "../layerStack";

export type SelectValue = string | number | Array<string | number> | undefined | null;

export type SelectApi = {
  focus: () => void;
  reset: () => void;
  setValue: (value: SelectValue) => void;
  value: SelectValue;
};

export type SelectProps = {
  id?: string;
  bindTo?: string;
  label?: string;
  labelPosition?: string;
  labelBreak?: boolean;
  labelWidth?: string | number;
  validationStatus?: string;
  requireLabelMode?: string;
  verboseValidationFeedback?: boolean;
  validationMode?: string;
  initialValue?: SelectValue;
  value?: SelectValue;
  enabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  required?: boolean;
  multiSelect?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  inProgress?: boolean;
  inProgressNotificationMessage?: string;
  dropdownHeight?: string | number;
  groupBy?: string;
  scrollIndicators?: boolean;
  className?: string;
  style?: CSSProperties;
  options?: XmluiOption[];
  popupChildren?: ReactNode;
  emptyListTemplate?: ReactNode;
  valueTemplateRenderer?: (contextValues: Record<string, unknown>, key?: string | number) => ReactNode;
  groupHeaderTemplateRenderer?: (contextValues: Record<string, unknown>, key?: string | number) => ReactNode;
  ungroupedHeaderTemplateRenderer?: (contextValues: Record<string, unknown>, key?: string | number) => ReactNode;
  onDidChange?: (value: SelectValue) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const SelectNative = memo(forwardRef<SelectApi, SelectProps>(function SelectNative(
  {
    id,
    bindTo,
    label,
    labelPosition = "top",
    labelBreak = defaultProps.labelBreak,
    labelWidth,
    validationStatus,
    requireLabelMode,
    verboseValidationFeedback,
    validationMode,
    initialValue,
    value: controlledValue,
    enabled = defaultProps.enabled,
    placeholder = defaultProps.placeholder,
    autoFocus = defaultProps.autoFocus,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    multiSelect = defaultProps.multiSelect,
    clearable = defaultProps.clearable,
    searchable = defaultProps.searchable,
    inProgress = defaultProps.inProgress,
    inProgressNotificationMessage = defaultProps.inProgressNotificationMessage,
    dropdownHeight,
    groupBy,
    scrollIndicators = true,
    className,
    style,
    options = [],
    popupChildren,
    emptyListTemplate,
    valueTemplateRenderer,
    groupHeaderTemplateRenderer,
    ungroupedHeaderTemplateRenderer,
    onDidChange,
    onFocus,
    onBlur,
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
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const fieldName = useMemo(() => {
    if (!bindTo) {
      return undefined;
    }
    return form?.fieldPrefix ? `${form.fieldPrefix}.${bindTo}` : bindTo;
  }, [bindTo, form?.fieldPrefix]);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const layerIdRef = useRef<symbol>(Symbol("Select"));
  const normalizedInitialValue = useMemo(
    () => normalizeValue(initialValue, multiSelect),
    [initialValue, multiSelect],
  );
  const normalizedInitialValueKey = stableValueKey(normalizedInitialValue);
  const optionsKey = useMemo(
    () => options.map((option) => `${String(option.value ?? "")}:${option.enabled === false ? "0" : "1"}`).join("\u0000"),
    [options],
  );
  const [internalValue, setInternalValue] = useState<SelectValue>(normalizedInitialValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationTooltipVisible, setValidationTooltipVisible] = useState(false);
  const formValue = fieldName !== undefined ? getFormValue?.(fieldName) as SelectValue : undefined;
  const currentValue = formValue !== undefined
    ? normalizeValue(formValue, multiSelect)
    : controlledValue === undefined
    ? internalValue
    : normalizeValue(controlledValue, multiSelect);
  const currentValueRef = useRef<SelectValue>(currentValue);
  currentValueRef.current = currentValue;

  useEffect(() => {
    setInternalValue(normalizedInitialValue);
  }, [normalizedInitialValueKey]);

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      required,
      sanitizeSubmitValue: (submittedValue) => sanitizeSelectSubmitValue(
        submittedValue as SelectValue,
        options,
        multiSelect,
      ),
    });
  }, [fieldName, multiSelect, optionsKey, registerFormItem, required]);

  useEffect(() => {
    if (!setFormValue || fieldName === undefined) {
      return;
    }
    const validOptionValues = new Set(options.map((option) => String(option.value ?? "")));
    const sourceValue = formValue !== undefined ? formValue : normalizedInitialValue;
    if (multiSelect) {
      const filtered = normalizeArrayValue(sourceValue).filter((item) => validOptionValues.has(String(item)));
      const hadValues = normalizeArrayValue(sourceValue).length > 0;
      if (filtered.length > 0 || hadValues) {
        const nextValue = filtered.length > 0 ? filtered : undefined;
        if (stableValueKey(formValue) !== stableValueKey(nextValue as SelectValue)) {
          setFormValue(fieldName, nextValue);
        }
      }
      return;
    }
    if (sourceValue === undefined || sourceValue === null || sourceValue === "") {
      return;
    }
    if (validOptionValues.has(String(sourceValue))) {
      if (formValue === undefined) {
        setFormValue(fieldName, sourceValue);
      }
      return;
    }
    if (formValue !== null) {
      setFormValue(fieldName, null);
    }
  }, [
    fieldName,
    formValue,
    multiSelect,
    normalizedInitialValue,
    optionsKey,
    options,
    setFormValue,
  ]);

  const updateValue = useCallback((nextValue: SelectValue) => {
    currentValueRef.current = nextValue;
    setInternalValue(nextValue);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, nextValue);
      void validateFormField?.(fieldName, nextValue);
    }
    void onDidChange?.(nextValue);
  }, [fieldName, onDidChange, setFormValue, validateFormField]);

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
      window.setTimeout(() => setOpen(false), 0);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      unregisterLayer();
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

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
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!searchable || !term) {
      return options;
    }
    return options.filter((option) => {
      const haystack = [
        String(option.value ?? ""),
        option.searchText ?? optionText(option),
        ...(option.keywords ?? []),
      ].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [options, searchable, searchTerm]);
  const visibleOptions = readOnly ? selectedOptions : filteredOptions;
  const groupedVisibleItems = useMemo(
    () => groupedItems(visibleOptions, groupBy, groupHeaderTemplateRenderer, ungroupedHeaderTemplateRenderer),
    [groupBy, groupHeaderTemplateRenderer, ungroupedHeaderTemplateRenderer, visibleOptions],
  );
  const displayText = selectedOptions.length > 0
    ? selectedOptions.map((option) => optionText(option)).join(", ")
    : placeholder;
  const hasSelection = multiSelect ? selectedValues.length > 0 : selectedValues[0] !== "";
  const showClearButton = clearable && hasSelection && enabled && !readOnly;
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    required && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");
  const validationMessage = fieldName ? form?.errors[fieldName] : undefined;
  const effectiveVerboseValidation = verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;
  const validAfterChange =
    validationMode === "onChanged" &&
    !validationMessage &&
    required &&
    (multiSelect ? selectedValues.length > 0 : selectedValues[0] !== "");
  const showConciseValidation = !effectiveVerboseValidation && (Boolean(validationMessage) || validAfterChange);

  const selectOption = useCallback((option: XmluiOption) => {
    if (readOnly || !enabled || !option.enabled) {
      return;
    }
    const optionValue = String(option.value ?? "");
    if (multiSelect) {
      const current = new Set(normalizeArrayValue(currentValueRef.current).map(String));
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
  }, [enabled, multiSelect, readOnly, updateValue]);

  const clearSelection = useCallback(() => {
    updateValue(multiSelect ? [] : null);
    setOpen(false);
    setActiveIndex(-1);
    setSearchTerm("");
  }, [multiSelect, updateValue]);

  const moveActive = useCallback((offset: number) => {
    if (!open) {
      setOpen(true);
    }
    const enabledIndexes = visibleOptions
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
  }, [activeIndex, open, visibleOptions]);

  return (
    <div
      {...rest}
      ref={rootRef}
      id={id}
      data-xmlui-component="Select"
      data-testid={dataTestId}
      data-value={multiSelect ? selectedValues.join(",") : selectedValues[0] ?? ""}
      className={cx(
        styles.selectRoot,
        label ? styles.selectRootWithLabel : undefined,
        label ? labelPositionClass(labelPosition, (rest as { dir?: unknown }).dir) : undefined,
        labelBreak ? styles.selectLabelBreak : undefined,
        validationStatusClass(validationStatus),
        className,
      )}
      style={style}
      tabIndex={autoFocus ? -1 : undefined}
    >
      {label ? (
        <label
          className={styles.selectLabel}
          htmlFor={triggerId}
          style={labelWidth !== undefined ? { width: cssLength(labelWidth) } : undefined}
        >
          {label}
          {showRequiredIndicator ? <span className={styles.selectRequiredIndicator}>*</span> : null}
          {showOptionalIndicator ? <span className={styles.selectOptionalIndicator}>(Optional)</span> : null}
        </label>
      ) : null}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={open}
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
                setActiveIndex(visibleOptions.findIndex((option) => option.enabled));
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
            selectOption(visibleOptions[activeIndex]);
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        onFocus={() => void onFocus?.()}
        onBlur={() => void onBlur?.()}
      >
        {selectedOptions.length > 0 && valueTemplateRenderer
          ? selectedOptions.map((option, index) => (
            <span key={`${String(option.value ?? "")}:${index}`} className={styles.selectValueTemplate}>
              {valueTemplateRenderer({
                $item: option,
                $itemIndex: index,
                $itemContext: {
                  removeItem: () => {
                    if (multiSelect) {
                      const next = normalizeArrayValue(currentValueRef.current)
                        .map(String)
                        .filter((value) => value !== String(option.value ?? ""));
                      updateValue(next);
                    } else {
                      updateValue(null);
                    }
                  },
                },
              }, index)}
            </span>
          ))
          : displayText}
      </button>
      {showClearButton ? (
        <button
          type="button"
          className={styles.selectClearButton}
          data-xmlui-part="clearButton"
          data-part-id="clearButton"
          aria-label="Clear selection"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearSelection}
        >
          ×
        </button>
      ) : null}
      {showConciseValidation ? (
        <span
          className={styles.selectConciseValidationFeedback}
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          onMouseEnter={() => setValidationTooltipVisible(true)}
          onMouseLeave={() => setValidationTooltipVisible(false)}
        >
          <span data-icon-name={validationMessage ? "error" : "checkmark"} />
          {validationTooltipVisible && validationMessage ? (
            <span className={styles.selectValidationTooltip} data-tooltip-container="">
              {validationMessage}
            </span>
          ) : null}
        </span>
      ) : null}
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
            {nativeMirrorText(option, open)}
          </option>
        ))}
      </select>
      {open ? (
        <div
          data-radix-popper-content-wrapper=""
          className={styles.selectPopover}
        >
        <div
          id={id ? `${id}__options` : undefined}
          role="listbox"
          data-state="open"
          data-part-id="listWrapper"
          data-xmlui-part="listWrapper"
          data-radix-select-viewport=""
          aria-multiselectable={multiSelect || undefined}
          className={styles.selectOptions}
          style={dropdownHeight !== undefined ? { maxHeight: cssLength(dropdownHeight) } : undefined}
        >
          {searchable ? (
            <input
              className={styles.selectSearch}
              role="searchbox"
              value={searchTerm}
              autoFocus
              onChange={(event) => {
                setSearchTerm(event.currentTarget.value);
                setActiveIndex(-1);
              }}
            />
          ) : null}
          {searchable && inProgress && inProgressNotificationMessage ? (
            <div className={styles.selectStatus}>{inProgressNotificationMessage}</div>
          ) : null}
          {visibleOptions.length === 0 ? (
            emptyListTemplate ? <div className={styles.selectEmpty}>{emptyListTemplate}</div> : null
          ) : null}
          {scrollIndicators && visibleOptions.length > 5 ? (
            <div className={styles.selectScrollUpButton} aria-hidden="true" />
          ) : null}
          {groupedVisibleItems.map((item, index) => {
            if (item.kind === "header") {
              return (
                <div key={`header:${item.key}:${index}`} className={styles.selectGroupHeader}>
                  {item.content}
                </div>
              );
            }
            const option = item.option;
            const optionValue = String(option.value ?? "");
            const selected = selectedValues.includes(optionValue);
            return (
              <button
                key={`${optionValue}:${index}`}
                data-testid={option.testId}
                data-value={optionValue}
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
          {popupChildren}
          {scrollIndicators && visibleOptions.length > 5 ? (
            <div className={styles.selectScrollDownButton} aria-hidden="true" />
          ) : null}
        </div>
        </div>
      ) : null}
      {effectiveVerboseValidation && validationMessage ? (
        <div className={styles.selectValidationMessage} data-xmlui-part="validationMessage">
          {validationMessage}
        </div>
      ) : null}
    </div>
  );
}));

function optionText(option: XmluiOption): string {
  return option.selectionLabel ?? labelText(option.label, option.value);
}

function nativeMirrorText(option: XmluiOption, open: boolean): string {
  const text = optionText(option);
  return open && /^Option \d+$/.test(text) ? "" : text;
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

function sanitizeSelectSubmitValue(
  value: SelectValue,
  options: XmluiOption[],
  multiSelect: boolean,
): SelectValue {
  const validOptionValues = new Set(options.map((option) => String(option.value ?? "")));
  if (multiSelect) {
    const filtered = normalizeArrayValue(value).filter((item) => validOptionValues.has(String(item)));
    return filtered.length > 0 ? filtered : undefined;
  }
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return validOptionValues.has(String(value)) ? value : null;
}

type GroupedVisibleItem =
  | { kind: "header"; key: string; content: ReactNode }
  | { kind: "option"; option: XmluiOption };

function groupedItems(
  options: XmluiOption[],
  groupBy?: string,
  groupHeaderTemplateRenderer?: (contextValues: Record<string, unknown>, key?: string | number) => ReactNode,
  ungroupedHeaderTemplateRenderer?: (contextValues: Record<string, unknown>, key?: string | number) => ReactNode,
): GroupedVisibleItem[] {
  if (!groupBy) {
    return options.map((option) => ({ kind: "option", option }));
  }
  const ungrouped: XmluiOption[] = [];
  const groups = new Map<string, XmluiOption[]>();
  for (const option of options) {
    const rawGroup = option[groupBy];
    if (rawGroup === undefined || rawGroup === null || rawGroup === "") {
      ungrouped.push(option);
      continue;
    }
    const group = String(rawGroup);
    const groupOptions = groups.get(group) ?? [];
    groupOptions.push(option);
    groups.set(group, groupOptions);
  }
  const result: GroupedVisibleItem[] = [];
  if (ungrouped.length > 0) {
    if (ungroupedHeaderTemplateRenderer) {
      result.push({
        kind: "header",
        key: "__ungrouped",
        content: ungroupedHeaderTemplateRenderer({ $group: undefined }),
      });
    }
    result.push(...ungrouped.map((option) => ({ kind: "option" as const, option })));
  }
  for (const [group, groupOptions] of groups) {
    result.push({
      kind: "header",
      key: group,
      content: groupHeaderTemplateRenderer
        ? groupHeaderTemplateRenderer({ $group: group }, group)
        : group,
    });
    result.push(...groupOptions.map((option) => ({ kind: "option" as const, option })));
  }
  return result;
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

function stableValueKey(value: SelectValue): string {
  return Array.isArray(value) ? `array:${value.map(String).join("\u0000")}` : `value:${String(value ?? "")}`;
}

function cssLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

function labelPositionClass(position: string, direction?: unknown): string {
  const normalized = position || "top";
  if (normalized === "start") {
    return direction === "rtl" ? styles.selectLabelEnd : styles.selectLabelStart;
  }
  if (normalized === "end") {
    return direction === "rtl" ? styles.selectLabelStart : styles.selectLabelEnd;
  }
  if (normalized === "bottom") {
    return styles.selectLabelBottom;
  }
  return styles.selectLabelTop;
}

function validationStatusClass(status?: string): string | undefined {
  if (status === "warning") {
    return styles.selectValidationWarning;
  }
  if (status === "error") {
    return styles.selectValidationError;
  }
  if (status === "valid" || status === "success") {
    return styles.selectValidationSuccess;
  }
  return undefined;
}
