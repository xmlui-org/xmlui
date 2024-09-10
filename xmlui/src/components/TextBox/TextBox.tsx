import type { Adornments, InputComponentDef, ValidationStatus } from "@components/Input/input-abstractions";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
} from "@components/Input/input-abstractions";
import type { RegisterComponentApiFn, ValueExtractor } from "@abstractions/RendererDefs";
import { createComponentRenderer } from "@components-core/renderers";
import type { CSSProperties } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "./TextBox.module.scss";
import { noop } from "@components-core/constants";
import { Adornment } from "@components/Input/InputAdornment";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { useEvent } from "@components-core/utils/misc";
import type { AsyncFunction } from "@abstractions/FunctionDefs";
import type { LookupActionOptions } from "@abstractions/ActionDefs";
import type { ComponentDef } from "@abstractions/ComponentDefs";

// =====================================================================================================================
// React TextBox component definition

type Props = {
  id?: string;
  type?: "text" | "password";
  value?: string;
  updateState?: (newState: any) => void;
  initialValue?: string;
  style?: CSSProperties;
  maxLength?: number;
  enabled?: boolean;
  placeholder?: string;
  validationStatus?: ValidationStatus;
  onDidChange?: (newValue: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  registerComponentApi?: RegisterComponentApiFn;
  startText?: string;
  startIcon?: string;
  endText?: string;
  endIcon?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
};

export const TextBox = ({
  id,
  type = "text",
  value = "",
  updateState = noop,
  initialValue = "",
  style,
  maxLength,
  enabled = true,
  placeholder,
  validationStatus = "none",
  onDidChange = noop,
  onFocus = noop,
  onBlur = noop,
  registerComponentApi,
  startText,
  startIcon,
  endText,
  endIcon,
  autoFocus,
  readOnly,
  tabIndex,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  // --- NOTE: This is a workaround for the jumping caret issue.
  // --- Local state can sync up values that can get set asynchronously outside the component.
  const [localValue, setLocalValue] = React.useState(value);
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  // --- End NOTE

  // --- Initialize the related field with the input's initial value
  useEffect(() => {
    updateState({ value: initialValue });
  }, [initialValue, updateState]);

  const updateValue = useCallback(
    (value: string) => {
      setLocalValue(value);
      updateState({ value });
      onDidChange(value);
    },
    [onDidChange, updateState]
  );

  // --- Handle the value change events for this input
  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(event.target.value);
    },
    [updateValue]
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
    <div
      className={classnames(styles.inputRoot, {
        [styles.disabled]: !enabled,
        [styles.readOnly]: readOnly,
        [styles.error]: validationStatus === "error",
        [styles.warning]: validationStatus === "warning",
        [styles.valid]: validationStatus === "valid",
      })}
      tabIndex={-1}
      onFocus={() => {
        inputRef.current?.focus();
      }}
      style={style}
    >
      <Adornment text={startText} iconName={startIcon} className={styles.adornment} />
      <input
        id={id}
        type={type}
        className={classnames(styles.input, { [styles.readOnly]: readOnly })}
        disabled={!enabled}
        value={localValue}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={onInputChange}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        ref={inputRef}
        readOnly={readOnly}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
      />
      <Adornment text={endText} iconName={endIcon} className={styles.adornment} />
    </div>
  );
};

// ============================================================================
// XMLUI TextBox definition

/**
 * The \`TextBox\` is an input component that allows users to input and edit textual data.
 *
 * It can often be found in forms.
 * See the guide on [Using Forms](../learning/forms.mdx) for details.
 */
export interface TextBoxComponentDef extends ComponentDef<"TextBox"> {
  props: {
    /**
     * A placeholder text that is visible in the input field when its empty.
     * @descriptionRef
     */
    placeholder?: string;
    /** @internal */
    value?: string | string[];
    /**
     * The initial value displayed in the input field.
     * @descriptionRef
     */
    initialValue?: string | string[];
    /**
     * The maximum length of the input that the field accepts.
     * @descriptionRef
     */
    maxLength?: number;
    /**
     * If this boolean prop is set to \`true\`, the \`TextBox\` will be focused when it appears on the UI.
     * The default is \`false\`.
     * @descriptionRef
     */
    autoFocus?: boolean;
    /** Set this property to \`true\` to indicate it must have a value before submitting the containing form. */
    required?: boolean;
    /**
     * This boolean determines whether the input field can be modified or not.
     * @descriptionRef
     */
    readOnly?: boolean;
    /**
     * Controls whether the input field is enabled (\`true\`) or disabled (\`false\`).
     * @descriptionRef
     */
    enabled?: string | boolean;
    /**
     * This prop is used to visually indicate status changes reacting to form field validation.
     * @descriptionRef
     */
    validationStatus?: ValidationStatus;
    /**
     * This string prop enables the display of a custom string on the left side of the input field (left-to-right display).
     * @descriptionRef
     */
    startText?: string;
    /**
     * This string prop enables the display of an icon
     * on the left side of the input field by providing a valid icon name (left-to-right display).
     * @descriptionRef
     */
    startIcon?: string;
    /**
     * This string prop enables the display of a custom string on the right side of the input field (left-to-right display).
     * @descriptionRef
     */
    endText?: string;
    /**
     * This string prop enables the display of an icon
     * on the right side of the input field by providing a valid icon name (left-to-right display).
     * @descriptionRef
     */
    endIcon?: string;
  };
  events: {
    /** @internal */
    change?: string;
    /**
     * This event is triggered after the user has changed the field value.
     * @descriptionRef
     */
    didChange?: string;
    /**
     * This event is triggered when the \`TextBox\` receives focus.
     * @descriptionRef
     */
    gotFocus?: string;
    /**
     * This event is triggered when the \`TextBox\` loses focus.
     *
     * See the example in the [gotFocus event section](#gotfocus).
     */
    lostFocus?: string;
  };
  api: {
    /**
     * This API method focuses the input field.
     * @descriptionRef
     */
    focus: () => void;
    /**
     * By setting an ID for the component, you can refer to the value of the field if set.
     * If no value is set, the value will be undefined.
     * @descriptionRef
     */
    value?: string;
    /**
     * This API method programmatically sets the value of the field.
     * The same rules apply as for the [\`initialValue\`](#initialvalue) property.
     * @descriptionRef
     */
    setValue: (newValue: any) => void;
  };
}

