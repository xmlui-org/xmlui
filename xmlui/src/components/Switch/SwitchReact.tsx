import type { CSSProperties, FocusEvent } from "react";
import { forwardRef, memo, useCallback, useEffect, useId } from "react";

import { defaultProps } from "./Switch.defaults";
import styles from "./Switch.module.scss";
import type { SwitchValidationStatus } from "./switch-abstractions";
import { useFormContext } from "../Form/FormContext";
import { transformToLegitValue, useToggleController } from "../Toggle/Toggle";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

export type SwitchApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: boolean;
};

export type SwitchProps = {
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
  tabIndex?: number;
  validationStatus?: SwitchValidationStatus;
  variant?: string;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void | Promise<void>;
  onDidChange?: (value: boolean) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  registerComponentApi?: RegisterComponentApiFn;
  "data-testid"?: string;
};

export const SwitchNative = memo(forwardRef<SwitchApi, SwitchProps>(function SwitchNative(
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
    tabIndex,
    validationStatus = defaultProps.validationStatus,
    variant,
    onClick,
    onDidChange,
    onFocus,
    onBlur,
    registerComponentApi,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const generatedInputId = useId();
  const form = useFormContext();
  const fieldName = bindTo !== undefined ? resolveFieldName(bindTo, form?.fieldPrefix) : undefined;
  const formValue = form && fieldName !== undefined ? form.getValue(fieldName) : undefined;
  const effectiveValue = formValue ?? value;
  const { inputRef, checked, suppressTransition, updateValue, api } = useToggleController({
    value: effectiveValue,
    initialValue,
    enabled,
    autoFocus,
    suppressInitialTransition: true,
    onDidChange: (nextValue) => {
      if (form && fieldName !== undefined) {
        form.setValue(fieldName, nextValue);
      }
      void onDidChange?.(nextValue);
    },
  });

  useEffect(() => {
    registerComponentApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerComponentApi]);

  const setInputRef = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (typeof ref === "function") {
      ref(element as unknown as SwitchApi);
    } else if (ref) {
      ref.current = element as unknown as SwitchApi;
    }
  }, [inputRef, ref]);

  useEffect(() => {
    if (!form || fieldName === undefined || form.getValue(fieldName) != null || initialValue === undefined) {
      return;
    }
    form.setValue(fieldName, transformToLegitValue(initialValue));
  }, [fieldName, form, initialValue]);

  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const effectiveTestId = dataTestId ?? id;
  const labelText = stringifyLabel(label);
  const needsVariantWrapper = !hasLabel && variant !== undefined;
  const effectiveRequireLabelMode = requireLabelMode ?? form?.itemRequireLabelMode ?? "markRequired";
  const showRequiredIndicator =
    Boolean(required) && (effectiveRequireLabelMode === "markRequired" || effectiveRequireLabelMode === "markBoth");
  const showOptionalIndicator =
    !required && (effectiveRequireLabelMode === "markOptional" || effectiveRequireLabelMode === "markBoth");
  const input = (
    <input
      {...rest}
      id={inputId}
      ref={setInputRef}
      data-component-type="Toggle"
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!hasLabel && !needsVariantWrapper ? effectiveTestId : undefined}
      className={cx(
        styles.switchRoot,
        validationStatus === "error" ? styles.switchError : undefined,
        validationStatus === "warning" ? styles.switchWarning : undefined,
        validationStatus === "valid" ? styles.switchSuccess : undefined,
        suppressTransition ? styles.switchNoTransition : undefined,
        !hasLabel && !needsVariantWrapper ? className : undefined,
      )}
      style={!hasLabel && !needsVariantWrapper ? style : undefined}
      type="checkbox"
      role="switch"
      checked={checked}
      disabled={!enabled}
      readOnly={readOnly}
      required={required}
      tabIndex={enabled ? tabIndex : -1}
      aria-checked={checked}
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

  if (!hasLabel) {
    if (needsVariantWrapper) {
      return (
        <span
          {...rest}
          data-testid={effectiveTestId}
          className={cx(styles.switchVariantWrapper, className)}
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
      className={cx(styles.switchLabel, labelBreak ? styles.switchLabelBreak : undefined)}
      style={labelWidth !== undefined ? { width: cssLength(labelWidth) } : undefined}
    >
      {labelWidth !== undefined ? (
        <span style={{ display: "inline-block", width: cssLength(labelWidth) }}>{labelText}</span>
      ) : (
        labelText
      )}
      {showRequiredIndicator ? <span className={styles.switchLabelRequired}>*</span> : null}
      {showOptionalIndicator ? <span className={styles.switchLabelOptional}>(Optional)</span> : null}
    </label>
  );

  return (
    <div
      data-xmlui-component="Switch"
      data-xmlui-part="input"
      data-xmlui-id={id}
      data-testid={effectiveTestId}
      className={cx(styles.container, styles.switchLabeledItem, labelPositionClass(labelPosition), className)}
      style={style}
      dir={direction}
    >
      {labelNode}
      {input}
    </div>
  );
}));

function labelPositionClass(labelPosition: SwitchProps["labelPosition"]): string {
  switch (labelPosition) {
    case "start":
      return styles.switchLabelPositionStart;
    case "top":
      return styles.switchLabelPositionTop;
    case "bottom":
      return styles.switchLabelPositionBottom;
    case "before":
      return styles.switchLabelPositionBefore;
    case "after":
      return styles.switchLabelPositionAfter;
    case "end":
    default:
      return styles.switchLabelPositionEnd;
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
