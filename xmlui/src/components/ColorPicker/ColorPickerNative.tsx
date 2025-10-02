import type { CSSProperties, ForwardedRef } from "react";
import { useEffect, useId, useTransition } from "react";
import { forwardRef, useCallback, useRef } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import type { ValidationStatus } from "../abstractions";
import { useEvent } from "../../components-core/utils/misc";
import styles from "./ColorPicker.module.scss";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";
import { PART_INPUT } from "../../components-core/parts";

type Props = {
  id?: string;
  value?: string;
  initialValue?: string;
  style?: CSSProperties;
  className?: string;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  autoFocus?: boolean;
  tabIndex?: number;
  required?: boolean;
  readOnly?: boolean;
  enabled?: boolean;
  validationStatus?: ValidationStatus;
};

export const defaultProps: Pick<
  Props,
  "initialValue" | "value" | "enabled" | "validationStatus"
> = {
  initialValue: "#000000",
  value: "#000000",
  enabled: true,
  validationStatus: "none",
};

export const ColorPicker = forwardRef(
  (
    {
      id,
      style,
      className,
      updateState,
      onDidChange = noop,
      onFocus = noop,
      onBlur = noop,
      registerComponentApi,
      enabled = defaultProps.enabled,
      readOnly,
      value = defaultProps.value,
      autoFocus,
      tabIndex = 0,
      required,
      validationStatus = defaultProps.validationStatus,
      initialValue = defaultProps.initialValue,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) => {
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const composedRef = forwardedRef ? composeRefs(forwardedRef, inputRef) : inputRef;

    const updateValue = useCallback(
      (value: string) => {
        updateState({ value });
        onDidChange(value);
      },
      [onDidChange, updateState],
    );


    const updateValueWithTransition = useCallback(
      (value: string, immediate = false) => {
        if (immediate) {
          updateValue(value);
        } else {
          startTransition(() => {
            updateValue(value);
          });
        }
      },
      [updateValue, startTransition],
    );

    const onInputChange = useCallback(
      (event: any) => {
        updateValueWithTransition(event.target.value);
      },
      [updateValueWithTransition],
    );

    useEffect(() => {
      updateState({ value: initialValue }, { initial: true });
    }, [initialValue, updateState]);

    // --- Manage obtaining and losing the focus
    const handleOnFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);

    const handleOnBlur = useCallback(() => {
      onBlur?.();
    }, [onBlur]);

    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const setValue = useEvent((newValue) => {
      updateValueWithTransition(newValue, true); // Immediate update for programmatic changes
    });

    useEffect(() => {
      registerComponentApi?.({
        focus,
        setValue,
      });
    }, [focus, registerComponentApi, setValue]);

    {/* Produces a 7 character RGB color output in hex as a string type */ }
    return (
      <input
        {...rest}
        id={id}
        className={classnames(styles.colorInput, className, {
          [styles.disabled]: !enabled,
          [styles.error]: validationStatus === "error",
          [styles.warning]: validationStatus === "warning",
          [styles.valid]: validationStatus === "valid",
        })}
        data-part-id={PART_INPUT}
        style={style}
        disabled={!enabled}
        onFocus={handleOnFocus}
        onChange={onInputChange}
        readOnly={readOnly}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        onBlur={handleOnBlur}
        required={required}
        type="color"
        inputMode="text"
        ref={composedRef}
        value={value}
      />
    );
  },
);

ColorPicker.displayName = "ColorPicker";
