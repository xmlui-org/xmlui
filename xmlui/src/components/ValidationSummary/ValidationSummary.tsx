import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

export { ValidationSummary } from "./ValidationSummaryReact";

const COMP = "ValidationSummary";
const validationSummaryStylesSource = `
$gap-ValidationSummary: createThemeVar("gap-ValidationSummary");
$padding-ValidationDisplay: createThemeVar("padding-ValidationDisplay");
$backgroundColor-ValidationDisplay-error: createThemeVar("backgroundColor-ValidationDisplay-error");
$backgroundColor-ValidationDisplay-warning: createThemeVar("backgroundColor-ValidationDisplay-warning");
$color-accent-ValidationDisplay-error: createThemeVar("color-accent-ValidationDisplay-error");
$color-accent-ValidationDisplay-warning: createThemeVar("color-accent-ValidationDisplay-warning");
$textColor-ValidationDisplay-error: createThemeVar("textColor-ValidationDisplay-error");
$textColor-ValidationDisplay-warning: createThemeVar("textColor-ValidationDisplay-warning");
`;

export const ValidationSummaryMd = createMetadata({
  status: "experimental",
  description: "`ValidationSummary` displays form and field validation messages grouped by severity.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    fieldValidationResults: {
      description: "Validation results keyed by field name.",
      valueType: "any",
    },
    generalValidationResults: {
      description: "General validation results not tied to a field.",
      valueType: "any",
    },
  },
  themeVars: extractScssThemeVars(validationSummaryStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-2",
    "padding-ValidationDisplay": "$space-2",
    "backgroundColor-ValidationDisplay-error": "$color-danger-100",
    "backgroundColor-ValidationDisplay-warning": "$color-warn-100",
    "color-accent-ValidationDisplay-error": "$color-error",
    "color-accent-ValidationDisplay-warning": "$color-warning",
    "textColor-ValidationDisplay-error": "$color-error",
    "textColor-ValidationDisplay-warning": "$color-warning",
  },
});
