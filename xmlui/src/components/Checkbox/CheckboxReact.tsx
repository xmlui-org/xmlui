import type { CSSProperties, FocusEvent, ReactNode } from "react";
import { forwardRef, memo, useEffect, useId, useImperativeHandle } from "react";

import { defaultProps } from "./Checkbox.defaults";
import type { CheckboxValidationStatus } from "./checkbox-abstractions";
import { useFormContext } from "../Form/FormContext";
import { transformToLegitValue, useToggleController } from "../Toggle/Toggle";
import styles from "./Checkbox.module.scss";

export type CheckboxApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: boolean;
};

export type CheckboxProps = {
  id?: string;
  bindTo?: string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  labelPosition?: "start" | "end" | "top" | "bottom" | "before" | "after" | string;
  labelBreak?: boolean;
  labelWidth?: string | number;
  requireLabelMode?: string;
  direction?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  indeterminate?: boolean;
  tabIndex?: number;
  validationStatus?: CheckboxValidationStatus;
  variant?: string;
  inputRenderer?: (contextVars: { $checked: boolean; $setChecked: (value: unknown) => void }, input: ReactNode) => ReactNode;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void | Promise<void>;
  onDidChange?: (value: boolean) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const CheckboxNative = memo(forwardRef<CheckboxApi, CheckboxProps>(function CheckboxNative(
  {
    id,
    bindTo,
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    labelPosition = "end",
    labelBreak = false,
    labelWidth,
    requireLabelMode,
    direction,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    autoFocus,
    indeterminate = defaultProps.indeterminate,
    tabIndex,
    validationStatus = defaultProps.validationStatus,
    variant,
    inputRenderer,
    onClick,
    onDidChange,
    onFocus,
    onBlur,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const generatedInputId = useId();
  const form = useFormContext();
  const formFieldPrefix = form?.fieldPrefix;
  const formGetValue = form?.getValue;
  const formSetValue = form?.setValue;
  const formRegisterItem = form?.registerItem;
  const formItemRequireLabelMode = form?.itemRequireLabelMode;
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, formFieldPrefix) : undefined;
  const formValue = formGetValue && fieldName !== undefined ? formGetValue(fieldName) : undefined;
  const effectiveValue = formValue ?? value;
  const { inputRef, checked, updateValue, api } = useToggleController({
    value: effectiveValue,
    initialValue,
    enabled,
    autoFocus,
    indeterminate: Boolean(indeterminate),
    onDidChange: (nextValue) => {
      if (formSetValue && fieldName !== undefined) {
        formSetValue(fieldName, nextValue);
      }
      void onDidChange?.(nextValue);
    },
  });

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (
      !formGetValue ||
      !formSetValue ||
      fieldName === undefined ||
      formGetValue(fieldName) != null ||
      initialValue === undefined
    ) {
      return;
    }
    formSetValue(fieldName, transformToLegitValue(initialValue));
  }, [fieldName, formGetValue, formSetValue, initialValue]);

  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const effectiveTestId = dataTestId ?? id;
  const labelText = stringifyLabel(label);
  const needsVariantWrapper = !hasLabel && !inputRenderer && variant !== undefined;
  const effectiveRequireLabelMode = requireLabelMode ?? formItemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    Boolean(required) && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");

  useEffect(() => {
    if (!formRegisterItem || fieldName === undefined) {
      return;
    }
    return formRegisterItem({
      name: fieldName,
      label: labelText,
      required,
    });
  }, [fieldName, formRegisterItem, labelText, required]);

  const input = (
    <input
      {...rest}
      id={inputId}
      ref={inputRef}
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!hasLabel && !inputRenderer && !needsVariantWrapper ? effectiveTestId : undefined}
      className={cx(
        styles.checkboxRoot,
        validationStatus === "error" ? styles.checkboxError : undefined,
        validationStatus === "warning" ? styles.checkboxWarning : undefined,
        validationStatus === "valid" ? styles.checkboxSuccess : undefined,
        !hasLabel && !inputRenderer && !needsVariantWrapper ? className : undefined,
      )}
      style={!hasLabel && !inputRenderer && !needsVariantWrapper ? style : undefined}
      type="checkbox"
      role="checkbox"
      checked={checked}
      disabled={!enabled}
      readOnly={readOnly}
      required={required}
      tabIndex={enabled ? tabIndex : -1}
      aria-checked={indeterminate ? "mixed" : checked}
      aria-required={required}
      aria-disabled={!enabled}
      aria-readonly={readOnly}
      onClick={(event) => void onClick?.(event)}
      onChange={(event) => {
        if (readOnly) {
          event.preventDefault();
          return;
        }
        updateValue(event.currentTarget.checked);
      }}
      onFocus={(_event: FocusEvent<HTMLInputElement>) => void onFocus?.()}
      onBlur={(_event: FocusEvent<HTMLInputElement>) => void onBlur?.()}
      autoFocus={autoFocus}
    />
  );

  if (inputRenderer) {
    return (
      <label className={cx(styles.checkboxTemplateLabel, className)} style={style}>
        <span className={styles.checkboxTemplateInputContainer}>{input}</span>
        {inputRenderer({ $checked: checked, $setChecked: updateValue }, input)}
      </label>
    );
  }

  if (!hasLabel) {
    if (needsVariantWrapper) {
      return (
        <span
          {...rest}
          data-testid={effectiveTestId}
          className={cx(styles.checkboxVariantWrapper, className)}
          style={style}
          dir={direction}
        >
          {input}
        </span>
      );
    }
    return input;
  }

  const labelNode = (
    <label
      data-part-id="label"
      data-xmlui-part="label"
      htmlFor={inputId}
      className={cx(styles.checkboxLabel, labelBreak ? styles.checkboxLabelBreak : undefined)}
      style={labelWidth !== undefined ? { width: cssLength(labelWidth) } : undefined}
    >
      {labelWidth !== undefined ? (
        <span style={{ display: "inline-block", width: cssLength(labelWidth) }}>{labelText}</span>
      ) : (
        labelText
      )}
      {showRequiredIndicator ? <span className={styles.checkboxLabelRequired}>*</span> : null}
      {showOptionalIndicator ? <span className={styles.checkboxLabelOptional}>(Optional)</span> : null}
    </label>
  );

  return (
    <div
      data-xmlui-component="Checkbox"
      data-xmlui-part="input"
      data-xmlui-id={id}
      data-testid={effectiveTestId}
      className={cx(styles.container, styles.checkboxLabeledItem, labelPositionClass(labelPosition), className)}
      style={style}
      dir={direction}
    >
      {labelNode}
      {input}
    </div>
  );
}));

function labelPositionClass(labelPosition: CheckboxProps["labelPosition"]): string {
  switch (labelPosition) {
    case "start":
      return styles.checkboxLabelPositionStart;
    case "top":
      return styles.checkboxLabelPositionTop;
    case "bottom":
      return styles.checkboxLabelPositionBottom;
    case "before":
      return styles.checkboxLabelPositionBefore;
    case "after":
      return styles.checkboxLabelPositionAfter;
    case "end":
    default:
      return styles.checkboxLabelPositionEnd;
  }
}

function stringifyLabel(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

function cssLength(value: string | number): string {
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
}

function resolveFieldName(bindTo: string, fieldPrefix?: string): string {
  if (!fieldPrefix) {
    return bindTo;
  }
  return bindTo ? `${fieldPrefix}.${bindTo}` : fieldPrefix;
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
