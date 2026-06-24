import type { ChangeEvent, CSSProperties, FocusEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import { defaultProps } from "./ColorPicker.defaults";
import styles from "./ColorPicker.module.scss";

export type ColorPickerApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: string;
};

export type ColorPickerProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  tabIndex?: number;
  label?: unknown;
  validationStatus?: string;
  className?: string;
  style?: CSSProperties;
  onDidChange?: (value: string) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const ColorPickerNative = memo(forwardRef<ColorPickerApi, ColorPickerProps>(function ColorPickerNative(
  {
    id,
    value,
    initialValue = defaultProps.initialValue,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    autoFocus,
    tabIndex = 0,
    label,
    validationStatus = defaultProps.validationStatus,
    className,
    style,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedInputId = useId();
  const inputId = id ?? generatedInputId;
  const controlled = value !== undefined;
  const [localValue, setLocalValue] = useState(() =>
    normalizeColor(controlled ? value : initialValue),
  );
  const currentValue = controlled ? normalizeColor(value) : localValue;

  useEffect(() => {
    if (controlled) {
      setLocalValue(normalizeColor(value));
    }
  }, [controlled, value]);

  useEffect(() => {
    if (!controlled) {
      setLocalValue(normalizeColor(initialValue));
    }
  }, [controlled, initialValue]);

  const updateValue = useCallback((nextValue: unknown) => {
    const color = normalizeColor(nextValue);
    setLocalValue(color);
    void onDidChange?.(color);
  }, [onDidChange]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setValue: updateValue,
    get value() {
      return currentValue;
    },
  }), [currentValue, updateValue]);

  const input = (
    <input
      {...rest}
      id={inputId}
      ref={inputRef}
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!label ? dataTestId ?? id : undefined}
      className={cx(
        styles.colorPickerInput,
        validationStatus === "error" ? styles.colorPickerError : undefined,
        validationStatus === "warning" ? styles.colorPickerWarning : undefined,
        validationStatus === "valid" ? styles.colorPickerSuccess : undefined,
        !label ? className : undefined,
      )}
      style={!label ? style : undefined}
      disabled={!enabled || readOnly}
      readOnly={readOnly}
      required={required}
      autoFocus={autoFocus}
      tabIndex={enabled ? tabIndex : -1}
      type="color"
      inputMode="text"
      value={currentValue}
      onChange={(event: ChangeEvent<HTMLInputElement>) => updateValue(event.currentTarget.value)}
      onFocus={(_event: FocusEvent<HTMLInputElement>) => void onFocus?.()}
      onBlur={(_event: FocusEvent<HTMLInputElement>) => void onBlur?.()}
    />
  );

  const labelText = stringifyLabel(label);
  if (!labelText) {
    return input;
  }

  return (
    <div
      data-xmlui-component="ColorPicker"
      data-xmlui-part="input"
      data-xmlui-id={id}
      data-testid={dataTestId ?? id}
      className={className}
      style={style}
    >
      <div data-part-id="labeledItem" data-xmlui-part="labeledItem" className={styles.colorPickerLabeledItem}>
        <label htmlFor={inputId} className={styles.colorPickerLabel}>
          {labelText}
        </label>
        {input}
      </div>
    </div>
  );
}));

function normalizeColor(value: unknown): string {
  if (typeof value !== "string") {
    return defaultProps.value;
  }
  const normalized = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : defaultProps.value;
}

function stringifyLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function cx(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(" ");
}
