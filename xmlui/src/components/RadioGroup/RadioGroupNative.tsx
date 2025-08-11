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

export const defaultProps = {
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  required: false,
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

type RadioGroupProps = {
  id?: string;
  initialValue?: string;
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
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  children?: React.ReactNode;
  registerComponentApi?: RegisterComponentApiFn;
};

export const RadioGroup = forwardRef(function RadioGroup(
  {
    id,
    value = defaultProps.value,
    initialValue = defaultProps.initialValue,
    enabled = defaultProps.enabled,
    validationStatus = defaultProps.validationStatus,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required = defaultProps.required,
    updateState = noop,
    onDidChange = noop,
    onFocus = noop,
    onBlur = noop,
    children,
    registerComponentApi,
    style,
    className
  }: RadioGroupProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [focused, setFocused] = React.useState(false);

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue }, { initial: true });
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
    return { value, setValue: updateValue, status: validationStatus, enabled };
  }, [value, updateValue, validationStatus, enabled]);

  return (
    <ItemWithLabel
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
    >
      <OptionTypeProvider Component={RadioGroupOption}>
        <RadioGroupStatusContext.Provider value={contextValue}>
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
        </RadioGroupStatusContext.Provider>
      </OptionTypeProvider>
    </ItemWithLabel>
  );
});

export const RadioGroupOption = ({
  value,
  label,
  enabled = true,
  optionRenderer,
  style,
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
    <div key={id} className={styles.radioOptionContainer} style={style}>
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
