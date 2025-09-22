import React, {
  createContext,
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import classnames from "classnames";

import styles from "./RadioGroup.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, ValidationStatus } from "../abstractions";
import { ItemWithLabel } from "../FormItem/ItemWithLabel";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { UnwrappedRadioItem } from "./RadioItemNative";
import { convertOptionValue } from "../Option/OptionNative";

type RadioGroupProps = {
  id?: string;
  initialValue?: string;
  autofocus?: boolean;
  value?: string;
  enabled?: boolean;
  style?: CSSProperties;
  className?: string;
  validationStatus?: ValidationStatus;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  readOnly?: boolean;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: string) => void;
  onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps: Pick<
  RadioGroupProps,
  "value" | "initialValue" | "enabled" | "validationStatus" | "required" | "readOnly"
> = {
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  required: false,
  readOnly: false,
};

const RadioGroupStatusContext = createContext<{
  value?: string;
  setValue?: (value: string) => void;
  status: ValidationStatus;
  enabled?: boolean;
}>({
  status: "none",
  enabled: defaultProps.enabled,
});

export const RadioGroup = forwardRef(function RadioGroup(
  {
    id,
    value = defaultProps.value,
    initialValue = defaultProps.initialValue,
    autofocus,
    enabled = defaultProps.enabled,
    validationStatus = defaultProps.validationStatus,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required = defaultProps.required,
    readOnly = defaultProps.readOnly,
    updateState = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    children,
    registerComponentApi,
    style,
    className,
    ...rest
  }: RadioGroupProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [focused, setFocused] = React.useState(false);
  const radioGroupRef = useRef<HTMLDivElement>(null);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: convertOptionValue(initialValue) }, { initial: true });
  }, [initialValue, updateState]);

  // --- Handle autofocus by focusing the first radio option
  useEffect(() => {
    if (autofocus && radioGroupRef.current) {
      // Find the first radio item element
      const firstRadioItem = radioGroupRef.current.querySelector('[role="radio"]');
      if (firstRadioItem) {
        (firstRadioItem as HTMLElement).focus();
      }
    }
  }, [autofocus]);

  // --- Custom focus handler for label clicks
  const focusActiveOption = useCallback(() => {
    if (radioGroupRef.current) {
      // First try to find the currently selected radio option
      const selectedRadio = radioGroupRef.current.querySelector('[role="radio"][aria-checked="true"]');
      if (selectedRadio) {
        (selectedRadio as HTMLElement).focus();
        return;
      }
      
      // If no option is selected, focus the first one
      const firstRadio = radioGroupRef.current.querySelector('[role="radio"]');
      if (firstRadio) {
        (firstRadio as HTMLElement).focus();
      }
    }
  }, []);

  // --- Handle the value change events for this input

  const updateValue = useCallback(
    (value: string) => {
      updateState({ value });
      onDidChange(value);
    },
    [onDidChange, updateState],
  );

  const onInputChange = useCallback(
    (value: string) => {
      if (readOnly) return;
      updateValue(value);
    },
    [updateValue, readOnly],
  );

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback(
    (ev: React.FocusEvent<HTMLDivElement, Element>) => {
      setFocused(true);
      onFocus?.(ev);
    },
    [onFocus],
  );

  const handleOnBlur = useCallback(
    (ev: React.FocusEvent<HTMLDivElement, Element>) => {
      setFocused(false);
      onBlur?.(ev);
    },
    [onBlur],
  );

  const setValue = useEvent((val: string) => {
    updateValue(val);
  });

  useEffect(() => {
    registerComponentApi?.({
      //focus,
      setValue,
    });
  }, [/* focus, */ registerComponentApi, setValue]);

  const contextValue = useMemo(() => {
    return { value, setValue: updateValue, status: validationStatus, enabled };
  }, [value, updateValue, validationStatus, enabled]);

  return (
    <OptionTypeProvider Component={RadioGroupOption}>
      <RadioGroupStatusContext.Provider value={contextValue}>
        <ItemWithLabel
          {...rest}
          ref={forwardedRef}
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
          onLabelClick={focusActiveOption}
        >
          <InnerRadioGroup.Root
            ref={radioGroupRef}
            id={id}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            onValueChange={onInputChange}
            value={value}
            disabled={!enabled}
            required={required}
            aria-readonly={readOnly}
            className={classnames(styles.radioGroupContainer, {
              [styles.focused]: focused,
              [styles.disabled]: !enabled,
            })}
          >
            {children}
          </InnerRadioGroup.Root>
        </ItemWithLabel>
      </RadioGroupStatusContext.Provider>
    </OptionTypeProvider>
  );
});

export const RadioGroupOption = ({
  value,
  label,
  enabled = true,
  optionRenderer,
  style,
  className,
}: Option) => {
  const id = useId();
  const radioGroupContext = useContext(RadioGroupStatusContext);

  const statusStyles = useMemo(
    () => ({
      [styles.disabled]: radioGroupContext.enabled === false ? true : !enabled,
      [styles.error]: value === radioGroupContext.value && radioGroupContext.status === "error",
      [styles.warning]: value === radioGroupContext.value && radioGroupContext.status === "warning",
      [styles.valid]: value === radioGroupContext.value && radioGroupContext.status === "valid",
    }),
    [enabled, radioGroupContext, value],
  );

  const item = useMemo(
    () => (
      <>
        <UnwrappedRadioItem
          id={id}
          value={value}
          checked={value === radioGroupContext.value}
          disabled={!enabled}
          statusStyles={statusStyles}
        />
        <label htmlFor={id} className={classnames(styles.label, statusStyles)}>
          {label ?? value}
        </label>
      </>
    ),
    [enabled, id, label, statusStyles, value, radioGroupContext],
  );

  return (
    <div
      key={id}
      className={classnames(styles.radioOptionContainer, className)}
      style={style}
      data-radio-item
    >
      {!!optionRenderer ? (
        <label className={styles.optionLabel}>
          <div className={styles.itemContainer}>{item}</div>
          {optionRenderer({
            $checked: value === radioGroupContext.value,
            $setChecked: radioGroupContext.setValue,
          })}
        </label>
      ) : (
        item
      )}
    </div>
  );
};
