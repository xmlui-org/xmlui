import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { type InputComponentDef, inputComponentEventDescriptors, ValidationStatus } from "../Input/input-abstractions";
import { createComponentRenderer } from "@components-core/renderers";
import { Toggle } from "@components/Toggle/Toggle";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import styles from "@components/Toggle/Toggle.module.scss";
import { ComponentDef } from "@abstractions/ComponentDefs";

// =====================================================================================================================
// XMLUI Switch component definition

/**
 * The `Switch` component is a user interface element that allows users to toggle between two states: on and off.
It consists of a small rectangular or circular button that can be moved left or right to change its state.
It's analogous in function to the [`Checkbox`](./Checkbox.mdx).

To bind data to a `Switch`, use the XMLUI [Forms infrastructure](../learning/using-components/forms).

 */
export interface SwitchComponentDef extends ComponentDef<"Switch"> {
  props: {
    /**
     * This property sets whether the switch should be displayed in the checked (\`true\`) or unchecked 
     * (\`false\`) state when it is displayed initially.
     */
    initialValue?: string | string[];
    /**
     * You can specify the identifier of a component acting as its label. When you click the label, 
     * the component behaves as you clicked it.
     */
    labelId?: string;
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
    /** @descriptionRef */
    label?: string;
    /** @descriptionRef */
    labelPosition?: string;
  };
  events: {
    /** @descriptionRef */
    didChange?: string;
    /** @descriptionRef */
    gotFocus?: string;
    /**
     * This event is triggered when the `Switch` loses focus.
     *
     * (See the example above)
     */
    lostFocus?: string;
  };
  api: {
    /**
     * You can query this read-only API property to query the switch's current value (\`true\`: checked,
     * \`false\`: unchecked).
     *
     * See an example in the `setValue` API method.
     */
    value: string;
    /** @descriptionRef */
    setValue: (value: string) => void;
  };
}

export const SwitchMd: ComponentDescriptor<SwitchComponentDef> = {
  displayName: "Switch",
  description: "Display a switch that represents a true or false value",
  props: {
    initialValue: desc("The initial value of the checkbox"),
    readOnly: desc("Is the input field in read only mode"),
  },
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-border-checked-Switch-error": "$color-border-Switch-error",
    "color-bg-checked-Switch-error": "$color-border-Switch-error",
    "color-border-checked-Switch-warning": "$color-border-Switch-warning",
    "color-bg-checked-Switch-warning": "$color-border-Switch-warning",
    "color-border-checked-Switch-success": "$color-border-Switch-success",
    "color-bg-checked-Switch-success": "$color-border-Switch-success",
    light: {
      "color-bg-Switch": "$color-surface-400",
      "color-border-Switch": "$color-surface-400",
      "color-bg-indicator-Switch": "$color-bg-primary",
      "color-border-checked-Switch": "$color-primary-500",
      "color-bg-checked-Switch": "$color-primary-500",
      "color-bg-Switch--disabled": "$color-surface-200",
    },
    dark: {
      "color-bg-Switch": "$color-surface-500",
      "color-border-Switch": "$color-surface-500",
      "color-bg-indicator-Switch": "$color-bg-primary",
      "color-border-checked-Switch": "$color-primary-400",
      "color-bg-checked-Switch": "$color-primary-400",
      "color-bg-Switch--disabled": "$color-surface-800",
    },
  },
};

export const switchComponentRenderer = createComponentRenderer<SwitchComponentDef>(
  "Switch",
  ({ node, extractValue, layoutCss, updateState, state, lookupEventHandler, registerComponentApi }) => {
    return (
      <Toggle
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
        initialValue={extractValue.asOptionalBoolean(node.props.initialValue) || false}
        value={state?.value}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        variant="switch"
        registerComponentApi={registerComponentApi}
      />
    );
  },
  SwitchMd
);
