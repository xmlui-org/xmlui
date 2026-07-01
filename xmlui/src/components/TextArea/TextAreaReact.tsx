import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { defaultProps } from "./TextArea.defaults";
import { useFormContext } from "../Form/FormContext";
import styles from "./TextArea.module.scss";

export type TextAreaProps = {
  id?: string;
  bindTo?: string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  requireLabelMode?: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoSize?: boolean;
  resize?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string | boolean;
  autoCorrect?: boolean;
  spellCheck?: boolean;
  autoCapitalize?: string;
  enterSubmits?: boolean;
  escResets?: boolean;
  tabIndex?: number;
  allowCopy?: boolean;
  verboseValidationFeedback?: boolean;
  validationStatus?: string;
  invalidMessages?: string[];
  registerComponentApi?: (api: Record<string, unknown>) => void;
  onDidChange?: (value: string) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
};

export type TextAreaApi = {
  focus: () => void;
  insert: (value: unknown) => void;
  setValue: (value: unknown) => void;
  value: string;
};

export const TextAreaNative = memo(forwardRef<TextAreaApi, TextAreaProps>(function TextAreaNative(
  {
    id,
    bindTo,
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    requireLabelMode,
    placeholder = defaultProps.placeholder,
    maxLength,
    rows,
    minRows,
    maxRows,
    autoSize,
    resize,
    enabled = defaultProps.enabled,
    readOnly = defaultProps.readOnly,
    required = defaultProps.required,
    autoFocus = defaultProps.autoFocus,
    autoComplete = defaultProps.autoComplete,
    autoCorrect,
    spellCheck,
    autoCapitalize,
    enterSubmits = defaultProps.enterSubmits,
    escResets = false,
    tabIndex,
    allowCopy = defaultProps.allowCopy,
    verboseValidationFeedback,
    validationStatus = defaultProps.validationStatus,
    invalidMessages = defaultProps.invalidMessages,
    registerComponentApi,
    onDidChange,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useFormContext();
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const validateFormField = form?.validateField;
  const registerFormItem = form?.registerItem;
  const generatedInputId = useId();
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const formError = form && fieldName !== undefined ? form.errors[fieldName] : undefined;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback = verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;
  const effectiveValue = formValue ?? value;
  const controlled = effectiveValue !== undefined;
  const [localValue, setLocalValue] = useState(() => stringifyTextAreaValue(effectiveValue ?? initialValue));
  const [selectionAfterInsert, setSelectionAfterInsert] = useState<number | null>(null);
  const [hadValidationError, setHadValidationError] = useState(false);
  const [showValidFeedback, setShowValidFeedback] = useState(false);
  const [conciseTooltipVisible, setConciseTooltipVisible] = useState(false);

  useEffect(() => {
    if (controlled) {
      setLocalValue(stringifyTextAreaValue(effectiveValue));
    }
  }, [controlled, effectiveValue]);

  useEffect(() => {
    if (formError) {
      setHadValidationError(true);
      setShowValidFeedback(false);
    }
  }, [formError]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(stringifyTextAreaValue(initialValue));
    }
  }, [controlled, initialValue]);

  useEffect(() => {
    if (
      !getFormValue ||
      !setFormValue ||
      fieldName === undefined ||
      getFormValue(fieldName) != null ||
      initialValue === undefined
    ) {
      return;
    }
    setFormValue(fieldName, initialValue);
  }, [fieldName, getFormValue, initialValue, setFormValue]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  useEffect(() => {
    if (selectionAfterInsert === null) {
      return;
    }
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.setSelectionRange(selectionAfterInsert, selectionAfterInsert);
    }
    setSelectionAfterInsert(null);
  }, [localValue, selectionAfterInsert]);

  const updateValue = useCallback((nextValue: unknown) => {
    const normalized = stringifyTextAreaValue(nextValue);
    setShowValidFeedback(false);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, normalized);
    }
    setLocalValue(normalized);
    void onDidChange?.(normalized);
  }, [fieldName, onDidChange, setFormValue]);

  const focus = useCallback(() => {
    if (enabled) {
      textareaRef.current?.focus();
    }
  }, [enabled]);

  const insert = useCallback((insertedValue: unknown) => {
    const textarea = textareaRef.current;
    const insertedText = stringifyTextAreaApiValue(insertedValue);
    if (!textarea || !insertedText) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = `${localValue.slice(0, start)}${insertedText}${localValue.slice(end)}`;
    updateValue(nextValue);
    setSelectionAfterInsert(start + insertedText.length);
  }, [localValue, updateValue]);

  const setApiValue = useCallback((value: unknown) => {
    updateValue(stringifyTextAreaApiValue(value));
  }, [updateValue]);

  useEffect(() => {
    registerComponentApi?.({
      focus,
      insert,
      setValue: setApiValue,
    });
  }, [focus, insert, registerComponentApi, setApiValue]);

  useEffect(() => {
    registerComponentApi?.({
      value: localValue,
    });
  }, [localValue, registerComponentApi]);

  const handleBlur = useCallback(() => {
    void onBlur?.();
    if (!validateFormField || fieldName === undefined || !hadValidationError) {
      return;
    }
    void validateFormField(fieldName, textareaRef.current?.value).then((message) => {
      setShowValidFeedback(!message);
    });
  }, [fieldName, hadValidationError, onBlur, validateFormField]);

  useImperativeHandle(ref, () => ({
    focus,
    insert,
    setValue: setApiValue,
    get value() {
      return localValue;
    },
  }), [focus, insert, localValue, setApiValue]);

  const autoSizing = Boolean(autoSize || minRows !== undefined || maxRows !== undefined);
  const effectiveRows = autoSizing ? 1 : rows ?? defaultProps.rows;
  const rowAttribute = normalizePositiveRows(effectiveRows);

  useEffect(() => {
    if (!autoSizing) {
      return;
    }
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    const computedStyle = window.getComputedStyle(textarea);
    const borderHeight =
      computedStyle.boxSizing === "border-box"
        ? parseCssPixelValue(computedStyle.borderTopWidth) + parseCssPixelValue(computedStyle.borderBottomWidth)
        : 0;
    textarea.style.height = `${textarea.scrollHeight + borderHeight}px`;
  }, [autoSizing, localValue, effectiveRows, minRows, maxRows]);

  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const labelText = stringifyLabel(label);
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    Boolean(required) && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");
  const effectiveValidationStatus = formError
    ? "error"
    : !effectiveVerboseValidationFeedback && showValidFeedback
      ? "valid"
      : validationStatus;

  useEffect(() => {
    if (!registerFormItem || fieldName === undefined) {
      return;
    }
    return registerFormItem({
      name: fieldName,
      label: labelText,
      required,
    });
  }, [fieldName, labelText, registerFormItem, required]);

  const textareaStyle = useMemo<CSSProperties>(() => ({
    ...(minRows ? { minHeight: `${minRows * 1.5}em` } : undefined),
    ...(maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined),
    ...(maxRows ? { overflowY: "auto" } : undefined),
  }), [maxRows, minRows]);
  const textarea = (
    <div
      {...(!hasLabel ? rest : undefined)}
      data-part-id="root"
      data-xmlui-part="root"
      className={cx(styles.textAreaContainer, !hasLabel ? className : undefined)}
      style={!hasLabel ? style : undefined}
    >
      <textarea
        id={inputId}
        ref={textareaRef}
        data-part-id="input"
        data-xmlui-part="input"
        className={cx(
          styles.textAreaInput,
          resize === "horizontal" ? styles.textAreaResizeHorizontal : undefined,
          resize === "vertical" ? styles.textAreaResizeVertical : undefined,
          resize === "both" ? styles.textAreaResizeBoth : undefined,
          effectiveValidationStatus === "error" ? styles.textAreaError : undefined,
          effectiveValidationStatus === "warning" ? styles.textAreaWarning : undefined,
          effectiveValidationStatus === "valid" ? styles.textAreaSuccess : undefined,
        )}
        style={textareaStyle}
        value={localValue}
        placeholder={placeholder}
        maxLength={normalizeMaxLength(maxLength)}
        rows={rowAttribute}
        disabled={!enabled}
        readOnly={readOnly}
        required={required}
        tabIndex={enabled ? tabIndex : -1}
        aria-multiline="true"
        aria-readonly={readOnly}
        autoComplete={normalizeAutoComplete(autoComplete)}
        autoCorrect={normalizeOnOff(autoCorrect)}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => updateValue(event.currentTarget.value)}
        onCopy={(event) => {
          if (!allowCopy) {
            event.preventDefault();
          }
        }}
        onFocus={(_event: FocusEvent<HTMLTextAreaElement>) => void onFocus?.()}
        onBlur={(_event: FocusEvent<HTMLTextAreaElement>) => handleBlur()}
        onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
          if (event.currentTarget.form && event.key.toLowerCase() === "enter" && enterSubmits && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form.requestSubmit();
          }
          if (event.currentTarget.form && event.key.toLowerCase() === "escape" && escResets && !event.shiftKey) {
            event.preventDefault();
            updateValue(initialValue);
            event.currentTarget.form.reset();
          }
        }}
      />
      {!effectiveVerboseValidationFeedback && effectiveValidationStatus && effectiveValidationStatus !== "none" ? (
        <span
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          className={styles.textAreaConciseFeedback}
          onMouseEnter={() => setConciseTooltipVisible(true)}
          onMouseLeave={() => setConciseTooltipVisible(false)}
          onFocus={() => setConciseTooltipVisible(true)}
          onBlur={() => setConciseTooltipVisible(false)}
          tabIndex={-1}
        >
          <span
            data-icon-name={effectiveValidationStatus === "valid" ? "checkmark" : "error"}
            className={styles.textAreaIconMarker}
          />
          {conciseTooltipVisible && effectiveValidationStatus !== "valid" && effectiveInvalidMessages?.length ? (
            <span data-tooltip-container role="tooltip" className={styles.textAreaConciseTooltip}>
              {effectiveInvalidMessages.join("\n")}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
  const validationFeedback = effectiveVerboseValidationFeedback && effectiveInvalidMessages?.length ? (
    <div data-xmlui-part="error">
      {effectiveInvalidMessages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  ) : null;

  if (!hasLabel) {
    return (
      <>
        {textarea}
        {validationFeedback}
      </>
    );
  }

  return (
    <div {...rest} className={className} style={style}>
      <div className={styles.textAreaLabeledItem} data-part-id="labeledItem" data-xmlui-part="labeledItem">
        <label data-part-id="label" data-xmlui-part="label" htmlFor={inputId} className={styles.textAreaLabel}>
          {labelText}
          {showRequiredIndicator ? <span className={styles.textAreaLabelRequired}>*</span> : null}
          {showOptionalIndicator ? <span className={styles.textAreaLabelOptional}>(Optional)</span> : null}
        </label>
        {textarea}
        {validationFeedback}
      </div>
    </div>
  );
}));

function stringifyTextAreaValue(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (Array.isArray(value)) {
    return "";
  }
  if (typeof value === "function") {
    return "[object Object]";
  }
  if (typeof value === "object") {
    return String(value);
  }
  return String(value);
}

function stringifyTextAreaApiValue(value: unknown): string {
  const stringValue = stringifyTextAreaValue(value);
  return stringValue
    .replace(/\\r\\n/g, "\r\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

function stringifyLabel(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  if (typeof value === "function") {
    return "";
  }
  if (typeof value === "object") {
    return "";
  }
  return String(value);
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function normalizePositiveRows(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : defaultProps.rows;
}

function parseCssPixelValue(value: string): number {
  const numberValue = Number.parseFloat(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeMaxLength(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
}

function normalizeOnOff(value: boolean | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value ? "on" : "off";
}

function normalizeAutoComplete(value: string | boolean | undefined): string | undefined {
  return typeof value === "boolean" ? normalizeOnOff(value) : value;
}

function cx(...values: Array<string | undefined | false>): string | undefined {
  const className = values.filter(Boolean).join(" ");
  return className || undefined;
}
