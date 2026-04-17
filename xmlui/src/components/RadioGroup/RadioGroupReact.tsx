import React, {
  createContext,
  type ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import styles from "./RadioGroup.module.scss";

import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { noop } from "../../components-core/constants";
import { useEvent } from "../../components-core/utils/misc";
import type { Option, OrientationOptions, ValidationStatus } from "../abstractions";
import OptionTypeProvider from "../Option/OptionTypeProvider";
import { UnwrappedRadioItem } from "./RadioItemReact";
import { convertOptionValue } from "../Option/OptionReact";

type RadioGroupProps = Omit<React.HTMLAttributes<HTMLDivElement>, "dir" | "defaultValue"> & {
  id?: string;
  initialValue?: string;
  autofocus?: boolean;
  value?: string;
  enabled?: boolean;
  orientation?: OrientationOptions;
  gap?: string;
  classes?: Record<string, string>;
  validationStatus?: ValidationStatus;
  label?: string;
  labelPosition?: string;
  labelWidth?: string;
  labelBreak?: boolean;
  required?: boolean;
  readOnly?: boolean;
  updateState?: UpdateStateFn;
  onDidChange?: (newValue: string) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export const defaultProps: Pick<
  RadioGroupProps,
  "value" | "initialValue" | "enabled" | "validationStatus" | "required" | "readOnly" | "orientation" | "gap"
> = {
  value: "",
  initialValue: "",
  enabled: true,
  validationStatus: "none" as ValidationStatus,
  required: false,
  readOnly: false,
  orientation: "vertical",
  gap: "$gap-normal",
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

export const RadioGroup = memo(forwardRef(function RadioGroup(
  {
    id,
    value = defaultProps.value,
    initialValue = defaultProps.initialValue,
    autofocus,
    enabled = defaultProps.enabled,
    orientation = defaultProps.orientation,
    gap,
    validationStatus = defaultProps.validationStatus,
    label,
    labelPosition,
    labelWidth,
    labelBreak,
    required = defaultProps.required,
    readOnly = defaultProps.readOnly,
    updateState = noop,
    onDidChange = noop,
    onFocus,
    onBlur,
    children,
    registerComponentApi,
    style,
    className,
    classes,
    ...rest
  }: RadioGroupProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const [focused, setFocused] = React.useState(false);
  const radioGroupRef = useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(forwardedRef, radioGroupRef);

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
      const selectedRadio = radioGroupRef.current.querySelector(
        '[role="radio"][aria-checked="true"]',
      );
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

  // --- Handle arrow-key navigation to update the selected value
  // Radix's built-in mechanism (click-on-focus via isArrowKeyPressedRef) is unreliable
  // because keyup can fire before the deferred focus, preventing the click.
  // We handle arrow keys directly on the group root (via event bubbling) so that the
  // value always follows focus.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly || !enabled) return;

      const isVerticalKey = e.key === "ArrowDown" || e.key === "ArrowUp";
      const isHorizontalKey = e.key === "ArrowRight" || e.key === "ArrowLeft";

      if (!isVerticalKey && !isHorizontalKey) return;
      if (orientation === "horizontal" && isVerticalKey) return;
      if (orientation === "vertical" && isHorizontalKey) return;

      const isNext = e.key === "ArrowDown" || e.key === "ArrowRight";

      const radios = Array.from(
        radioGroupRef.current?.querySelectorAll('[role="radio"]:not(:disabled)') ?? [],
      ) as HTMLElement[];

      if (radios.length === 0) return;

      const focused = e.target as HTMLElement;
      const currentIndex = radios.indexOf(focused);
      if (currentIndex === -1) return;

      const nextIndex = isNext
        ? (currentIndex + 1) % radios.length
        : (currentIndex - 1 + radios.length) % radios.length;

      const nextValue = radios[nextIndex].getAttribute("value");
      if (nextValue != null) {
        onInputChange(nextValue);
      }
    },
    [readOnly, enabled, orientation, onInputChange],
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
        <InnerRadioGroup.Root
          {...rest}
          style={{ ...style, ...(gap != null ? { gap } : undefined) }}
          ref={composedRef}
          id={id}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          onKeyDown={handleKeyDown}
          onValueChange={onInputChange}
          value={value}
          disabled={!enabled}
          required={required}
          aria-readonly={readOnly}
          className={classnames(classes?.[COMPONENT_PART_KEY], className, styles.radioGroupContainer, {
            [styles.focused]: focused,
            [styles.disabled]: !enabled,
            [styles.horizontal]: orientation === "horizontal",
          })}
        >
          {children}
        </InnerRadioGroup.Root>
      </RadioGroupStatusContext.Provider>
    </OptionTypeProvider>
  );
}));

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

  const item = useMemo(() => {
    // When optionRenderer is present, it will render the children in the outer label
    // So we only render the radio button itself, not a separate label
    if (optionRenderer) {
      return (
        <UnwrappedRadioItem
          id={id}
          value={value}
          checked={value === radioGroupContext.value}
          disabled={!enabled}
          statusStyles={statusStyles}
        />
      );
    }

    // Without optionRenderer, render the standard radio + label structure
    return (
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
    );
  }, [enabled, id, label, optionRenderer, statusStyles, value, radioGroupContext]);

  return (
    <div
      key={id}
      className={classnames(styles.radioOptionContainer, className)}
      style={style}
      data-radio-item
    >
      {!!optionRenderer ? (
        <label htmlFor={id} className={styles.optionLabel}>
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
