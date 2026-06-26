import { createMetadata, dComponent, dEnabled } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "Form";
const formStylesSource = `
$gap-Form: createThemeVar("gap-Form");
$gap-buttonRow-Form: createThemeVar("gap-buttonRow-Form");
$marginTop-buttonRow-Form: createThemeVar("marginTop-buttonRow-Form");
$paddingTop-buttonRow-Form: createThemeVar("paddingTop-buttonRow-Form");
$backgroundColor-Form: createThemeVar("backgroundColor-Form");
$backgroundColor-buttonRow-Form: createThemeVar("backgroundColor-buttonRow-Form");
$textColor-error-Form: createThemeVar("textColor-error-Form");
`;

export const FormMd = createMetadata({
  status: "experimental",
  description:
    "`Form` groups input fields, tracks field values, validates required fields, and raises submit/cancel events.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    buttonRowTemplate: dComponent(
      "This property allows defining a custom component to display the buttons at the bottom of the form.",
    ),
    data: { description: "Initial form data object.", valueType: "any" },
    enabled: dEnabled(true),
    saveLabel: {
      description: "The label of the submit button.",
      valueType: "string",
      defaultValue: "Save",
    },
    savePendingLabel: {
      description: "The label of the submit button while async field validation is in progress.",
      valueType: "string",
      defaultValue: "Validating...",
    },
    submitFeedbackDelay: {
      description: "Delay in milliseconds before showing submit/validation feedback labels.",
      valueType: "number",
      defaultValue: 100,
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
    hideButtonRowUntilDirty: {
      description: "Hides the built-in submit and cancel button row until a field value changes.",
      valueType: "boolean",
      defaultValue: false,
    },
    stickyButtonRow: {
      description:
        "When set to true, the button row sticks to the bottom of the scrollable content area.",
      valueType: "boolean",
      defaultValue: false,
    },
    persist: {
      description: "Saves temporary form data to localStorage while the user edits.",
      valueType: "boolean",
      defaultValue: false,
    },
    storageKey: {
      description: "localStorage key used when persist is enabled.",
      valueType: "string",
    },
    doNotPersistFields: {
      description: "Field names excluded from the persisted temporary form data.",
      valueType: "any",
    },
    keepOnCancel: {
      description: "Keeps persisted temporary form data when the user cancels.",
      valueType: "boolean",
      defaultValue: false,
    },
    enableSubmit: {
      description: "Enables the built-in submit button.",
      valueType: "boolean",
      defaultValue: true,
    },
    submitUrl: {
      description: "URL to submit valid form data to.",
      valueType: "string",
    },
    submitMethod: {
      description: "HTTP method used when submitting to submitUrl.",
      valueType: "string",
    },
    dataAfterSubmit: {
      description: "Controls what form data remains after a successful submit.",
      valueType: "string",
      availableValues: ["keep", "reset", "clear"],
      defaultValue: "keep",
    },
    itemLabelPosition: { description: "Default label position for form items.", valueType: "string" },
    itemLabelWidth: { description: "Default label width for form items.", valueType: "length" },
    itemLabelBreak: { description: "Default label break behavior for form items.", valueType: "boolean" },
    itemRequireLabelMode: {
      description: "Default required/optional label indicator mode for form items.",
      valueType: "string",
      availableValues: ["markRequired", "markOptional", "markBoth"],
      defaultValue: "markRequired",
    },
    verboseValidationFeedback: {
      description: "Controls whether form fields render verbose helper text or concise validation feedback by default.",
      valueType: "boolean",
      defaultValue: true,
    },
  },
  events: {
    willSubmit: {
      description: "This event is triggered before the form submits and may cancel or transform submitted data.",
    },
    submit: {
      description: "This event is triggered when the form validates and submits.",
    },
    submitFailed: {
      description: "This event is triggered when form validation prevents submission.",
    },
    cancel: {
      description: "This event is triggered when the user cancels the form.",
    },
    reset: {
      description: "This event is triggered when the form is reset.",
    },
    success: {
      description: "This event is triggered after the form submits successfully.",
    },
    saved: {
      description: "Compatibility alias triggered after the form submits successfully.",
    },
  },
  contextVars: {
    $data: dComponent("The current form data object, including an update method for changing form values."),
  },
  themeVars: extractScssThemeVars(formStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$space-4",
    [`gap-buttonRow-${COMP}`]: "$space-2",
    [`marginTop-buttonRow-${COMP}`]: "$space-2",
    [`paddingTop-buttonRow-${COMP}`]: "0",
    [`backgroundColor-${COMP}`]: "transparent",
    [`backgroundColor-buttonRow-${COMP}`]: "transparent",
    [`textColor-error-${COMP}`]: "$color-danger-500",
  },
});
