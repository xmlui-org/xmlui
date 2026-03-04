import { createComponentRenderer } from "../../components-core/renderers";
import { ColorPicker, defaultProps } from "./ColorPickerNative";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import styles from "./ColorPicker.module.scss";

const COMP = "ColorPicker";

export const ColorPickerMd = createMetadata({
  status: "stable",
  description:
    "`ColorPicker` enables users to choose colors by specifying RGB, HSL, or HEX values.",
  props: {
    initialValue: dInitialValue(),
    enabled: dEnabled(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    validationStatus: dValidationStatus(defaultProps.validationStatus),
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
    value: {
      description: `This method returns the current value of the ${COMP}.`,
      signature: "get value(): string",
    },
    setValue: {
      description: `This method sets the current value of the ${COMP}.`,
      signature: "set value(value: string): void",
      parameters: {
        value: "The new value to set for the color picker.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`width-${COMP}`]: "3em",
    [`height-${COMP}`]: "1.5em",
  },
});

type ThemedColorPickerProps = React.ComponentPropsWithoutRef<typeof ColorPicker>;

export const ThemedColorPicker = React.forwardRef<React.ElementRef<typeof ColorPicker>, ThemedColorPickerProps>(
  function ThemedColorPicker({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(ColorPickerMd);
    return (
      <ColorPicker
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const colorPickerComponentRenderer = createComponentRenderer(
  "ColorPicker",
  ColorPickerMd,
  ({
    node,
    extractValue,
    className,
    state,
    lookupEventHandler,
    registerComponentApi,
    updateState,
  }) => {
    const readOnly = extractValue.asOptionalBoolean(node.props?.readOnly, false);
    const enabled = extractValue.asOptionalBoolean(node.props?.enabled, true);
    return (
      <ColorPicker
        validationStatus={extractValue(node.props.validationStatus)}
        value={state.value}
        initialValue={extractValue(node.props.initialValue)}
        updateState={updateState}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        className={className}
        required={extractValue.asOptionalBoolean(node.props?.required)}
        enabled={enabled && !readOnly}
        readOnly={readOnly}
        autoFocus={extractValue.asOptionalBoolean(node.props?.autoFocus)}
      />
    );
  },
);
