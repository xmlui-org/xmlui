import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  createMetadata,
  dAutoFocus,
  dDidChange,
  dEnabled,
  dGotFocus,
  dInitialValue,
  dLostFocus,
  dPlaceholder,
  dReadonly,
  dRequired,
  dValidationStatus,
} from "../metadata-helpers";
import { RatingInput, defaultProps } from "./RatingInputNative";
import styles from "./RatingInput.module.scss";

const COMP = "RatingInput";

export const RatingInputMd = createMetadata({
  status: "experimental",
  description: "`RatingInput` is a star-based rating input control.",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`textColor-placeholder-${COMP}`]: "$color-surface-500",
    [`fontSize-placeholder-${COMP}`]: "14px",
    [`color-star-${COMP}`]: "$color-surface-400",
    [`color-star-${COMP}--active`]: "$color-warn-500",
    [`fontSize-star-${COMP}`]: "18px",
    [`gap-${COMP}`]: "4px",
    [`outlineColor-${COMP}--error`]: "$color-danger-500",
    [`outlineWidth-${COMP}--error`]: "1px",
    [`outlineStyle-${COMP}--error`]: "solid",
    [`borderRadius-${COMP}--error`]: "$borderRadius",
    [`outlineColor-${COMP}--warning`]: "$color-warn-500",
    [`outlineWidth-${COMP}--warning`]: "1px",
    [`outlineStyle-${COMP}--warning`]: "solid",
    [`borderRadius-${COMP}--warning`]: "$borderRadius",
    [`outlineColor-${COMP}--valid`]: "$color-success-500",
    [`outlineWidth-${COMP}--valid`]: "1px",
    [`outlineStyle-${COMP}--valid`]: "solid",
    [`borderRadius-${COMP}--valid`]: "$borderRadius",
    [`opacity-${COMP}--disabled`]: "0.6",
    [`opacity-${COMP}--readOnly`]: "0.8",
  },
  props: {
    placeholder: dPlaceholder(),
    initialValue: {
      ...dInitialValue(),
      defaultValue: defaultProps.initialValue,
    },
    maxRating: {
      description: "Maximum number of stars to render.",
      isRequired: false,
      valueType: "number",
      defaultValue: defaultProps.maxRating,
    },
    verboseValidationFeedback: {
      description: "Enables a concise validation summary (icon) in input components.",
      valueType: "boolean",
    },
    validationIconSuccess: {
      description: "Icon to display for valid state when concise validation summary is enabled.",
      valueType: "string",
    },
    validationIconError: {
      description: "Icon to display for error state when concise validation summary is enabled.",
      valueType: "string",
    },
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: {
      ...dEnabled(),
      defaultValue: defaultProps.enabled,
    },
    validationStatus: {
      ...dValidationStatus(),
      defaultValue: defaultProps.validationStatus,
    },
    invalidMessages: {
      description: "The invalid messages to display for the input component.",
      valueType: "any",
    },
  },
  events: {
    didChange: dDidChange(COMP),
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
  },
  apis: {
    value: {
      description: "The current rating value.",
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: "Set the rating value.",
      signature: "setValue(value: number): void",
    },
    focus: {
      description: "Focus the rating input.",
      signature: "focus(): void",
    },
  },
});

export const ratingInputComponentRenderer = createComponentRenderer(
  COMP,
  RatingInputMd,
  ({
    node,
    state,
    updateState,
    lookupEventHandler,
    extractValue,
    className,
    registerComponentApi,
  }) => {
    const props = (node.props ?? {}) as Record<string, unknown>;

    return (
      <RatingInput
        className={className}
        value={state?.value}
        updateState={updateState}
        initialValue={extractValue.asOptionalNumber(props.initialValue)}
        maxRating={extractValue.asOptionalNumber(props.maxRating)}
        autoFocus={extractValue.asOptionalBoolean(props.autoFocus)}
        readOnly={extractValue.asOptionalBoolean(props.readOnly)}
        required={extractValue.asOptionalBoolean(props.required)}
        verboseValidationFeedback={extractValue.asOptionalBoolean(props.verboseValidationFeedback)}
        validationIconSuccess={extractValue.asOptionalString(props.validationIconSuccess)}
        validationIconError={extractValue.asOptionalString(props.validationIconError)}
        enabled={extractValue.asOptionalBoolean(props.enabled)}
        placeholder={extractValue.asOptionalString(props.placeholder)}
        validationStatus={extractValue(props.validationStatus)}
        invalidMessages={extractValue(props.invalidMessages)}
        onDidChange={lookupEventHandler("didChange")}
        onFocus={lookupEventHandler("gotFocus")}
        onBlur={lookupEventHandler("lostFocus")}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
