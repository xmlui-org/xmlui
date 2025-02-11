import type { CSSProperties, ForwardedRef } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import { forwardRef } from "react";
import { Root, Range, Track, Thumb } from "@radix-ui/react-slider";
import styles from "./Slider.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import type { ValidationStatus } from "../abstractions";
import classnames from "classnames";

type Props = {
  value?: number | number[];
  initialValue?: number | number[];
  style?: CSSProperties;
  step?: number;
  max?: number;
  min?: number;
  inverted?: false;
  validationStatus?: ValidationStatus;
  minStepsBetweenThumbs?: number;
  onDidChange?: (newValue: number | number[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  updateState?: UpdateStateFn;
  registerComponentApi?: RegisterComponentApiFn;
  autoFocus?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  enabled?: boolean;
};

export const Slider = forwardRef(
  (
    {
      style,
      step = 1,
      min,
      max,
      inverted,
      updateState,
      onDidChange = noop,
      onFocus = noop,
      onBlur = noop,
      registerComponentApi,
      enabled = true,
      value,
      autoFocus,
      readOnly,
      tabIndex = -1,
      label,
      labelPosition,
      labelWidth,
      labelBreak,
      required,
      validationStatus = "none",
      initialValue,
      minStepsBetweenThumbs,
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) => {
    const inputRef = useRef(null);

    const [localValue, setLocalValue] = React.useState([]);
    useEffect(() => {
      if (typeof value === "object") {
        setLocalValue(value);
      } else if (typeof value === "number") {
        setLocalValue([value]);
      }
    }, [value]);

    useEffect(() => {
      updateState({ value: initialValue }, { initial: true });
    }, [initialValue, updateState]);

    const updateValue = useCallback(
      (value: number | number[]) => {
        updateState({ value });
        onDidChange(value);
      },
      [onDidChange, updateState],
    );

    const onInputChange = useCallback(
      (value: number[]) => {
        if (value.length > 1) {
          updateValue(value);
        } else if (value.length === 1) {
          updateValue(value[0]);
        }
      },
      [updateValue],
    );

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
        <Root
          minStepsBetweenThumbs={minStepsBetweenThumbs}
          ref={inputRef}
          tabIndex={tabIndex}
          aria-readonly={readOnly}
          className={classnames(styles.sliderRoot)}
          style={style}
          max={max}
          min={min}
          inverted={inverted}
          step={step}
          disabled={!enabled}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          onValueChange={onInputChange}
          aria-required={required}
          value={localValue}
          autoFocus={autoFocus}
        >
          <Track className={classnames(styles.sliderTrack, {
              [styles.disabled]: !enabled,
              [styles.readOnly]: readOnly,
              [styles.error]: validationStatus === "error",
              [styles.warning]: validationStatus === "warning",
              [styles.valid]: validationStatus === "valid",
          })}>
            <Range className={styles.sliderRange} />
          </Track>
          <Thumb className={styles.sliderThumb} />
          <Thumb className={styles.sliderThumb} />
        </Root>
      </ItemWithLabel>
    );
  },
);

Slider.displayName = Root.displayName;