export const TextboxMd: ComponentDescriptor<TextBoxComponentDef> = {
  displayName: "TextBox",
  description: "Represents an input component for textual data entry",
  props: inputComponentPropertyDescriptors,
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "radius-Input": "$radius",
    "color-text-Input": "$color-text-primary",
    "color-bg-Input--disabled": "$color-bg--disabled",
    "thickness-border-Input": "1px",
    "min-height-Input": "39px",
    "style-border-Input": "solid",
    "color-border-Input--disabled": "$color-border--disabled",
    "color-text-Input--disabled": "$color-text--disabled",
    "color-border-Input-error": "$color-border-Input-default--error",
    "color-border-Input-warning": "$color-border-Input-default--warning",
    "color-border-Input-success": "$color-border-Input-default--success",
    "color-placeholder-Input": "$color-text-subtitle",
    "color-adornment-Input": "$color-text-subtitle",

    "color-outline-Input--focus": "$color-outline--focus",
    "thickness-outline-Input--focus": "$thickness-outline--focus",
    "style-outline-Input--focus": "$style-outline--focus",
    "offset-outline-Input--focus": "$offset-outline--focus",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

function renderTextBox(
  layoutCss: React.CSSProperties,
  state: any,
  updateState: (componentState: any) => void,
  extractValue: ValueExtractor,
  node: (InputComponentDef<"TextBox"> | InputComponentDef<"PasswordInput">) & Adornments,
  lookupEventHandler: (
    eventName: keyof NonNullable<(InputComponentDef<"TextBox"> & Adornments)["events"]>,
    actionOptions?: LookupActionOptions
  ) => AsyncFunction | undefined,
  registerComponentApi: (apiFn: Record<string, (...args: any[]) => void>) => void,
  type: "text" | "password" = "text"
) {
  //if we provide a value through props, we don't sync the textbox value to it's container's state,
  // but handle it like a 'controlled' input (use the value from the prop as the current value, assume that the user sets the value prop in response to input changes).
  return (
    <TextBox
      type={type}
      style={layoutCss}
      value={state.value}
      updateState={updateState}
      initialValue={extractValue(node.props.initialValue)}
      maxLength={extractValue(node.props.maxLength)}
      enabled={extractValue.asOptionalBoolean(node.props.enabled)}
      placeholder={extractValue.asOptionalString(node.props.placeholder)}
      validationStatus={extractValue(node.props.validationStatus)}
      onDidChange={lookupEventHandler("didChange")}
      onFocus={lookupEventHandler("gotFocus")}
      onBlur={lookupEventHandler("lostFocus")}
      registerComponentApi={registerComponentApi}
      startText={extractValue.asOptionalString(node.props.startText)}
      startIcon={extractValue.asOptionalString(node.props.startIcon)}
      endText={extractValue.asOptionalString(node.props.endText)}
      endIcon={extractValue.asOptionalString(node.props.endIcon)}
      autoFocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
      readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
    />
  );
}

export const textBoxComponentRenderer = createComponentRenderer<TextBoxComponentDef>(
  "TextBox",
  ({ node, state, updateState, lookupEventHandler, extractValue, layoutCss, registerComponentApi }) => {
    return renderTextBox(layoutCss, state, updateState, extractValue, node, lookupEventHandler, registerComponentApi);
  },
  TextboxMd
);

type PasswordInputComponentDef = InputComponentDef<"PasswordInput"> & Adornments;

export const passwordInputComponentRenderer = createComponentRenderer<PasswordInputComponentDef>(
  "PasswordInput",
  ({ node, state, updateState, lookupEventHandler, extractValue, layoutCss, registerComponentApi }) => {
    return renderTextBox(
      layoutCss,
      state,
      updateState,
      extractValue,
      node,
      lookupEventHandler,
      registerComponentApi,
      "password"
    );
  },
  TextboxMd
);
