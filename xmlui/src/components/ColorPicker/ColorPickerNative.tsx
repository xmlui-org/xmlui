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
import { read } from "fs";

type Props = {
  value?: string;
  initialValue?: string;
  style?: CSSProperties;
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
};

export const ColorPicker = forwardRef(
  (
    {
      style,
      updateState,
      onDidChange = noop,
      onFocus = noop,
      onBlur = noop,
      registerComponentApi,
      enabled = true,
      value = "",
      autoFocus,
      tabIndex = -1,
      label,
      labelPosition,
      labelWidth,
      labelBreak,
      required,
      validationStatus = "none",
      initialValue,
    }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) => {
    const inputRef = useRef(null);

    const updateValue = useCallback(
      (value: string) => {
        updateState({ value });
        onDidChange(value);
      },
      [onDidChange, updateState],
    );

    const onInputChange = useCallback(
      (event: any) => {
        updateValue(event.target.value);
      },
      [updateValue],
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
        labelPosition={labelPosition as any}
        label={label}
        labelWidth={labelWidth}
        labelBreak={labelBreak}
        required={required}
        enabled={enabled}
        onFocus={onFocus}
        onBlur={onBlur}
        style={style}
        ref={forwardedRef}
      >
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
          autoFocus={autoFocus}
          onBlur={handleOnBlur}
          required={required}
          type="color"
          inputMode="text"
          ref={inputRef}
          value={value}
          tabIndex={tabIndex}
        />
      </ItemWithLabel>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
