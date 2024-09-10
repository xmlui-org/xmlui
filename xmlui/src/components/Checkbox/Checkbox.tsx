import styles from "@components/Toggle/Toggle.module.scss";
import {
  inputComponentEventDescriptors,
  inputComponentPropertyDescriptors,
  type ValidationStatus,
} from "@components/Input/input-abstractions";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { createComponentRenderer } from "@components-core/renderers";
import { Toggle } from "@components/Toggle/Toggle";
import { parseScssVar } from "@components-core/theming/themeVars";
import type { ComponentDef } from "@abstractions/ComponentDefs";

// =====================================================================================================================
// XMLUI Checkbox component definition

/**
 * The \`Checkbox\` component allows users to make binary choices, typically between checked or unchecked.
 * It consists of a small box that can be toggled on or off by clicking on it.
 * 
 * To bind data to a \`Checkbox\`, use the XMLUI [Forms infrastructure](../learning/using-components/forms).
 */
export interface CheckboxComponentDef extends ComponentDef<"Checkbox"> {
  props: {
    initialValue?: boolean;
    /**
     * This property sets whether the checkbox should be displayed in the checked (\`true\`) or unchecked 
     * (\`false\`) state when it is displayed initially.
     * @descriptionRef 
     */
    labelId?: string;
    /**
     * Set this property to \`true\` to automatically get the focus when the component is displayed.
     * @descriptionRef 
     */
    autoFocus?: boolean;
    /**
     * Set this property to \`true\` to indicate it must have a value before submitting the containing form.
     * @descriptionRef 
     */
    required?: boolean;
    /**
     * Set this property to \`true\` to disallow changing the component value.
     * @descriptionRef 
     */
    readOnly?: boolean;
    /** 
     * This boolean property indicates whether the checkbox responds to user events (i.e. clicks);
     * it is `true` by default.
     * @descriptionRef 
     */
    enabled?: string | boolean;
    /**
     * With this property, you can set the checkbox's validation status to "none", "error", "warning", 
     * or "valid". 
     * @descriptionRef 
     */
    validationStatus?: ValidationStatus;
    /** 
     * This property sets the label of the component.
     * @descriptionRef 
     */
    label?: string;
    /** 
     * Places the label at the \`top\`, \`right\`, \`bottom\`, or \`left\` of the \`Checkbox\`.
     * @descriptionRef 
     */
    labelPosition?: string;
    /** 
     * Setting this prop signals that the component is in an _intedeterminate state_.
     * @descriptionRef 
     */
    indeterminate?: boolean;
  };
  events: {
    /** 
     * This event is triggered when the \`Checkbox\` is toggled due to user interaction. A read-only 
     * checkbox never fires this event, and it won't fire if the checkbox's value is set programmatically.
     * @descriptionRef 
     */
    didChange?: string;
    /** 
     * This event is triggered when the \`Checkbox\` receives focus.
     * @descriptionRef 
     */
    gotFocus?: string;
    /** 
     * This event is triggered when the \`Checkbox\` loses focus.
     * @descriptionRef 
     */
    lostFocus?: string;
  };
  api: {
    /** @descriptionRef */
    value?: any,
    /** @descriptionRef */
    setValue?: (value: any) => void,
  }
}

export const CheckboxMd: ComponentDescriptor<CheckboxComponentDef> = {
  displayName: "Checkbox",
  description: "Display a checkbox that represents a true or false value",
  props: inputComponentPropertyDescriptors,
  events: inputComponentEventDescriptors,
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "color-border-checked-Checkbox-error": "$color-border-Checkbox-error",
    "color-bg-checked-Checkbox-error": "$color-border-Checkbox-error",
    "color-border-checked-Checkbox-warning": "$color-border-Checkbox-warning",
    "color-bg-checked-Checkbox-warning": "$color-border-Checkbox-warning",
    "color-border-checked-Checkbox-success": "$color-border-Checkbox-success",
    "color-bg-checked-Checkbox-success": "$color-border-Checkbox-success",
    light: {
      "color-bg-indicator-Checkbox": "$color-bg-primary",
      "color-border-checked-Checkbox": "$color-primary-500",
      "color-bg-checked-Checkbox": "$color-primary-500",
      "color-bg-Checkbox--disabled": "$color-surface-200",
    },
    dark: {
      "color-bg-indicator-Checkbox": "$color-bg-primary",
      "color-border-checked-Checkbox": "$color-primary-400",
      "color-bg-checked-Checkbox": "$color-primary-400",
      "color-bg-Checkbox--disabled": "$color-surface-800",
    }
  },
};

// Source: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox-mixed/
export const checkboxComponentRenderer = createComponentRenderer<CheckboxComponentDef>(
  "Checkbox",
  ({ node, extractValue, layoutCss, updateState, lookupEventHandler, state, registerComponentApi }) => {
    return (
      <Toggle
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        style={layoutCss}
        initialValue={extractValue.asOptionalBoolean(node.props.initialValue, false)}
        value={state?.value}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
        validationStatus={extractValue(node.props.validationStatus)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        label={extractValue(node.props.label)}
        labelPosition={extractValue(node.props.labelPosition)}
        indeterminate={extractValue.asOptionalBoolean(node.props.indeterminate)}
        registerComponentApi={registerComponentApi}
      />
    );
  },
  CheckboxMd
);
