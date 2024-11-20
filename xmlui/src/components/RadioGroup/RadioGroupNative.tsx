import React, {
  createContext,
  type CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
} from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./RadioGroup.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { noop } from "@components-core/constants";
import type { Option, ValidationStatus } from "@components/abstractions";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import { useEvent } from "@components-core/utils/misc";
import { ItemWithLabel } from "@components/FormItem/ItemWithLabel";
import OptionTypeProvider from "@components/Option/OptionTypeProvider";

const RadioGroupValidationStatusContext = createContext<{
  value?: string;
  status: ValidationStatus;
}>({
  status: "none",
});

type RadioGroupProps = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  layout?: CSSProperties;
  validationStatus?: ValidationStatus;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  children?: React.ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const RadioGroup = ({
  id,
  value = "",
  initialValue = "",
  enabled = true,
  validationStatus = "none",
  label,
  labelPosition,
  labelWidth,
  labelBreak,
  required = false,
  updateState = noop,
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  children,
  registerComponentApi,
}: RadioGroupProps) => {
  const [focused, setFocused] = React.useState(false);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

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
      updateValue(value);
    },
    [updateValue],
  );

  // --- Manage obtaining and losing the focus
  const handleOnFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleOnBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

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
    return { value, status: validationStatus };
  }, [value, validationStatus]);

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
    >
      <OptionTypeProvider Component={RadioGroupOption}>
        <RadioGroupValidationStatusContext.Provider value={contextValue}>
          <InnerRadioGroup.Root
            id={id}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            onValueChange={onInputChange}
            value={value}
            disabled={!enabled}
            className={classnames(styles.radioGroupContainer, {
              [styles.focused]: focused,
              [styles.disabled]: !enabled,
            })}
          >
            {children}
          </InnerRadioGroup.Root>
        </RadioGroupValidationStatusContext.Provider>
      </OptionTypeProvider>
    </ItemWithLabel>
  );
};

export const RadioGroupOption = ({ value, label, enabled = true }: Option) => {
  const id = useId();
  const validationContext = useContext(RadioGroupValidationStatusContext);

  const statusStyles = {
    [styles.disabled]: !enabled,
    [styles.error]: value === validationContext.value && validationContext.status === "error",
    [styles.warning]: value === validationContext.value && validationContext.status === "warning",
    [styles.valid]: value === validationContext.value && validationContext.status === "valid",
  };
  return (
    <div key={id} className={styles.radioOptionContainer}>
      <InnerRadioGroup.Item
        className={classnames(styles.radioOption, statusStyles)}
        value={value}
        disabled={!enabled}
        id={id}
      >
        <InnerRadioGroup.Indicator className={classnames(styles.indicator, statusStyles)} />
      </InnerRadioGroup.Item>
      <label htmlFor={id} className={classnames(styles.label, statusStyles)}>
        {label ?? value}
      </label>
    </div>
  );
};
