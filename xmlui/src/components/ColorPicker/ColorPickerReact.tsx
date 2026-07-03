import type { ChangeEvent, CSSProperties, ForwardedRef } from "react";
import { memo, useEffect } from "react";
import { forwardRef, useCallback, useRef } from "react";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import type { ValidationStatus } from "../abstractions";
import { useEvent } from "../../components-core/utils/misc";
import styles from "./ColorPicker.module.scss";
import classnames from "classnames";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import { Part } from "../Part/Part";
import { PART_INPUT } from "../../components-core/parts";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { useFormItemInputId } from "../FormItem/FormItemContext";
import { defaultProps } from "./ColorPicker.defaults";

type Props = {
  id?: string;
  value?: string;
  initialValue?: string;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
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
  invalidMessages?: string[];
};

export const ColorPicker = memo(forwardRef(
  (
    {
      id: idProp,
      style,
      className,
      classes,
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
      invalidMessages: _invalidMessages,
      initialValue = defaultProps.initialValue,
      ...rest
    }: Props,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) => {
    const id = useFormItemInputId(idProp);
    const inputRef = useRef<HTMLInputElement>(null);
    const composedRef = useComposedRefs(forwardedRef, inputRef);

    const updateValue = useCallback(
      (value: string) => {
        updateState?.({ value });
        onDidChange(value);
      },
      [onDidChange, updateState],
    );

    const onInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        // Controlled input: must update synchronously, otherwise the displayed
        // swatch lags one selection behind. See React useTransition caveats —
        // calls that update inputs should not be inside startTransition.
        updateValue(event.target.value);
      },
      [updateValue],
    );

    useEffect(() => {
      updateState?.({ value: initialValue }, { initial: true });
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
      <Part partId={PART_INPUT}>
        <input
          {...rest}
          id={id}
          className={classnames(className, classes?.[COMPONENT_PART_KEY], styles.colorInput, {
            [styles.error]: validationStatus === "error",
            [styles.warning]: validationStatus === "warning",
            [styles.valid]: validationStatus === "valid",
          })}
          style={style}
          disabled={!enabled || readOnly}
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
      </Part>
    );
  },
));
