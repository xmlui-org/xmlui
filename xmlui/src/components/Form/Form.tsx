import styles from "./Form.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dComponent, dEnabled, dInternal } from "../metadata-helpers";
import { labelPositionMd, requireLabelModeMd } from "../abstractions";
import { FormWithContextVar, defaultProps } from "./FormReact";

const COMP = "Form";

export const FormMd = createMetadata({
  status: "stable",
  description:
    "`Form` provides a structured container for collecting and validating user " +
    "input, with built-in data binding, validation, and submission handling. It " +
    "automatically manages form state and provides context for nested form controls " +
    "to work together.",
  parts: {
    buttonRow: {
      description: "The container for the form action buttons (e.g., Save, Cancel).",
    },
    // NOTE: There is a ValidationSummary in the form and also one in the modal dialog.
    validationSummary: {
      description: "The area displaying validation summary messages for the form.",
    }
  },
  props: {
    buttonRowTemplate: dComponent(
      `This property allows defining a custom component to display the buttons at the bottom of the form.`,
    ),
    itemLabelPosition: {
      description:
        `This property sets the position of the item labels within the form.` +
        `Individual \`FormItem\` instances can override this property.`,
      availableValues: labelPositionMd,
      type: "string",
      defaultValue: defaultProps.itemLabelPosition,
    },
    itemLabelWidth: {
      description:
        "This property sets the width of the item labels within the form. Individual " +
        "\`FormItem\` instances can override this property. If this property is not set, " +
        "each form item nested in the form uses its calculated label width. These widths " +
        "may be different for each item.",
      type: "string",
    },
    itemLabelBreak: {
      description:
        `This boolean value indicates if form item labels can be split into multiple ` +
        `lines if it would overflow the available label width. Individual \`FormItem\` ` +
        `instances can override this property.`,
      type: "boolean",
      defaultValue: defaultProps.itemLabelBreak,
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
    keepModalOpenOnSubmit: {
      description: "This property prevents the modal from closing when the form is submitted.",
      type: "boolean",
      defaultValue: defaultProps.keepModalOpenOnSubmit,
    },
    data: {
      description:
        "This property sets the initial value of the form's data structure. The form infrastructure " +
        "uses this value to set the initial state of form items within the form. If this property is" +
        "not set, the form does not have an initial value.",
    },
    cancelLabel: {
      description: "This property defines the label of the Cancel button.",
      type: "string",
      defaultValue: defaultProps.cancelLabel,
    },
    saveLabel: {
      description: `This property defines the label of the Save button.`,
      type: "string",
      defaultValue: defaultProps.saveLabel,
    },
    saveInProgressLabel: {
      description:
        "This property defines the label of the Save button to display during the " +
        "form data submit (save) operation.",
      type: "string",
      defaultValue: defaultProps.saveInProgressLabel,
    },
    savePendingLabel: {
      description:
        "This property defines the label of the Save button to display while " +
        "async field validation is still in-flight. During async validation, the Submit button " +
        "is disabled to prevent submission before validation completes.",
      type: "string",
      defaultValue: defaultProps.savePendingLabel,
    },
    submitFeedbackDelay: {
      description:
        "The number of milliseconds to wait before switching the Save button label to " +
        "`saveInProgressLabel` or `savePendingLabel`. This prevents a distracting label " +
        "flash when submit or validation completes quickly.",
      type: "number",
      defaultValue: defaultProps.submitFeedbackDelay,
    },
    swapCancelAndSave: {
      description:
        `By default, the Cancel button is to the left of the Save button. Set this property to ` +
        `\`true\` to swap them or \`false\` to keep their original location.`,
      type: "boolean",
      defaultValue: defaultProps.swapCancelAndSave,
    },
    hideButtonRowUntilDirty: {
      description:
        `This property hides the button row until the form data is modified (dirty).`,
      type: "boolean",
      defaultValue: defaultProps.hideButtonRowUntilDirty,
    },
    hideButtonRow: {
      description:
        `This property hides the button row entirely when set to true.`,
      type: "boolean",
      defaultValue: defaultProps.hideButtonRow,
    },
    stickyButtonRow: {
      description:
        `When set to true, the button row sticks to the bottom of the scrollable content area. ` +
        `Useful when the form is displayed inside a scrollable container such as a ModalDialog.`,
      type: "boolean",
      defaultValue: defaultProps.stickyButtonRow,
    },
    enableSubmit: {
      description:
        `This property controls whether the submit button is enabled. When set to false, ` +
        `the submit button is disabled and the form cannot be submitted.`,
      type: "boolean",
      defaultValue: defaultProps.enableSubmit,
    },
    submitUrl: d(`URL to submit the form data.`),
    submitMethod: {
      description:
        "This property sets the HTTP method to use when submitting the form data. If not " +
        "defined, `put` is used when the form has initial data; otherwise, `post`.",
    },
    inProgressNotificationMessage: d("This property sets the message to display when the form is being submitted."),
    completedNotificationMessage: d("This property sets the message to display when the form is submitted successfully."),
    errorNotificationMessage: d("This property sets the message to display when the form submission fails."),
    enabled: dEnabled(),
    itemRequireLabelMode: {
      description:
        `This property controls how required indicators are displayed for required form items. ` +
        `Individual \`FormItem\` instances can override this property.`,
      availableValues: requireLabelModeMd,
      defaultValue: defaultProps.itemRequireLabelMode,
      type: "string",
    },
    _data_url: dInternal("when we have an api bound data prop, we inject the url here"),
    persist: {
      description:
        "When set to `true` (or a non-empty string), the form temporarily saves its data to " +
        "localStorage as the user types, so that unsaved changes survive a page reload or crash. " +
        "On a successful submit the saved data is automatically cleared.",
      type: "boolean",
    },
    storageKey: {
      description:
        "The key used to save the form's temporary data in localStorage when `persist` is enabled. " +
        "If omitted, the form's `id` attribute is used. If the form has no `id`, the key " +
        "defaults to `\"form-data\"`.",
      type: "string",
    },
    doNotPersistFields: {
      description:
        "An optional list of field names (matching the `bindTo` values of nested `FormItem` " +
        "components) that should be excluded from the temporary localStorage save. The fields " +
        "are still submitted normally; they are only excluded from the persisted snapshot.",
      type: "string[]",
    },
    keepOnCancel: {
      description:
        "When `persist` is enabled and the user cancels the form, this property controls " +
        "whether the temporarily saved data is kept (`true`) or cleared (`false`, the default).",
      type: "boolean",
      defaultValue: false,
    },
    dataAfterSubmit: {
      description:
        "Controls what happens to the form data after a successful submit. " +
        "`\"keep\"` (default) leaves the submitted data in the form. " +
        "`\"reset\"` restores the form to its initial data (the value of the `data` property). " +
        "`\"clear\"` empties the form as if no `data` property were set.",
      availableValues: ["keep", "reset", "clear"],
      type: "string",
      defaultValue: "keep",
    },
  },
  events: {
    willSubmit: {
      description:
        `The form infrastructure fires this event just before the form is submitted. The event receives ` +
        `two arguments: the cleaned form data (fields marked \`noSubmit\` excluded) and the complete form data ` +
        `(including all fields). The return value controls submission behavior: returning \`false\` cancels ` +
        `the submission; returning a plain object submits that object instead; returning \`null\`, \`undefined\`, ` +
        `an empty string, or any non-object value proceeds with normal submission.`,
      signature: "willSubmit(data: Record<string, any>, allData: Record<string, any>): false | Record<string, any> | null | undefined | void",
      parameters: {
        data: "The form data to be submitted (fields marked with noSubmit=\"true\" are excluded).",
        allData: "The complete form data including all fields, useful for cross-field validation.",
      },
    },
    submit: {
      description:
        `The form infrastructure fires this event when the form is submitted. The event argument ` +
        `is the current \`data\` value to save.`,
      signature: "submit(data: Record<string, any>): void",
      parameters: {
        data: "The current form data being submitted.",
      },
    },
    success: {
      description: "The form infrastructure fires this event when the form is submitted successfully.",
      signature: "success(response: any): void",
      parameters: {
        response: "The response from the successful form submission.",
      },
    },
    cancel: {
      description: `The form infrastructure fires this event when the form is canceled.`,
      signature: "cancel(): void",
      parameters: {},
    },
    reset: {
      description: `The form infrastructure fires this event when the form is reset.`,
      signature: "reset(): void",
      parameters: {},
    },
  },
  contextVars: {
    $data: d(
      `This property represents the value of the form data. You can access the fields of the form ` +
        `using the IDs in the \`bindTo\` property of nested \`FormItem\` instances. \`$data\` also ` +
        `provides an \`update\` method as a shortcut to the Form's exposed \`update\` method.`,
    ),
  },
  apis: {
    reset: {
      description: "This method resets the form to its initial state, clearing all user input.",
      signature: "reset(): void",
    },
    update: {
      description: "You can pass a data object to update the form data. The properties in the passed data " +
        "object are updated to their values accordingly. Other form properties remain intact.",
      signature: "update(data: Record<string, any>): void",
      parameters: {
        data: "An object containing the form data to update.",
      },
    },
    validate: {
      description: "This method triggers validation on all form fields without submitting the form. " +
        "It displays validation errors and returns the validation result along with the cleaned form data. " +
        "This is useful for implementing custom submit buttons or performing operations that require " +
        "validated data without actually submitting the form.",
      signature: "validate(): Promise<{ isValid: boolean, data: Record<string, any>, errors: ValidationResult[], warnings: ValidationResult[], validationResults: Record<string, ValidationResult> }>",
      returns: "A promise that resolves to an object containing validation status, cleaned data, and detailed validation results.",
    },
    getData: {
      description: "This method returns a deep clone of the current form data object. Changes to the returned object do not affect the form's internal state.",
      signature: "getData(): Record<string, any>",
      returns: "A deep clone of the current form data object.",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "gap-Form": "$space-4",
    "gap-buttonRow-Form": "$space-4",
    "backgroundColor-Form": "transparent",
    "backgroundColor-ValidationDisplay-error": "$color-danger-100",
    "backgroundColor-ValidationDisplay-warning": "$color-warn-100",
    "backgroundColor-ValidationDisplay-info": "$color-primary-100",
    "backgroundColor-ValidationDisplay-valid": "$color-success-100",
    "color-accent-ValidationDisplay-error": "$color-error",
    "color-accent-ValidationDisplay-warning": "$color-warning",
    "color-accent-ValidationDisplay-info": "$color-info",
    "color-accent-ValidationDisplay-valid": "$color-valid",
    "textColor-ValidationDisplay-error": "$color-error",
    "textColor-ValidationDisplay-warning": "$color-warning",
    "textColor-ValidationDisplay-info": "$color-info",
    "textColor-ValidationDisplay-valid": "$color-valid",
    "marginTop-buttonRow-Form": "$space-4",
    "paddingTop-buttonRow-Form": "0",
    "backgroundColor-buttonRow-Form": "transparent",
  },
});

export const formComponentRenderer = wrapComponent(
  COMP,
  FormWithContextVar,
  FormMd,
  {
    customRender: (_props, { node, renderChild, extractValue, lookupEventHandler, classes, registerComponentApi, appContext }) => (
      <FormWithContextVar
        node={node as any}
        renderChild={renderChild}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        classes={classes}
        registerComponentApi={registerComponentApi}
        appContext={appContext}
      />
    ),
  },
);
