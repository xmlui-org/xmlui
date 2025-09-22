import type { CSSProperties, ForwardedRef } from "react";
import { useEffect } from "react";
import { forwardRef, useCallback, useRef } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import { noop } from "../../components-core/constants";
import type { ValidationStatus } from "../abstractions";
import { useEvent } from "../../components-core/utils/misc";
import styles from "./ColorPicker.module.scss";
import classnames from "classnames";

type Props = {
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
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  readOnly?: boolean;
  enabled?: boolean;
  validationStatus?: ValidationStatus;
  debounceDelayInMs?: number;
};

export const defaultProps: Pick<
  Props,
  "initialValue" | "value" | "enabled" | "validationStatus" | "debounceDelayInMs"
> = {
  initialValue: "#000000",
  value: "#000000",
  enabled: true,
  validationStatus: "none",
  debounceDelayInMs: 200,
};

export const ColorPicker = forwardRef(
  (
    {
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
      label,
      labelPosition,
      labelWidth,
      labelBreak,
      required,
      validationStatus = defaultProps.validationStatus,
      initialValue = defaultProps.initialValue,
      debounceDelayInMs = defaultProps.debounceDelayInMs,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) => {
    const inputRef = useRef(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateValue = useCallback(
      (value: string) => {
        updateState({ value });
        onDidChange(value);
      },
      [onDidChange, updateState],
    );

    const debouncedUpdateValue = useCallback(
      (value: string, immediate = false) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        if (immediate) {
          updateValue(value);
        } else {
          debounceTimeoutRef.current = setTimeout(() => {
            updateValue(value);
          }, debounceDelayInMs);
        }
      },
      [updateValue, debounceDelayInMs],
    );

    const onInputChange = useCallback(
      (event: any) => {
        debouncedUpdateValue(event.target.value);
      },
      [debouncedUpdateValue],
    );

    useEffect(() => {
      updateState({ value: initialValue }, { initial: true });
    }, [initialValue, updateState]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, []);

    // --- Manage obtaining and losing the focus
    const handleOnFocus = useCallback(() => {
      onFocus?.();
    }, [onFocus]);

    const handleOnBlur = useCallback(() => {
      // Immediately update state when focus is lost (flush any pending debounced update)
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      onBlur?.();
    }, [onBlur]);

    const focus = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const setValue = useEvent((newValue) => {
      debouncedUpdateValue(newValue, true); // Immediate update for programmatic changes
    });

    useEffect(() => {
      registerComponentApi?.({
        focus,
        setValue,
      });
    }, [focus, registerComponentApi, setValue]);

    return (
      <ItemWithLabel
        {...rest}
        labelPosition={labelPosition as any}
        label={label}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        className={className}
        ref={forwardedRef}
      >
        {/* Produces a 7 character RGB color output in hex as a string type */}
        <input
          className={classnames(styles.colorInput, {
            [styles.disabled]: !enabled,
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
          })}
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
          ref={inputRef}
          value={value}
        />
      </ItemWithLabel>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
