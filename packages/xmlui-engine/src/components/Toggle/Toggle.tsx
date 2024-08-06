import React, { type CSSProperties, useCallback, useEffect } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./Toggle.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { noop } from "@components-core/constants";
import { ValidationStatus } from "@components/Input/input-abstractions";
import { ItemWithLabel, LabelPosition } from "@components/FormItem/ItemWithLabel";
import { useEvent } from "@components-core/utils/misc";

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
  registerComponentApi?: RegisterComponentApiFn;
};

export const Toggle = ({
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
  labelPosition = "right",
  registerComponentApi
}: ToggleProps) => {
  const ref = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const updateValue = useCallback((value: boolean) => {
    if (ref.current?.checked === value) return;
    updateState({ value });
    onDidChange(value);
  }, [onDidChange, updateState]);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) {
        return;
      }
      updateState({ value: event.target.checked });
      onDidChange(event.target.checked);
    },
    [onDidChange, readOnly, updateState]
  );

  const handleOnFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    onBlur?.();
  }, [onBlur]);

  useEffect(() => {
    if (typeof indeterminate === "boolean" && ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const setValue = useEvent((newValue)=>{
    updateValue(newValue);
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue
    });
  }, [focus, registerComponentApi, setValue]);

  return (
    <ItemWithLabel
      id={id}
      label={label}
      style={style}
      labelPosition={labelPosition}
      enabled={enabled}
      shrinkToLabel={true}
      labelStyle={{ pointerEvents: readOnly ? "none" : undefined }}
        // --- For some reason if it's an indeterminate checkbox, the label click still clears the indeterminate flag.
        // --- By setting pointerEvents we kind of 'disable' the label click, too
    >
      <input
        ref={ref}
        type="checkbox"
        role={variant}
        checked={value}
        disabled={!enabled}
        readOnly={readOnly}
        aria-readonly={readOnly}
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
        aria-checked={value}
      />
    </ItemWithLabel>
  );
};
