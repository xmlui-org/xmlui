import type { CSSProperties, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";

import { defaultProps } from "./TextBox.defaults";
import styles from "./TextBox.module.scss";

export type TextBoxProps = {
  id?: string;
  type?: "text" | "password" | "search" | "email" | string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  labelPosition?: "start" | "end" | "top" | "bottom" | string;
  labelBreak?: boolean;
  labelWidth?: string | number;
  direction?: string;
  placeholder?: string;
  maxLength?: number;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
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
  onDidChange?: (value: string) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void | Promise<void>;
};

export type TextBoxApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: string;
};

export const TextBoxNative = memo(forwardRef<TextBoxApi, TextBoxProps>(function TextBoxNative(
  {
    id,
    type = defaultProps.type,
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    labelPosition = "top",
    labelBreak = false,
    labelWidth,
    direction,
    placeholder,
    maxLength,
    enabled = defaultProps.enabled,
    readOnly,
    required,
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
    verboseValidationFeedback = true,
    validationStatus = defaultProps.validationStatus,
    invalidMessages = defaultProps.invalidMessages,
    onDidChange,
    onFocus,
    onBlur,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedInputId = useId();
  const controlled = value !== undefined;
  const [localValue, setLocalValue] = useState(() => stringifyInputValue(value ?? initialValue));
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (controlled) {
      setLocalValue(stringifyInputValue(value));
    }
  }, [controlled, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(stringifyInputValue(initialValue));
    }
  }, [controlled, initialValue]);

  useEffect(() => {
    if (!autoFocus || !enabled) {
      return;
    }
    const timeoutId = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, [autoFocus, enabled]);

  const updateValue = useCallback((nextValue: unknown) => {
    const normalized = stringifyInputValue(nextValue);
    setLocalValue(normalized);
    void onDidChange?.(normalized);
  }, [onDidChange]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (enabled) {
        inputRef.current?.focus();
      }
    },
    setValue: updateValue,
    get value() {
      return localValue;
    },
  }), [enabled, localValue, updateValue]);

  const actualType = type === "password" && passwordVisible ? "text" : type;
  const rootStyle = useMemo<CSSProperties>(() => ({
    ...style,
    ...(gap ? { "--xmlui-runtime-gap-TextBox": gap } as CSSProperties : undefined),
  }), [gap, style]);
  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const labelText = stringifyLabel(label);
  const labelNode = hasLabel ? (
    <label
      data-part-id="label"
      data-xmlui-part="label"
      htmlFor={inputId}
      className={cx(styles.textBoxLabel, labelBreak ? styles.textBoxLabelBreak : undefined)}
      style={labelWidth !== undefined ? { width: cssLength(labelWidth) } : undefined}
    >
      <span>{labelText}</span>
      {required ? <span className={styles.textBoxLabelRequired}>*</span> : null}
    </label>
  ) : null;
  const inputRoot = (
    <div
      {...(!hasLabel ? rest : undefined)}
      data-part-id="input"
      data-xmlui-part="input"
      className={cx(
        styles.textBoxRoot,
        !enabled ? styles.textBoxDisabled : undefined,
        readOnly ? styles.textBoxReadOnly : undefined,
        validationStatus === "error" ? styles.textBoxError : undefined,
        validationStatus === "warning" ? styles.textBoxWarning : undefined,
        validationStatus === "valid" ? styles.textBoxSuccess : undefined,
        !hasLabel ? className : undefined,
      )}
      style={!hasLabel ? rootStyle : undefined}
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
        onChange={(event: ChangeEvent<HTMLInputElement>) => updateValue(event.currentTarget.value)}
        onFocus={(_event: FocusEvent<HTMLInputElement>) => void onFocus?.()}
        onBlur={(_event: FocusEvent<HTMLInputElement>) => void onBlur?.()}
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
          <span aria-hidden="true" data-icon-name="close" className={styles.textBoxIconMarker} />
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
          <span
            aria-hidden="true"
            data-icon-name={passwordVisible ? passwordVisibleIcon : passwordHiddenIcon}
            className={styles.textBoxIconMarker}
          />
        </button>
      ) : (
        <Adornment partId="endAdornment" text={endText} icon={endIcon} />
      )}
      {!verboseValidationFeedback && validationStatus && validationStatus !== "none" ? (
        <span
          data-part-id="conciseValidationFeedback"
          data-xmlui-part="conciseValidationFeedback"
          className={styles.textBoxConciseFeedback}
          title={invalidMessages?.join("\n")}
        >
          <span data-icon-name={validationStatus === "valid" ? "checkmark" : "error"} />
        </span>
      ) : null}
    </div>
  );

  if (!hasLabel) {
    return inputRoot;
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
        labelPositionClass(labelPosition, direction),
      )}
      data-part-id="labeledItem"
      data-xmlui-part="labeledItem"
      dir={direction === "rtl" ? "rtl" : direction === "ltr" ? "ltr" : undefined}
      >
        {labelNode}
        {inputRoot}
      </div>
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
    return (
      <span
        data-part-id={partId}
        data-xmlui-part={partId}
        className={styles.textBoxAdornment}
        hidden
      />
    );
  }
  return (
    <span data-part-id={partId} data-xmlui-part={partId} className={styles.textBoxAdornment}>
      {iconName ? <span aria-hidden="true" data-icon-name={iconName} className={styles.textBoxIconMarker} /> : null}
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

function cssLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
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
