import type { AriaAttributes, CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./TextBox.defaults";
import { useFormContext } from "../Form/FormContext";
import { ThemedIcon } from "../Icon/Icon";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling/theme";
import styles from "./TextBox.module.scss";

export type TextBoxProps = {
  id?: string;
  bindTo?: string;
  type?: "text" | "password" | "search" | "email" | string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  labelPosition?: "start" | "end" | "top" | "bottom" | string;
  labelBreak?: boolean;
  labelWidth?: string | number;
  requireLabelMode?: string;
  direction?: string;
  placeholder?: string;
  maxLength?: number;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  requiredInvalidMessage?: string;
  matchValue?: unknown;
  matchInvalidMessage?: string;
  validationMode?: string;
  autoFocus?: boolean;
  autoComplete?: string | boolean;
  autoCorrect?: boolean;
  spellCheck?: boolean;
  autoCapitalize?: string;
  tabIndex?: number;
  startText?: unknown;
  startIcon?: unknown;
  endText?: unknown;
  endIcon?: unknown;
  gap?: string;
  showPasswordToggle?: boolean;
  passwordVisibleIcon?: string;
  passwordHiddenIcon?: string;
  verboseValidationFeedback?: boolean;
  validationStatus?: string;
  invalidMessages?: string[];
  registerComponentApi?: (api: Record<string, unknown>) => void;
  onDidChange?: (value: string) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void | Promise<void>;
  "aria-autocomplete"?: AriaAttributes["aria-autocomplete"];
  "aria-controls"?: AriaAttributes["aria-controls"];
  "aria-activedescendant"?: AriaAttributes["aria-activedescendant"];
};

export type TextBoxApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: string;
};

