import styles from "./NumberBox.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { wrapComponent } from "../../components-core/wrapComponent";
import {
  createMetadata,
  d,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dEndIcon,
  dEndText,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dMaxLength,
  dPlaceholder,
  dReadonly,
  dRequired,
  dStartIcon,
  dStartText,
  dValidationStatus,
} from "../metadata-helpers";
import { defaultProps, NumberBox } from "./NumberBoxNative";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "NumberBox";

export const NumberBoxMd = createMetadata({
  status: "stable",
  description:
    "`NumberBox` provides a specialized input field for numeric values with built-in " +
    "validation, spinner buttons, and flexible formatting options. It supports both " +
    "integer and floating-point numbers, handles empty states as null values, and " +
    "integrates seamlessly with form validation.",
  parts: {
    label: {
      description: "The label displayed for the text box.",
    },
    startAdornment: {
      description: "The adornment displayed at the start of the text box.",
    },
    endAdornment: {
      description: "The adornment displayed at the end of the text box.",
    },
    input: {
      description: "The text box input area.",
    },
    spinnerButtonUp: {
      description: "The spinner button for incrementing the value.",
    },
    spinnerButtonDown: {
      description: "The spinner button for decrementing the value.",
    },
  },
  props: {
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(),
    maxLength: dMaxLength(),
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(),
    validationStatus: dValidationStatus(),
    startText: dStartText(),
    startIcon: dStartIcon(),
    endText: dEndText(),
    endIcon: dEndIcon(),
    gap: {
      description: "This property defines the gap between the adornments and the input area.",
    },
    hasSpinBox: {
      description: `This boolean prop shows (\`true\`) or hides (\`false\`) the spinner buttons for the input field.`,
      valueType: "boolean",
      defaultValue: defaultProps.hasSpinBox,
    },
    spinnerUpIcon: d(
      `Allows setting an alternate icon displayed in the ${COMP} spinner for incrementing values. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.spinnerUp:NumberBox" declaration in the ` +
        `app configuration file.`,
    ),
    spinnerDownIcon: d(
      `Allows setting an alternate icon displayed in the ${COMP} spinner for decrementing values. You can change ` +
        `the default icon for all ${COMP} instances with the "icon.spinnerDown:NumberBox" declaration in the ` +
        `app configuration file.`,
    ),
    step: {
      description: `This prop governs how big the step when clicking on the spinner of the field.`,
      valueType: "number",
      defaultValue: defaultProps.step,
    },
    integersOnly: {
      description:
        `This boolean property signs whether the input field accepts integers only (\`true\`) ` +
        `or not (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.integersOnly,
    },
    zeroOrPositive: {
      description:
        `This boolean property determines whether the input value can only be 0 or positive numbers ` +
        `(\`true\`) or also negative (\`false\`).`,
      valueType: "boolean",
      defaultValue: defaultProps.zeroOrPositive,
    },
    minValue: {
      description:
        "The minimum value the input field allows. Can be a float or an integer if " +
        "[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer." +
        "If not set, no minimum value check is done.",
      valueType: "number",
      defaultValue: defaultProps.min,
    },
    maxValue: {
      description:
        "The maximum value the input field allows. Can be a float or an integer if " +
        "[\`integersOnly\`](#integersonly) is set to \`false\`, otherwise it can only be an integer." +
        "If not set, no maximum value check is done.",
      valueType: "number",
      defaultValue: defaultProps.max,
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      type: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      type: "string",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      type: "string",
    },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: `This API focuses the input field of the \`${COMP}\`. You can use it to programmatically focus the field.`,
      signature: "focus(): void",
    },
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: number | undefined): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingVertical-${COMP}`]: "$space-2",
    [`paddingHorizontal-${COMP}`]: "$space-2",
  },
});

type ThemedNumberBoxProps = React.ComponentProps<typeof NumberBox> & { className?: string };

export const ThemedNumberBox = React.forwardRef<HTMLDivElement, ThemedNumberBoxProps>(
  function ThemedNumberBox({ className, classes, ...props }: ThemedNumberBoxProps, ref) {
    const themeClass = useComponentThemeClass(NumberBoxMd);
    const themedClasses: Record<string, string> = {
      ...(classes ?? {}),
      [COMPONENT_PART_KEY]: [themeClass, classes?.[COMPONENT_PART_KEY]].filter(Boolean).join(" "),
    };
    return <NumberBox {...props} className={className} classes={themedClasses} ref={ref} />;
  },
);

export const numberBoxComponentRenderer = wrapComponent(COMP, ThemedNumberBox, NumberBoxMd, {
  exposeRegisterApi: true,
  rename: {
    minValue: "min",
    maxValue: "max",
  },
  events: {
    gotFocus: "onFocus",
    lostFocus: "onBlur",
  },
  deriveAriaLabel: (props) => props.label || props.placeholder,
});
