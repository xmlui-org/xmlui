import { type ReactNode, useId } from "react";
import { useMemo } from "react";
import React, {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
} from "react";
import classnames from "classnames";

import styles from "./Toggle.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import type { LabelPosition } from "../abstractions";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";

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
  inputRenderer?: (contextVars: any, input?: ReactNode) => ReactNode;
};

export const defaultProps: Pick<
  ToggleProps,
  "initialValue" | "value" | "enabled" | "validationStatus" | "indeterminate"
> = {
  initialValue: false,
  value: false,
  enabled: true,
  validationStatus: "none",
  indeterminate: false,
};

export const Toggle = forwardRef(function Toggle(
  {
    id,
    initialValue = defaultProps.initialValue,
    value = defaultProps.value,
    enabled = defaultProps.enabled,
    style,
    readOnly,
    validationStatus = defaultProps.validationStatus,
    updateState = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    variant = "checkbox",
    indeterminate = defaultProps.indeterminate,
    className,
    label,
    labelPosition = "end",
    labelWidth,
    labelBreak,
    required,
    registerComponentApi,
    inputRenderer,
  }: ToggleProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId();
  const inputId = id || generatedId;

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

  const input = useMemo(
    () => (
      <input
        id={inputId}
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
    ),
    [
      inputId,
      className,
      enabled,
      handleOnBlur,
      handleOnFocus,
      onInputChange,
      readOnly,
      required,
      validationStatus,
      value,
      variant,
    ],
  );

  return (
    <ItemWithLabel
      ref={forwardedRef}
      id={inputId}
      label={label}
      style={style}
      labelPosition={labelPosition}
      labelWidth={labelWidth}
      labelBreak={labelBreak}
      required={required}
      enabled={enabled}
      isInputTemplateUsed={!!inputRenderer}
      shrinkToLabel={true}
      labelStyle={{ pointerEvents: readOnly ? "none" : undefined }}
      // --- For some reason if it's an indeterminate checkbox, the label click still clears the indeterminate flag.
      // --- By setting pointerEvents we kind of 'disable' the label click, too
    >
      {inputRenderer ? (
        <label className={styles.label}>
          <div className={styles.inputContainer}>{input}</div>
          {inputRenderer({
            $checked: value,
          })}
        </label>
      ) : (
        input
      )}
    </ItemWithLabel>
  );
});
