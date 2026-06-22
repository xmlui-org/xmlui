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
} from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./RatingInput.defaults";
import { RatingInputNative, type RatingInputApi } from "./RatingInputReact";

const COMP = "RatingInput";

const ratingInputStylesSource = `
$textColor-placeholder-RatingInput: createThemeVar("textColor-placeholder-RatingInput");
$fontSize-placeholder-RatingInput: createThemeVar("fontSize-placeholder-RatingInput");
$color-star-RatingInput: createThemeVar("color-star-RatingInput");
$color-star-RatingInput--active: createThemeVar("color-star-RatingInput--active");
$fontSize-star-RatingInput: createThemeVar("fontSize-star-RatingInput");
$gap-RatingInput: createThemeVar("gap-RatingInput");
$outlineColor-RatingInput--error: createThemeVar("outlineColor-RatingInput--error");
$outlineWidth-RatingInput--error: createThemeVar("outlineWidth-RatingInput--error");
$outlineStyle-RatingInput--error: createThemeVar("outlineStyle-RatingInput--error");
$borderRadius-RatingInput--error: createThemeVar("borderRadius-RatingInput--error");
$outlineColor-RatingInput--warning: createThemeVar("outlineColor-RatingInput--warning");
$outlineWidth-RatingInput--warning: createThemeVar("outlineWidth-RatingInput--warning");
$outlineStyle-RatingInput--warning: createThemeVar("outlineStyle-RatingInput--warning");
$borderRadius-RatingInput--warning: createThemeVar("borderRadius-RatingInput--warning");
$outlineColor-RatingInput--valid: createThemeVar("outlineColor-RatingInput--valid");
$outlineWidth-RatingInput--valid: createThemeVar("outlineWidth-RatingInput--valid");
$outlineStyle-RatingInput--valid: createThemeVar("outlineStyle-RatingInput--valid");
$borderRadius-RatingInput--valid: createThemeVar("borderRadius-RatingInput--valid");
$opacity-RatingInput--disabled: createThemeVar("opacity-RatingInput--disabled");
$opacity-RatingInput--readOnly: createThemeVar("opacity-RatingInput--readOnly");
`;

export const RatingInputMd = createMetadata({
  status: "experimental",
  description: "`RatingInput` provides a star-based input for selecting a numeric rating.",
  parts: {
    input: { description: "The rating input area." },
  },
  defaultPart: "input",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    placeholder: dPlaceholder(),
    initialValue: dInitialValue(defaultProps.initialValue, "number"),
    value: { description: "Controlled rating value.", valueType: "number" },
    maxRating: {
      description: "The maximum rating value and number of stars to display.",
      valueType: "number",
      defaultValue: defaultProps.maxRating,
    },
    autoFocus: dAutoFocus(),
    required: dRequired(),
    readOnly: dReadonly(),
    enabled: dEnabled(defaultProps.enabled),
    validationStatus: { description: "Validation status.", valueType: "string" },
    invalidMessages: { description: "Invalid messages.", valueType: "string[]" },
    verboseValidationFeedback: { description: "Controls verbose validation feedback.", valueType: "boolean" },
    validationIconSuccess: { description: "Icon shown for valid concise validation feedback.", valueType: "icon" },
    validationIconError: { description: "Icon shown for invalid concise validation feedback.", valueType: "icon" },
    tooltip: { description: "The tooltip text.", valueType: "string" },
    tooltipMarkdown: { description: "The markdown tooltip text.", valueType: "string" },
    animation: { description: "The animation definition.", valueType: "any" },
    variant: { description: "The variant value.", valueType: "string" },
    requireLabelMode: { description: "Controls required/optional label markers.", valueType: "string" },
    bindTo: { description: "Binds the rating input to form data.", valueType: "string" },
  },
  events: {
    gotFocus: dGotFocus(COMP),
    lostFocus: dLostFocus(COMP),
    didChange: dDidChange(COMP),
  },
  apis: {
    focus: {
      description: "Sets focus on the RatingInput component.",
      signature: "focus(): void",
    },
    value: {
      description: "Returns the current rating value.",
      signature: "get value(): number | undefined",
    },
    setValue: {
      description: "Sets the current rating value.",
      signature: "setValue(value: number | undefined): void",
      parameters: {
        value: "The new rating value.",
      },
    },
  },
  themeVars: extractScssThemeVars(ratingInputStylesSource),
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
    [`opacity-${COMP}--disabled`]: "0.5",
    [`opacity-${COMP}--readOnly`]: "0.7",
  },
  limitThemeVarsToComponent: true,
});

export const ratingInputRenderer = wrapComponent({
  name: COMP,
  metadata: RatingInputMd,
  defaultPart: "input",
  renderer: ({ adapter }) => {
    const apiRef = { current: null as RatingInputApi | null };
    return (
      <RatingInputNative
        {...adapter.rootAttrs("input")}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        value={adapter.prop("value")}
        initialValue={adapter.prop("initialValue", defaultProps.initialValue)}
        maxRating={adapter.prop("maxRating", defaultProps.maxRating)}
        placeholder={adapter.stringProp("placeholder")}
        enabled={adapter.booleanProp("enabled", defaultProps.enabled)}
        readOnly={adapter.booleanProp("readOnly", defaultProps.readOnly)}
        required={adapter.booleanProp("required", false)}
        autoFocus={adapter.booleanProp("autoFocus", false)}
        validationStatus={adapter.stringProp("validationStatus", defaultProps.validationStatus)}
        onDidChange={(value) => {
          void adapter.event("didChange")(value);
        }}
        onFocus={() => {
          void adapter.event("gotFocus")();
        }}
        onBlur={() => {
          void adapter.event("lostFocus")();
        }}
      />
    );
  },
});
