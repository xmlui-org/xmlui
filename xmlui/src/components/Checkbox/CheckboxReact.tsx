import type { CSSProperties, FocusEvent, ReactNode } from "react";
import { forwardRef, memo, useId, useImperativeHandle } from "react";

import { defaultProps } from "./Checkbox.defaults";
import type { CheckboxValidationStatus } from "./checkbox-abstractions";
import { transformToLegitValue, useToggleController } from "../Toggle/Toggle";

const styles = {
  checkboxError: "checkboxError",
  checkboxContainer: "checkboxcontainer",
  checkboxLabel: "checkboxLabel",
  checkboxLabelBreak: "checkboxLabelBreak",
  checkboxLabeledItem: "checkboxLabeledItem",
  checkboxLabelPositionAfter: "checkboxLabelPositionAfter",
  checkboxLabelPositionBefore: "checkboxLabelPositionBefore",
  checkboxLabelPositionBottom: "checkboxLabelPositionBottom",
  checkboxLabelPositionEnd: "checkboxLabelPositionEnd",
  checkboxLabelPositionStart: "checkboxLabelPositionStart",
  checkboxLabelPositionTop: "checkboxLabelPositionTop",
  checkboxLabelRequired: "checkboxLabelRequired",
  checkboxRoot: "checkboxRoot",
  checkboxSuccess: "checkboxSuccess",
  checkboxTemplateInputContainer: "checkboxTemplateInputContainer",
  checkboxTemplateLabel: "checkboxTemplateLabel",
  checkboxWarning: "checkboxWarning",
} as const;

export type CheckboxApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: boolean;
};

export type CheckboxProps = {
  id?: string;
  value?: unknown;
  initialValue?: unknown;
  className?: string;
  style?: CSSProperties;
  label?: unknown;
  labelPosition?: "start" | "end" | "top" | "bottom" | "before" | "after" | string;
  labelBreak?: boolean;
  labelWidth?: string | number;
  direction?: string;
  enabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  indeterminate?: boolean;
  tabIndex?: number;
  validationStatus?: CheckboxValidationStatus;
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
    value,
    initialValue = defaultProps.initialValue,
    className,
    style,
    label,
    labelPosition = "end",
    labelBreak = false,
    labelWidth,
    direction,
    enabled = defaultProps.enabled,
    readOnly,
    required,
    autoFocus,
    indeterminate = defaultProps.indeterminate,
    tabIndex,
    validationStatus = defaultProps.validationStatus,
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
  const { inputRef, checked, updateValue, api } = useToggleController({
    value,
    initialValue,
    enabled,
    autoFocus,
    indeterminate: Boolean(indeterminate),
    onDidChange,
  });

  useImperativeHandle(ref, () => api, [api]);

  const inputId = id ? `${id}__input` : generatedInputId;
  const hasLabel = label !== undefined && label !== null && label !== "";
  const effectiveTestId = dataTestId ?? id;
  const labelText = stringifyLabel(label);
  const input = (
    <input
      {...rest}
      id={inputId}
      ref={inputRef}
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!hasLabel && !inputRenderer ? effectiveTestId : undefined}
      className={cx(
        styles.checkboxRoot,
        validationStatus === "error" ? styles.checkboxError : undefined,
        validationStatus === "warning" ? styles.checkboxWarning : undefined,
        validationStatus === "valid" ? styles.checkboxSuccess : undefined,
        !hasLabel && !inputRenderer ? className : undefined,
      )}
      style={!hasLabel && !inputRenderer ? style : undefined}
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
      <span style={labelWidth !== undefined ? { display: "inline-block", width: cssLength(labelWidth) } : undefined}>
        {labelText}
      </span>
      {required ? <span className={styles.checkboxLabelRequired}>*</span> : null}
    </label>
  );

  return (
    <div
      data-xmlui-component="Checkbox"
      data-xmlui-part="input"
      data-xmlui-id={id}
      data-testid={effectiveTestId}
      className={cx(styles.checkboxContainer, styles.checkboxLabeledItem, labelPositionClass(labelPosition), className)}
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

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
