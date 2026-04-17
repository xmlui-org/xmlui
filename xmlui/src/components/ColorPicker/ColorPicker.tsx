import { ColorPicker, defaultProps } from "./ColorPickerReact";
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
import { wrapComponent } from "../../components-core/wrapComponent";

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
  parts: {
    input: { description: "The color picker input element." },
  },
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

export const colorPickerComponentRenderer = wrapComponent(
  "ColorPicker",
  ThemedColorPicker,
  ColorPickerMd,
  {
    exposeRegisterApi: true,
    events: {
      gotFocus: "onFocus",
      lostFocus: "onBlur",
      didChange: "onDidChange",
    },
  },
);
