import { type ReactNode } from "react";
import { useMemo } from "react";
import React, {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import classnames from "classnames";

import styles from "./Toggle.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { ValidationStatus } from "../abstractions";
import { PART_INPUT } from "../../components-core/parts";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { Part } from "../Part/Part";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useFormItemInputId } from "../FormItem/FormItemReact";

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
  classes?: Record<string, string>;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
  registerComponentApi?: RegisterComponentApiFn;
  inputRenderer?: (contextVars: any, input?: ReactNode) => ReactNode;
  tabIndex?: number;
  "aria-label"?: string;
  invalidMessages?: string[];
  validationResult?: ReactNode;
  validationInProgress?: boolean;
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
    id: idProp,
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
    classes,
    className,
    required,
    autoFocus,
    registerComponentApi,
    inputRenderer,
    tabIndex,
    "aria-label": ariaLabel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    invalidMessages: _invalidMessages,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationResult: _validationResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationInProgress: _validationInProgress,
    ...rest
  }: ToggleProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const id = useFormItemInputId(idProp);
  const innerRef = React.useRef<HTMLInputElement | null>(null);
  const composedRef = useComposedRefs(forwardedRef, innerRef);

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

  const initialCycleRef = React.useRef(true);
  const [suppressTransition, setSuppressTransition] = useState(() => transformToLegitValue(initialValue));

  useEffect(() => {
    const legitInitial = transformToLegitValue(initialValue);
    updateState({ value: legitInitial }, { initial: true });
    if (initialCycleRef.current) {
      initialCycleRef.current = false;
      if (legitInitial) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSuppressTransition(false);
          });
        });
      }
    }
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
      <Part partId={PART_INPUT}>
        <input
          {...rest}
          data-component-type="Toggle"
          id={id}
          ref={composedRef}
          type="checkbox"
          role={variant}
          checked={legitValue}
          disabled={!enabled}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
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
          className={classnames(
            !inputRenderer ? classes?.[COMPONENT_PART_KEY] : undefined,
            className,
            styles.resetAppearance,
            {
              [styles.checkbox]: variant === "checkbox",
              [styles.switch]: variant === "switch",
              [styles.error]: validationStatus === "error",
              [styles.warning]: validationStatus === "warning",
              [styles.valid]: validationStatus === "valid",
              [styles.noTransition]: suppressTransition,
            },
          )}
        />
      </Part>
    );
  }, [
    rest,
    classes,
    className,
    inputRenderer,
    composedRef,
    style,
    id,
    enabled,
    tabIndex,
    ariaLabel,
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
    suppressTransition,
  ]);

  return inputRenderer ? (
    <label className={classnames(styles.label, classes?.[COMPONENT_PART_KEY])}>
      <div className={styles.inputContainer}>{input}</div>
      {inputRenderer({
        $checked: transformToLegitValue(value),
        $setChecked: setValue,
      })}
    </label>
  ) : (
    input
  );
});