export const TextBoxNative = memo(forwardRef<TextBoxApi, TextBoxProps>(function TextBoxNative(
  {
    id,
    bindTo,
    type = defaultProps.type,
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    labelPosition,
    labelBreak,
    labelWidth,
    requireLabelMode,
    direction,
    placeholder,
    maxLength,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    requiredInvalidMessage,
    matchValue,
    matchInvalidMessage,
    validationMode,
    autoFocus,
    autoComplete = defaultProps.autoComplete,
    autoCorrect,
    spellCheck,
    autoCapitalize,
    tabIndex,
    startText,
    startIcon,
    endText,
    endIcon,
    gap,
    showPasswordToggle,
    passwordVisibleIcon = defaultProps.passwordVisibleIcon,
    passwordHiddenIcon = defaultProps.passwordHiddenIcon,
    verboseValidationFeedback,
    validationStatus = defaultProps.validationStatus,
    invalidMessages = defaultProps.invalidMessages,
    registerComponentApi,
    onDidChange,
    onFocus,
    onBlur,
    onKeyDown,
    "aria-autocomplete": ariaAutocomplete,
    "aria-controls": ariaControls,
    "aria-activedescendant": ariaActiveDescendant,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const form = useFormContext();
  const getFormValue = form?.getValue;
  const setFormValue = form?.setValue;
  const validateFormField = form?.validateField;
  const registerFormItem = form?.registerItem;
  const themeVariables = useThemeVariables();
  const effectiveLabelPosition = labelPosition ?? form?.itemLabelPosition ?? "top";
  const effectiveLabelBreak = labelBreak ?? form?.itemLabelBreak ?? false;
  const effectiveLabelWidth = labelWidth ?? form?.itemLabelWidth;
  const generatedInputId = useId();
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const formValue = getFormValue && fieldName !== undefined ? getFormValue(fieldName) : undefined;
  const formError = form && fieldName !== undefined ? form.errors[fieldName] : undefined;
  const effectiveInvalidMessages = formError ? formError.split("\n") : invalidMessages;
  const effectiveVerboseValidationFeedback = verboseValidationFeedback ?? form?.verboseValidationFeedback ?? true;
  const effectiveValue = formValue ?? value;
  const controlled = effectiveValue !== undefined;
  const [localValue, setLocalValue] = useState(() => stringifyInputValue(effectiveValue ?? initialValue));
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [hadValidationError, setHadValidationError] = useState(false);
  const [showValidFeedback, setShowValidFeedback] = useState(false);
  const [conciseTooltipVisible, setConciseTooltipVisible] = useState(false);

  useEffect(() => {
    if (controlled) {
      setLocalValue(stringifyInputValue(effectiveValue));
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
      setLocalValue(stringifyInputValue(initialValue));
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
    const timeoutId = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  const updateValue = useCallback((nextValue: unknown) => {
    const normalized = stringifyInputValue(nextValue);
    setShowValidFeedback(false);
    if (setFormValue && fieldName !== undefined) {
      setFormValue(fieldName, normalized);
      if (validationMode === "onChanged" || matchValue !== undefined) {
        void validateFormField?.(fieldName, normalized).then((message) => {
          if (!message && hadValidationError) {
            setShowValidFeedback(true);
          }
        });
      }
    }
    setLocalValue(normalized);
    void onDidChange?.(normalized);
  }, [fieldName, hadValidationError, matchValue, onDidChange, setFormValue, validateFormField, validationMode]);

  const focus = useCallback(() => {
    if (enabled) {
      inputRef.current?.focus();
    }
  }, [enabled]);

  const relayFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue: updateValue,
    });
  }, [focus, registerComponentApi, updateValue]);

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
    void validateFormField(fieldName, inputRef.current?.value).then((message) => {
      setShowValidFeedback(!message);
    });
  }, [fieldName, hadValidationError, onBlur, validateFormField]);

  useImperativeHandle(ref, () => ({
    focus,
    setValue: updateValue,
    get value() {
      return localValue;
    },
  }), [focus, localValue, updateValue]);

  const actualType = type === "password" && passwordVisible ? "text" : type;
  const rootStyle = useMemo<CSSProperties>(() => ({
    ...style,
    ...(gap ? { "--xmlui-runtime-gap-TextBox": gap } as CSSProperties : undefined),
  }), [gap, style]);
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
      requiredInvalidMessage,
      matchValue,
      matchInvalidMessage,
    });
  }, [
    fieldName,
    labelText,
    matchInvalidMessage,
    matchValue,
    registerFormItem,
    required,
    requiredInvalidMessage,
  ]);

  const labelNode = hasLabel ? (
    <label
      data-part-id="label"
      data-xmlui-part="label"
      htmlFor={inputId}
      className={cx(styles.textBoxLabel, effectiveLabelBreak ? styles.textBoxLabelBreak : undefined)}
      style={effectiveLabelWidth !== undefined ? { width: cssLength(effectiveLabelWidth, themeVariables) } : undefined}
    >
      {labelText}
      {showRequiredIndicator ? <span className={styles.textBoxLabelRequired}>*</span> : null}
      {showOptionalIndicator ? <span className={styles.textBoxLabelOptional}>(Optional)</span> : null}
    </label>
  ) : null;
  const inputRoot = (
    <div
      {...(!hasLabel ? rest : undefined)}
      data-xmlui-part="input"
      className={cx(
        styles.textBoxRoot,
        !enabled ? styles.textBoxDisabled : undefined,
        readOnly ? styles.textBoxReadOnly : undefined,
        effectiveValidationStatus === "error" ? styles.textBoxError : undefined,
        effectiveValidationStatus === "warning" ? styles.textBoxWarning : undefined,
        effectiveValidationStatus === "valid" ? styles.textBoxSuccess : undefined,
        !hasLabel ? className : undefined,
      )}
      style={!hasLabel ? rootStyle : undefined}
      tabIndex={-1}
      onFocus={relayFocus}
    >
      <Adornment partId="startAdornment" text={startText} icon={startIcon} />
      <input
        id={inputId}
        ref={inputRef}
        data-part-id="input"
        data-xmlui-part="input"
        className={styles.textBoxInput}
        type={normalizeInputType(actualType)}
        value={localValue}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={!enabled}
        readOnly={readOnly}
        required={required}
        tabIndex={enabled ? tabIndex : -1}
        autoComplete={normalizeAutoComplete(autoComplete)}
        autoCorrect={normalizeOnOff(autoCorrect)}
        spellCheck={spellCheck}
        autoCapitalize={autoCapitalize}
        aria-autocomplete={ariaAutocomplete}
        aria-controls={ariaControls}
        aria-activedescendant={ariaActiveDescendant}
        onChange={(event: ChangeEvent<HTMLInputElement>) => updateValue(event.currentTarget.value)}
        onFocus={(_event: FocusEvent<HTMLInputElement>) => void onFocus?.()}
        onBlur={(_event: FocusEvent<HTMLInputElement>) => handleBlur()}
        onKeyDown={(event) => void onKeyDown?.(event)}
      />
      {type === "search" && enabled && !readOnly && localValue ? (
        <button
          type="button"
          data-part-id="endAdornment"
          data-xmlui-part="endAdornment"
          className={cx(styles.textBoxAdornment, styles.textBoxPasswordToggle)}
          onClick={() => updateValue("")}
          aria-label="Clear"
        >
          <ThemedIcon name="close" className={styles.textBoxIcon} aria-hidden="true" />
        </button>
      ) : type === "password" && showPasswordToggle ? (
        <button
          type="button"
          data-part-id="endAdornment"
          data-xmlui-part="endAdornment"
          className={cx(styles.textBoxAdornment, styles.textBoxPasswordToggle)}
          onClick={() => setPasswordVisible((visible) => !visible)}
          tabIndex={-1}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
        >
          <ThemedIcon
            data-icon-name={passwordVisible ? passwordVisibleIcon : passwordHiddenIcon}
            name={passwordVisible ? passwordVisibleIcon : passwordHiddenIcon}
            className={styles.textBoxIcon}
            aria-hidden="true"
          />
        </button>
      ) : (
        <Adornment partId="endAdornment" text={endText} icon={endIcon} />
      )}
      {!effectiveVerboseValidationFeedback && effectiveValidationStatus && effectiveValidationStatus !== "none" ? (
        <span
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          className={styles.textBoxConciseFeedback}
          onMouseEnter={() => setConciseTooltipVisible(true)}
          onMouseLeave={() => setConciseTooltipVisible(false)}
          onFocus={() => setConciseTooltipVisible(true)}
          onBlur={() => setConciseTooltipVisible(false)}
          tabIndex={-1}
        >
          <ThemedIcon
            name={effectiveValidationStatus === "valid" ? "checkmark" : "error"}
            className={styles.textBoxIcon}
          />
          {conciseTooltipVisible && effectiveValidationStatus !== "valid" && effectiveInvalidMessages?.length ? (
            <span data-tooltip-container role="tooltip" className={styles.textBoxConciseTooltip}>
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
        {inputRoot}
        {validationFeedback}
      </>
    );
  }

  return (
    <div
      {...rest}
      className={className}
      style={rootStyle}
    >
      <div
      className={cx(
        styles.textBoxLabeledItem,
        labelPositionClass(effectiveLabelPosition, direction),
      )}
      data-part-id="labeledItem"
      data-xmlui-part="labeledItem"
      dir={direction === "rtl" ? "rtl" : direction === "ltr" ? "ltr" : undefined}
      >
        {labelNode}
        {inputRoot}
      </div>
      {validationFeedback}
    </div>
  );
}));

