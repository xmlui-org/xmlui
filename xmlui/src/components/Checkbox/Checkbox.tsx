import styles from "../Toggle/Toggle.module.scss";

import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import {
  createMetadata,
  dAutoFocus,
  dClick,
  dComponent,
  dDidChange,
  dEnabled,
  dGotFocus,
  dIndeterminate,
  dInitialValue,
  dInternal,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../../components/metadata-helpers";
import { defaultProps as toggleDefaultProps, Toggle } from "../Toggle/Toggle";

export const defaultProps = {
  ...toggleDefaultProps,
};

const COMP = "Checkbox";

export const CheckboxMd = createMetadata({
  status: "stable",
  description:
    "`Checkbox` allows users to make binary choices with a clickable box that shows " +
    "checked/unchecked states. It's essential for settings, preferences, multi-select " +
    "lists, and accepting terms or conditions.",
  parts: {
    label: {
      description: "The label displayed for the checkbox.",
    },
    input: {
      description: "The checkbox input area.",
    },
  },
  props: {
    indeterminate: dIndeterminate(toggleDefaultProps.indeterminate),
    required: dRequired(),
    initialValue: dInitialValue(toggleDefaultProps.initialValue),
    autoFocus: dAutoFocus(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(toggleDefaultProps.validationStatus),
    description: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description ` +
        `of the ${COMP} besides its label.`,
    ),
    inputTemplate: dComponent("This property is used to define a custom checkbox input template"),
  },
  childrenAsTemplate: "inputTemplate",
  events: {
    click: dClick(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: `This method returns the current value of the ${COMP}.`,
      signature: "get value(): boolean",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: boolean): void",
      parameters: {
        value: "The new value to set for the checkbox.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  compactInlineLabel: true,
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`borderColor-${COMP}`]: `$borderColor-Input-default`,
    [`outlineWidth-${COMP}`]: `$outlineWidth--focus`,
    [`outlineColor-${COMP}`]: `$outlineColor--focus`,
    [`outlineOffset-${COMP}`]: `$outlineOffset--focus`,
    [`outlineStyle-${COMP}`]: `$outlineStyle--focus`,
    [`borderColor-checked-${COMP}--error`]: `$borderColor-${COMP}--error`,
    [`backgroundColor-checked-${COMP}--error`]: `$borderColor-${COMP}--error`,
    [`borderColor-checked-${COMP}--warning`]: `$borderColor-${COMP}--warning`,
    [`backgroundColor-checked-${COMP}--warning`]: `$borderColor-${COMP}--warning`,
    [`borderColor-checked-${COMP}--success`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-checked-${COMP}--success`]: `$borderColor-${COMP}--success`,
    [`backgroundColor-indicator-${COMP}`]: "$backgroundColor-primary",
    [`borderColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-checked-${COMP}`]: "$color-primary-500",
    [`backgroundColor-${COMP}--disabled`]: "$color-surface-200",
  },
});

type ThemedToggleProps = React.ComponentPropsWithoutRef<typeof Toggle>;
export const ThemedToggle = React.forwardRef<HTMLInputElement, ThemedToggleProps>(
  function ThemedToggle({ className, ...props }: ThemedToggleProps, ref) {
    const themeClass = useComponentThemeClass(CheckboxMd);
    return (
      <Toggle
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const checkboxComponentRenderer = wrapComponent(
  COMP,
  Toggle,
  CheckboxMd,
  {
    booleans: ["indeterminate"],
    events: { click: "onClick", gotFocus: "onFocus", lostFocus: "onBlur", didChange: "onDidChange" },
    renderers: {
      inputTemplate: {
        reactProp: "inputRenderer",
        contextVars: (contextVars: Record<string, any>) => contextVars,
      },
    },
    exposeRegisterApi: true,
    customRender: (props, { node, extractValue }) => {
      // initialValue needs explicit boolean coercion (e.g. "" → false, "false" → false)
      props.initialValue = extractValue.asOptionalBoolean(
        node.props?.initialValue,
        defaultProps.initialValue,
      );
      return <Toggle {...props} />;
    },
  },
);
