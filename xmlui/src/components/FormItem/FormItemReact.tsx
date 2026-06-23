import {
  useEffect,
  useId,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useFormContext } from "../Form/FormContext";
import styles from "./FormItem.module.scss";

export type FormItemProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  bindTo?: string;
  label?: string;
  labelPosition?: string;
  labelWidth?: string | number;
  enabled?: boolean;
  autoFocus?: boolean;
  type?: string;
  initialValue?: unknown;
  required?: boolean;
  requiredInvalidMessage?: string;
  children?: ReactNode;
};

export function FormItem({
  id,
  className,
  style,
  bindTo,
  label,
  labelPosition = "top",
  labelWidth,
  enabled = true,
  autoFocus = false,
  type = "text",
  initialValue,
  required = false,
  requiredInvalidMessage,
  children,
  ...rest
}: FormItemProps) {
  const generatedId = useId();
  const inputId = id ? `${id}-input` : generatedId;
  const form = useFormContext();
  const fieldName = bindTo || id || generatedId;
  const formEnabled = form?.enabled ?? true;
  const itemEnabled = enabled && formEnabled;
  const value = form?.getValue(fieldName) ?? initialValue ?? "";
  const error = form?.errors[fieldName];

  useEffect(() => {
    if (!form || form.getValue(fieldName) !== undefined || initialValue === undefined) {
      return;
    }
    form.setValue(fieldName, initialValue);
  }, [fieldName, form, initialValue]);

  useEffect(() => {
    if (!form) {
      return;
    }
    return form.registerItem({
      name: fieldName,
      label,
      required,
      requiredInvalidMessage,
    });
  }, [fieldName, form, label, required, requiredInvalidMessage]);

  const labelStyle = labelWidth ? { width: cssLength(labelWidth) } : undefined;
  const control = children ?? (
    <input
      id={inputId}
      className={cx(styles.input, error ? styles.errorInput : undefined)}
      data-xmlui-part="input"
      value={stringify(value)}
      type={type}
      required={required}
      disabled={!itemEnabled}
      autoFocus={autoFocus}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${inputId}-error` : undefined}
      onChange={(event: ChangeEvent<HTMLInputElement>) => form?.setValue(fieldName, event.currentTarget.value)}
    />
  );

  return (
    <div
      {...rest}
      className={cx(styles.formItem, className)}
      style={style}
      data-xmlui-form-field={fieldName}
    >
      <div className={cx(styles.row, labelPositionClass(labelPosition))}>
        {label && (
          <label className={styles.label} data-xmlui-part="label" htmlFor={inputId} style={labelStyle}>
            {label}
            {required && <span className={styles.requiredIndicator}>*</span>}
          </label>
        )}
        <div className={styles.control} data-xmlui-part="control">
          {control}
        </div>
      </div>
      {error && (
        <div id={`${inputId}-error`} className={styles.error} data-xmlui-part="error">
          {error}
        </div>
      )}
    </div>
  );
}

function labelPositionClass(value: string): string {
  if (value === "start") {
    return styles.labelStart;
  }
  if (value === "before") {
    return styles.labelBefore;
  }
  if (value === "end") {
    return styles.labelEnd;
  }
  if (value === "after") {
    return styles.labelAfter;
  }
  return styles.labelTop;
}

function cssLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

function stringify(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

