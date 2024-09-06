import React, { createContext, CSSProperties, useCallback, useContext, useEffect, useId, useMemo } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./RadioGroup.module.scss";
import type { RegisterComponentApiFn, UpdateStateFn } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { noop } from "@components-core/constants";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
  ValidationStatus,
} from "@components/Input/input-abstractions";
import * as InnerRadioGroup from "@radix-ui/react-radio-group";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import { useEvent } from "@components-core/utils/misc";

// =====================================================================================================================
// React RadioGroup component implementation

const RadioGroupValidationStatusContext = createContext<{ value?: string; status: ValidationStatus }>({
  status: "none",
});

type RadioGroupProps = {
  id?: string;
  initialValue?: string;
  value?: string;
  enabled?: boolean;
  layout?: CSSProperties;
  validationStatus?: ValidationStatus;
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
    [onDidChange, updateState]
  );

  const onInputChange = useCallback(
    (value: string) => {
      updateValue(value);
    },
    [updateValue]
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
  );
};

type RadioGroupOptionProps = {
  value: string;
  label?: string;
  enabled?: boolean;
};

export const RadioGroupOption = ({ value, label, enabled = true }: RadioGroupOptionProps) => {
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

type RadioGroupOptionDef = ComponentDef<"RadioGroupOption"> & {
  props: {
    enabled?: boolean;
  };
};

const radioGroupOptionMetadata: ComponentDescriptor<RadioGroupOptionDef> = {
  displayName: "RadioGroupOption",
  description: "A single radio button within a radio button group",
  props: {
    enabled: desc("Is the particular option enabled?"),
    value: desc("The value of the option"),
    label: desc("The option's label"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "gap-RadioGroupOption": "$space-1_5",
    "thickness-border-RadioGroupOption": "2px",
    "color-bg-checked-RadioGroupOption--disabled": "$color-border-RadioGroupOption--disabled",
    "color-bg-checked-RadioGroupOption-error": "$color-border-RadioGroupOption-error",
    "color-bg-checked-RadioGroupOption-warning": "$color-border-RadioGroupOption-warning",
    "color-bg-checked-RadioGroupOption-success": "$color-border-RadioGroupOption-success",
    "font-size-RadioGroupOption": "$font-size-small",
    "font-weight-RadioGroupOption": "$font-weight-bold",
    "color-text-RadioGroupOption-error": "$color-border-RadioGroupOption-error",
    "color-text-RadioGroupOption-warning": "$color-border-RadioGroupOption-warning",
    "color-text-RadioGroupOption-success": "$color-border-RadioGroupOption-success",
    light: {
      "color-bg-checked-RadioGroupOption-default": "$color-primary-500",
      "color-border-RadioGroupOption-default": "$color-surface-500",
      "color-border-RadioGroupOption-default--hover": "$color-surface-700",
      "color-border-RadioGroupOption-default--active": "$color-primary-500",
    },
    dark: {
      "color-bg-checked-RadioGroupOption-default": "$color-primary-500",
      "color-border-RadioGroupOption-default": "$color-surface-500",
      "color-border-RadioGroupOption-default--hover": "$color-surface-300",
      "color-border-RadioGroupOption-default--active": "$color-primary-400",
    },
  },
};

export const radioGroupOptionRenderer = createComponentRenderer<RadioGroupOptionDef>(
  "RadioGroupOption",
  ({ node, extractValue }) => {
    return (
      <RadioGroupOption
        value={extractValue.asString(node.props.value)}
        label={extractValue.asOptionalString(node.props.label)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      />
    );
  },
  radioGroupOptionMetadata
);

// =====================================================================================================================
// XMLUI RadioGroup component definition

/**
 * The \`RadioGroup\` input component is a group of radio buttons ([\`RadioGroupOption\`](./RadioGroupOption.mdx)
 * components) that allow users to select only one option from the group at a time.
 *
 * \`RadioGroup\` is often used in forms. See the [Using Forms](/learning/using-components/forms.mdx) guide
 * for details.
 */
export interface RadioGroupComponentDef extends ComponentDef<"RadioGroup"> {
  props: {
    /** @descriptionRef */
    initialValue?: string | string[];
    /**
     * You can specify the identifier of a component acting as its label. When you click the label,
     * the component behaves as you clicked it.
     */
    labelId?: string;
    /**
     * This property sets the maximum number of characters you can type into the component's text.
     */
    maxLength?: number;
    /**
     * Set this property to \`true\` to automatically get the focus when the component is displayed.
     */
    autoFocus?: boolean;
    /**
     * Set this property to \`true\` to indicate it must have a value before submitting the containing form.
     */
    required?: boolean;
    /**
     * Set this property to \`true\` to disallow changing the component value.
     */
    readOnly?: boolean;
    /** @descriptionRef */
    enabled?: string | boolean;
    /**
     * With this property, you can set the checkbox's validation status to "none", "error", "warning",
     * or "valid".
     */
    validationStatus?: ValidationStatus;
  };
  events: {
    /** @descriptionRef */
    didChange?: string;
    /**
     * This event is triggered when the `RadioGroup` receives focus.
     */
    gotFocus?: string;
    /**
     * This event is triggered when the `RadioGroup` loses focus.
     */
    lostFocus?: string;
  };
  api: {
    /**
     * You can query this read-only API property to get the input component's current value.
     *
     * See an example in the `setValue` API method.
     */
    value: string;
    /** @descriptionRef */
    setValue: (value: string) => void;
  };
}

const radioGroupMetadata: ComponentDescriptor<RadioGroupComponentDef> = {
  displayName: "RadioGroup",
  description: "A group of radio buttons (mutually exclusive selection)",
  props: { ...inputComponentPropertyDescriptors },
  events: inputComponentEventDescriptors,
};

export const radioGroupRenderer = createComponentRenderer<RadioGroupComponentDef>(
  "RadioGroup",
  ({ node, extractValue, layoutCss, state, updateState, lookupEventHandler, renderChild, registerComponentApi }) => {
    return (
      <RadioGroup
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        layout={layoutCss}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
        updateState={updateState}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </RadioGroup>
    );
  },
  radioGroupMetadata
);
