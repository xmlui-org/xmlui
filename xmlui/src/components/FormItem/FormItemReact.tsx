import {
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useFormContext } from "../Form/FormContext";
import { useThemeVariables } from "../../runtime/rendering/theme";
import { resolveThemeReferences } from "../../styling/theme";
import styles from "./FormItem.module.scss";

export type FormItemProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  bindTo?: string;
  label?: string;
  labelPosition?: string;
  labelWidth?: string | number;
  labelBreak?: boolean;
  enabled?: boolean;
  autoFocus?: boolean;
  type?: string;
  initialValue?: unknown;
  required?: boolean;
  requireLabelMode?: string;
  requiredInvalidMessage?: string;
  validationMode?: string;
  customValidationsDebounce?: number;
  onValidate?: (value: unknown) => unknown | Promise<unknown>;
  children?: ReactNode;
};

export function FormItem({
  id,
  className,
  style,
  bindTo,
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  enabled = true,
  autoFocus = false,
  type = "text",
  initialValue,
  required = false,
  requireLabelMode,
  requiredInvalidMessage,
  validationMode,
  customValidationsDebounce = 0,
  onValidate,
  children,
  ...rest
}: FormItemProps) {
  const generatedId = useId();
  const inputId = id ? `${id}-input` : generatedId;
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const form = useFormContext();
  const themeVariables = useThemeVariables();
  const effectiveLabelPosition = labelPosition ?? form?.itemLabelPosition ?? "top";
  const effectiveLabelWidth = labelWidth ?? form?.itemLabelWidth;
  const effectiveLabelBreak = labelBreak ?? form?.itemLabelBreak ?? false;
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const fieldName = bindTo || id || generatedId;
  const formEnabled = form?.enabled ?? true;
  const itemEnabled = enabled && formEnabled;
  const value = form?.getValue(fieldName) ?? initialValue ?? "";
  const error = form?.errors[fieldName];
  const showRequiredIndicator =
    required && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");

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
      validate: onValidate,
    });
  }, [fieldName, form, label, onValidate, required, requiredInvalidMessage]);

  useEffect(() => () => {
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }
  }, []);

  const scheduleChangedValidation = (nextValue: unknown) => {
    if (validationMode !== "onChanged" && !onValidate) {
      return;
    }
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
      validationTimerRef.current = undefined;
    }
    if (customValidationsDebounce > 0) {
      validationTimerRef.current = setTimeout(() => {
        validationTimerRef.current = undefined;
        void form?.validateField(fieldName, nextValue);
      }, customValidationsDebounce);
      return;
    }
    void form?.validateField(fieldName, nextValue);
  };

  const labelStyle = effectiveLabelWidth ? { width: cssLength(effectiveLabelWidth, themeVariables) } : undefined;
  const control = children ?? (
    <input
      id={inputId}
      className={cx(styles.input, error ? styles.errorInput : undefined)}
      data-xmlui-part="input"
      value={type === "checkbox" ? undefined : stringify(value)}
      checked={type === "checkbox" ? Boolean(value) : undefined}
      type={type}
      required={required}
      disabled={!itemEnabled}
      autoFocus={autoFocus}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${inputId}-error` : undefined}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = normalizeInputValue(event.currentTarget, type);
        form?.setValue(fieldName, nextValue);
        scheduleChangedValidation(nextValue);
      }}
    />
  );

  return (
    <div
      {...rest}
      className={cx(styles.formItem, !label ? styles.noLabel : undefined, className)}
      style={style}
      data-xmlui-form-field={fieldName}
    >
      <div className={cx(styles.row, labelPositionClass(effectiveLabelPosition))}>
        {label && (
          <label
            className={cx(styles.label, effectiveLabelBreak ? styles.labelBreak : undefined)}
            data-part-id="label"
            data-xmlui-part="label"
            htmlFor={inputId}
            style={labelStyle}
          >
            {label}
            {showRequiredIndicator && <span className={styles.requiredIndicator}>*</span>}
            {showOptionalIndicator && <span className={styles.optionalIndicator}>(Optional)</span>}
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

function stringify(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function normalizeInputValue(input: HTMLInputElement, type: string): unknown {
  if (type === "checkbox") {
    return input.checked;
  }
  if (input.value === "") {
    return "";
  }
  if (type === "number" || type === "integer") {
    const parsed = Number(input.value);
    return Number.isFinite(parsed) ? parsed : input.value;
  }
  return input.value;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