function Adornment({
  partId,
  text,
  icon,
}: {
  partId: "startAdornment" | "endAdornment";
  text?: unknown;
  icon?: unknown;
}) {
  const iconName = typeof icon === "string" && icon !== "" ? icon : undefined;
  const content = text !== undefined && text !== null && text !== "" ? String(text) : undefined;
  if (!iconName && content === undefined) {
    return null;
  }
  return (
    <span data-part-id={partId} data-xmlui-part={partId} className={styles.textBoxAdornment}>
      {iconName ? <ThemedIcon name={iconName} className={styles.textBoxIcon} aria-hidden="true" /> : null}
      {content}
    </span>
  );
}

function stringifyInputValue(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function stringifyLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function normalizeInputType(value: string): string {
  return ["text", "password", "search", "email"].includes(value) ? value : "text";
}

function normalizeOnOff(value: boolean | undefined): "on" | "off" | undefined {
  return value === undefined ? undefined : value ? "on" : "off";
}

function normalizeAutoComplete(value: string | boolean | undefined): string | undefined {
  return typeof value === "boolean" ? normalizeOnOff(value) : value;
}

function cssLength(value: string | number, themeVariables: Record<string, unknown>): string {
  const normalized = resolveThemeReferences(resolveThemeValue(value, themeVariables));
  return typeof normalized === "number" ? `${normalized}px` : String(normalized);
}

function resolveThemeValue(value: string | number, themeVariables: Record<string, unknown>): string | number {
  if (typeof value !== "string" || !value.startsWith("$")) {
    return value;
  }
  return themeVariables[value.slice(1)] as string | number | undefined ?? value;
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function labelPositionClass(value: string, direction?: string): string {
  const normalized = value === "before"
    ? direction === "rtl" ? "end" : "start"
    : value === "after"
      ? direction === "rtl" ? "start" : "end"
      : value;
  if (normalized === "start") {
    return styles.textBoxLabelPositionStart;
  }
  if (normalized === "end") {
    return styles.textBoxLabelPositionEnd;
  }
  if (normalized === "bottom") {
    return styles.textBoxLabelPositionBottom;
  }
  return styles.textBoxLabelPositionTop;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
