import type { CSSProperties, FocusEvent } from "react";
import { forwardRef, memo, useId, useImperativeHandle } from "react";

import { defaultProps } from "./Switch.defaults";
import styles from "./Switch.module.scss";
import type { SwitchValidationStatus } from "./switch-abstractions";
import { transformToLegitValue, useToggleController } from "../Toggle/Toggle";

export type SwitchApi = {
  focus: () => void;
  setValue: (value: unknown) => void;
  value: boolean;
};

export type SwitchProps = {
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
  tabIndex?: number;
  validationStatus?: SwitchValidationStatus;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void | Promise<void>;
  onDidChange?: (value: boolean) => void | Promise<void>;
  onFocus?: () => void | Promise<void>;
  onBlur?: () => void | Promise<void>;
  "data-testid"?: string;
};

export const SwitchNative = memo(forwardRef<SwitchApi, SwitchProps>(function SwitchNative(
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
    tabIndex,
    validationStatus = defaultProps.validationStatus,
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
  const { inputRef, checked, suppressTransition, updateValue, api } = useToggleController({
    value,
    initialValue,
    enabled,
    autoFocus,
    suppressInitialTransition: true,
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
      data-component-type="Toggle"
      data-part-id="input"
      data-xmlui-part="input"
      data-testid={!hasLabel ? effectiveTestId : undefined}
      className={cx(
        styles.switchRoot,
        validationStatus === "error" ? styles.switchError : undefined,
        validationStatus === "warning" ? styles.switchWarning : undefined,
        validationStatus === "valid" ? styles.switchSuccess : undefined,
        suppressTransition ? styles.switchNoTransition : undefined,
        !hasLabel ? className : undefined,
      )}
      style={!hasLabel ? style : undefined}
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
      <span style={labelWidth !== undefined ? { display: "inline-block", width: cssLength(labelWidth) } : undefined}>
        {labelText}
      </span>
      {required ? <span className={styles.switchLabelRequired}>*</span> : null}
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

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
