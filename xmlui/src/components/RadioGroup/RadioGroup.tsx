import styles from "./RadioGroup.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dInternal,
  dLostFocus,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { RadioGroup, defaultProps } from "./RadioGroupNative";

const COMP = "RadioGroup";
const RGOption = `RadioGroupOption`;

export const RadioGroupMd = createMetadata({
  status: "stable",
  description:
    "`RadioGroup` creates a mutually exclusive selection interface where users can " +
    "choose only one option from a group of radio buttons. It manages the selection " +
    "state and ensures that selecting one option automatically deselects all others in " +
    "the group." +
    "Radio options store their values as strings. Numbers and booleans are converted to strings " +
    "when assigned, while objects, functions and arrays default to an empty string unless resolved " +
    "via binding expressions.",
  parts: {
    label: {
      description: "The label displayed for the radio group.",
    }
  },
  props: {
    initialValue: {
      ...dInitialValue(),
      defaultValue: defaultProps.initialValue,
    },
    autoFocus: dAutoFocus(),
    required: {
      ...dRequired(),
      defaultValue: defaultProps.required,
    },
    readOnly: dReadonly(),
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    orientation: dInternal(
      `(*** NOT IMPLEMENTED YET ***) This property sets the orientation of the ` +
        `options within the radio group.`,
    ),
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    value: {
      description: `This API retrieves the current value of the \`${COMP}\`. You can use it to get the value programmatically.`,
      signature: "get value(): string | undefined",
    },
    setValue: {
      description: `This API sets the value of the \`${COMP}\`. You can use it to programmatically change the value.`,
      signature: "setValue(value: string): void",
      parameters: {
        value: "The new value to set.",
      },
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`gap-${RGOption}`]: "0.25em",
    [`borderWidth-${RGOption}`]: "1px",
    [`borderWidth-${RGOption}-validation`]: `2px`,

    [`borderColor-${RGOption}--default`]: "$color-surface-500",
    [`borderColor-checked-${RGOption}`]: "$color-primary-500",
    [`borderColor-${RGOption}--default--hover`]: "$color-surface-700",
    [`borderColor-${RGOption}--default--active`]: "$color-primary-500",
    [`borderColor-${RGOption}--error`]: `$borderColor-Input--error`,
    [`borderColor-${RGOption}--warning`]: `$borderColor-Input--warning`,
    [`borderColor-${RGOption}--success`]: `$borderColor-Input--success`,

    [`backgroundColor-${RGOption}--disabled`]: "$backgroundColor--disabled",
    [`backgroundColor-checked-${RGOption}`]: "$color-primary-500",
    [`backgroundColor-checked-${RGOption}--disabled`]: `$textColor--disabled`,

    [`fontSize-${RGOption}`]: "$fontSize-sm",
    [`fontWeight-${RGOption}`]: "$fontWeight-bold",
    [`textColor-${RGOption}--disabled`]: "$textColor--disabled",
  },
});

export const radioGroupRenderer = createComponentRenderer(
  COMP,
  RadioGroupMd,
  ({
    node,
    extractValue,
    className,
    state,
    updateState,
    lookupEventHandler,
    renderChild,
    registerComponentApi,
  }) => {
    return (
      <RadioGroup
        autofocus={extractValue.asOptionalBoolean(node.props.autoFocus)}
        enabled={extractValue.asOptionalBoolean(node.props.enabled)}
        className={className}
        initialValue={extractValue(node.props.initialValue)}
        value={state?.value}
        updateState={updateState}
        validationStatus={extractValue(node.props.validationStatus)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
        required={extractValue.asOptionalBoolean(node.props.required)}
        readOnly={extractValue.asOptionalBoolean(node.props.readOnly)}
      >
        {renderChild(node.children)}
      </RadioGroup>
    );
  },
);
