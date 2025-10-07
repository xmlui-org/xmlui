import { type ReactNode } from "react";
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
import { PART_INPUT } from "../../components-core/parts";
import { composeRefs } from "@radix-ui/react-compose-refs";


type ToggleProps = {
  id?: string;
  initialValue?: boolean;
  value?: boolean;
  enabled?: boolean;
  style?: CSSProperties;
  readOnly?: boolean;
  validationStatus?: ValidationStatus;
  updateState?: UpdateStateFn;
  onClick?: (event: React.MouseEvent) => void;
  onDidChange?: (newValue: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  variant?: "checkbox" | "switch";
  indeterminate?: boolean;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
  inputRenderer?: (contextVars: any, input?: ReactNode) => ReactNode;
  forceHover?: boolean;
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
    onClick = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    variant = "checkbox",
    indeterminate = defaultProps.indeterminate,
    className,
    required,
    autoFocus,
    registerComponentApi,
    inputRenderer,
    forceHover = false,
    ...rest
  }: ToggleProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const innerRef = React.useRef<HTMLInputElement | null>(null);
  const ref = innerRef ? composeRefs(forwardedRef, innerRef) : forwardedRef;

  const transformToLegitValue = (inp: any): boolean => {
    if (typeof inp === "undefined" || inp === null) {
      return false;
    }
    if (typeof inp === "boolean") {
      return inp;
    }
    if (typeof inp === "number") {
      return !isNaN(inp) && !!inp;
    }
    if (typeof inp === "string") {
      return inp.trim() !== "" && inp.toLowerCase() !== "false";
    }
    if (Array.isArray(inp)) {
      return inp.length > 0;
    }
    if (typeof inp === "object") {
      return Object.keys(inp).length > 0;
    }
    return false;
  };

  useEffect(() => {
    updateState({ value: transformToLegitValue(initialValue) }, { initial: true });
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

  useEffect(() => {
    if (innerRef.current && autoFocus) {
      setTimeout(() => focus(), 0);
    }
  }, [focus, autoFocus]);

  const setValue = useEvent((newValue) => {
    updateValue(transformToLegitValue(newValue));
  });

  useEffect(() => {
    registerComponentApi?.({
      focus,
      setValue,
    });
  }, [focus, registerComponentApi, setValue]);

  const input = useMemo(() => {
    const legitValue = transformToLegitValue(value);
    return (
      <input
        {...rest}
        id={id}
        data-part-id={PART_INPUT}
        ref={ref}
        type="checkbox"
        role={variant}
        checked={legitValue}
        disabled={!enabled}
        required={required}
        readOnly={readOnly}
        aria-readonly={readOnly}
        aria-checked={indeterminate ? "mixed" : legitValue}
        aria-required={required}
        aria-disabled={!enabled}
        onClick={onClick}
        onChange={onInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        autoFocus={autoFocus}
        style={style}
        className={classnames(className, styles.resetAppearance, {
          [styles.checkbox]: variant === "checkbox",
          [styles.switch]: variant === "switch",
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
          [styles.forceHover]: forceHover,
        })}
      />
    );
  }, [
    rest,
    className,
    ref,
    style,
    id,
    enabled,
    handleOnBlur,
    handleOnFocus,
    onInputChange,
    onClick,
    readOnly,
    required,
    validationStatus,
    value,
    variant,
    indeterminate,
    autoFocus,
    forceHover,
  ]);

  return (
    inputRenderer ? (
      <label className={styles.label}>
        <div className={styles.inputContainer}>{input}</div>
        {inputRenderer({
          $checked: transformToLegitValue(value),
          $setChecked: setValue,
        })}
      </label>
    ) : (
      input
    )
  );
});
