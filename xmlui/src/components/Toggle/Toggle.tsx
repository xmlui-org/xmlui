import React, { type CSSProperties, type ForwardedRef, forwardRef, useCallback, useEffect } from "react";
import classnames from "../../components-core/utils/classnames";
import styles from "./Toggle.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import type { ValidationStatus } from "../abstractions";
import type { LabelPosition } from "../abstractions";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import { useEvent } from "../../components-core/utils/misc";

type ToggleProps = {
  id?: string;
  initialValue?: boolean;
  value?: boolean;
  enabled?: boolean;
  style?: CSSProperties;
  readOnly?: boolean;
  validationStatus?: ValidationStatus;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  variant?: "checkbox" | "switch";
  indeterminate?: boolean;
  className?: string;
  label?: string;
  labelPosition?: LabelPosition;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
};

export const Toggle = forwardRef(function Toggle(
  {
    id,
    initialValue = false,
    value = false,
    enabled = true,
    style,
    readOnly,
    validationStatus = "none",
    updateState = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    variant = "checkbox",
    indeterminate = false,
    className,
    label,
    labelPosition = "start",
    labelWidth,
    labelBreak,
    required,
    registerComponentApi,
  }: ToggleProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const innerRef = React.useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
  }, [initialValue, updateState]);

  const updateValue = useCallback(
    (value: boolean) => {
      if (innerRef.current?.checked === value) return;
      updateState({ value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) {
        return;
      }
      updateState({ value: event.target.checked });
      onDidChange(event.target.checked);
    },
    [onDidChange, readOnly, updateState],
  );

  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  useEffect(() => {
    if (typeof indeterminate === "boolean" && innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const focus = useCallback(() => {
    innerRef.current?.focus();
  }, []);

  const setValue = useEvent((newValue) => {
    updateValue(newValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  return (
    <ItemWithLabel
      ref={forwardedRef}
      id={id}
      label={label}
      style={style}
      labelPosition={labelPosition}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      shrinkToLabel={true}
      labelStyle={{ pointerEvents: readOnly ? "none" : undefined }}
      // --- For some reason if it's an indeterminate checkbox, the label click still clears the indeterminate flag.
      // --- By setting pointerEvents we kind of 'disable' the label click, too
    >
      <input
        ref={innerRef}
        type="checkbox"
        role={variant}
        checked={value}
        disabled={!enabled}
        required={required}
        readOnly={readOnly}
        aria-readonly={readOnly}
        aria-checked={value}
        onChange={onInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        className={classnames(styles.resetAppearance, className, {
          [styles.checkbox]: variant === "checkbox",
          [styles.switch]: variant === "switch",
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
        })}
      />
    </ItemWithLabel>
  );
});
