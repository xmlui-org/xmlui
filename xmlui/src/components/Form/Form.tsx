import { createMetadata, dEnabled } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "Form";
const formStylesSource = `
$gap-Form: createThemeVar("gap-Form");
$gap-buttonRow-Form: createThemeVar("gap-buttonRow-Form");
$marginTop-buttonRow-Form: createThemeVar("marginTop-buttonRow-Form");
$textColor-error-Form: createThemeVar("textColor-error-Form");
`;

export const FormMd = createMetadata({
  status: "experimental",
  description:
    "`Form` groups input fields, tracks field values, validates required fields, and raises submit/cancel events.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    data: { description: "Initial form data object.", valueType: "any" },
    enabled: dEnabled(true),
    saveLabel: {
      description: "The label of the submit button.",
      valueType: "string",
      defaultValue: "Save",
    },
    cancelLabel: {
      description: "The label of the cancel button.",
      valueType: "string",
      defaultValue: "Cancel",
    },
    hideButtonRow: {
      description: "Hides the built-in submit and cancel button row.",
      valueType: "boolean",
      defaultValue: false,
    },
    enableSubmit: {
      description: "Enables the built-in submit button.",
      valueType: "boolean",
      defaultValue: true,
    },
    itemLabelPosition: { description: "Default label position for form items.", valueType: "string" },
    itemLabelWidth: { description: "Default label width for form items.", valueType: "length" },
    itemLabelBreak: { description: "Default label break behavior for form items.", valueType: "boolean" },
  },
  events: {
    submit: {
      description: "This event is triggered when the form validates and submits.",
    },
    cancel: {
      description: "This event is triggered when the user cancels the form.",
    },
  },
  themeVars: extractScssThemeVars(formStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-4",
    [`gap-buttonRow-${COMP}`]: "$space-2",
    [`marginTop-buttonRow-${COMP}`]: "$space-2",
    [`textColor-error-${COMP}`]: "$color-danger-500",
  },
});
