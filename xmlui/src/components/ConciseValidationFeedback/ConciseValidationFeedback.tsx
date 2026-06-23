import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "ConciseValidationFeedback";
const conciseValidationFeedbackStylesSource = `
$textColor-ConciseValidationFeedback-error: createThemeVar("textColor-ConciseValidationFeedback-error");
$textColor-ConciseValidationFeedback-valid: createThemeVar("textColor-ConciseValidationFeedback-valid");
`;

export const ConciseValidationFeedbackMd = createMetadata({
  status: "experimental",
  description: "`ConciseValidationFeedback` displays compact validation feedback for a single field.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    validationStatus: {
      description: "The validation status to display.",
      valueType: "string",
      availableValues: ["error", "valid", "warning", "none"],
    },
    invalidMessages: {
      description: "Validation messages used for the error tooltip/accessible text.",
      valueType: "string[]",
    },
    successIcon: { description: "Icon name for valid feedback.", valueType: "icon", defaultValue: "checkmark" },
    errorIcon: { description: "Icon name for error feedback.", valueType: "icon", defaultValue: "error" },
  },
  themeVars: extractScssThemeVars(conciseValidationFeedbackStylesSource),
  defaultThemeVars: {
    [`textColor-${COMP}-error`]: "$color-error",
    [`textColor-${COMP}-valid`]: "$color-valid",
  },
});

