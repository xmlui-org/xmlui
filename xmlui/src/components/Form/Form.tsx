import styles from "./Form.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dComponent, dEnabled, dInternal } from "../metadata-helpers";
import { httpMethodNames, labelPositionMd, requireLabelModeMd } from "../abstractions";
import { defaultProps } from "./Form.defaults";
import { FormWithContextVar } from "./FormReact";

const COMP = "Form";

export const FormMd = createMetadata({
  status: "stable",
  description:
    "`Form` provides a structured container for collecting and validating user " +
    "input, with built-in data binding, validation, and submission handling. It " +
    "automatically manages form state and provides context for nested form controls " +
    "to work together.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  parts: {
    buttonRow: {
      description: "The container for the form action buttons (e.g., Save, Cancel).",
    },
    // NOTE: There is a ValidationSummary in the form and also one in the modal dialog.
    validationSummary: {
      description: "The area displaying validation summary messages for the form.",
    },
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
      valueType: "string",
      defaultValue: defaultProps.itemLabelPosition,
    },
    itemLabelWidth: {
      description:
        "This property sets the width of the item labels within the form. Individual " +
        "\`FormItem\` instances can override this property. If this property is not set, " +
        "each form item nested in the form uses its calculated label width. These widths " +
        "may be different for each item.",
      valueType: "string",
    },
    itemLabelBreak: {
      description:
        `This boolean value indicates if form item labels can be split into multiple ` +
        `lines if it would overflow the available label width. Individual \`FormItem\` ` +
        `instances can override this property.`,
      valueType: "boolean",
      defaultValue: defaultProps.itemLabelBreak,
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
    keepModalOpenOnSubmit: {
      description: "This property prevents the modal from closing when the form is submitted.",
      valueType: "boolean",
      defaultValue: defaultProps.keepModalOpenOnSubmit,
    },
    data: {
      description:
        "This property sets the initial value of the form's data structure. The form infrastructure " +
        "uses this value to set the initial state of form items within the form. If this property is" +
        "not set, the form does not have an initial value.",
      valueType: "hash",
      audit: {
        classification: "sensitive",
        defaultRedaction: "hash",
      },
    },
    cancelLabel: {
      description: "This property defines the label of the Cancel button.",
      valueType: "string",
      defaultValue: defaultProps.cancelLabel,
    },
    saveLabel: {
      description: `This property defines the label of the Save button.`,
      valueType: "string",
      defaultValue: defaultProps.saveLabel,
    },
    saveInProgressLabel: {
      description:
        "This property defines the label of the Save button to display during the " +
        "form data submit (save) operation.",
      valueType: "string",
      defaultValue: defaultProps.saveInProgressLabel,
    },
    savePendingLabel: {
      description:
        "This property defines the label of the Save button to display while " +
        "async field validation is still in-flight. During async validation, the Submit button " +
        "is disabled to prevent submission before validation completes.",
      valueType: "string",
      defaultValue: defaultProps.savePendingLabel,
    },
    submitFeedbackDelay: {
      description:
        "The number of milliseconds to wait before switching the Save button label to " +
        "`saveInProgressLabel` or `savePendingLabel`. This prevents a distracting label " +
        "flash when submit or validation completes quickly.",
      valueType: "number",
      defaultValue: defaultProps.submitFeedbackDelay,
    },
    swapCancelAndSave: {
      description:
        `By default, the Cancel button is to the left of the Save button. Set this property to ` +
        `\`true\` to swap them or \`false\` to keep their original location.`,
      valueType: "boolean",
      defaultValue: defaultProps.swapCancelAndSave,
    },
    hideButtonRowUntilDirty: {
      description: `This property hides the button row until the form data is modified (dirty).`,
      valueType: "boolean",
      defaultValue: defaultProps.hideButtonRowUntilDirty,
    },
    hideButtonRow: {
      description: `This property hides the button row entirely when set to true.`,
      valueType: "boolean",
      defaultValue: defaultProps.hideButtonRow,
    },
    stickyButtonRow: {
      description:
        `When set to true, the button row sticks to the bottom of the scrollable content area. ` +
        `Useful when the form is displayed inside a scrollable container such as a ModalDialog.`,
      valueType: "boolean",
      defaultValue: defaultProps.stickyButtonRow,
    },
    enableSubmit: {
      description:
        `This property controls whether the submit button is enabled. When set to false, ` +
        `the submit button is disabled and the form cannot be submitted.`,
      valueType: "boolean",
      defaultValue: defaultProps.enableSubmit,
    },
    submitUrl: { description: `URL to submit the form data.`, valueType: "url" },
    submitMethod: {
      description:
        "This property sets the HTTP method to use when submitting the form data. If not " +
        "defined, `put` is used when the form has initial data; otherwise, `post`.",
      valueType: "string",
      availableValues: httpMethodNames,
    },
    inProgressNotificationMessage: {
      description: "This property sets the message to display when the form is being submitted.",
      valueType: "string",
    },
    completedNotificationMessage: {
      description:
        "This property sets the message to display when the form is submitted successfully.",
      valueType: "string",
    },
    errorNotificationMessage: {
      description: "This property sets the message to display when the form submission fails.",
      valueType: "string",
    },
    enabled: dEnabled(),
    itemRequireLabelMode: {
      description:
        `This property controls how required indicators are displayed for required form items. ` +
        `Individual \`FormItem\` instances can override this property.`,
      availableValues: requireLabelModeMd,
      defaultValue: defaultProps.itemRequireLabelMode,
      valueType: "string",
    },
    _data_url: dInternal("when we have an api bound data prop, we inject the url here"),
    persist: {
      description:
        "When set to `true` (or a non-empty string), the form temporarily saves its data to " +
        "localStorage as the user types, so that unsaved changes survive a page reload or crash. " +
        "On a successful submit the saved data is automatically cleared.",
      valueType: "boolean",
    },
    storageKey: {
      description:
        "The key used to save the form's temporary data in localStorage when `persist` is enabled. " +
        "If omitted, the form's `id` attribute is used. If the form has no `id`, the key " +
        'defaults to `"form-data"`.',
      valueType: "string",
    },
    doNotPersistFields: {
      description:
        "An optional list of field names (matching the `bindTo` values of nested `FormItem` " +
        "components) that should be excluded from the temporary localStorage save. The fields " +
        "are still submitted normally; they are only excluded from the persisted snapshot.",
      valueType: "any",
    },
    keepOnCancel: {
      description:
        "When `persist` is enabled and the user cancels the form, this property controls " +
        "whether the temporarily saved data is kept (`true`) or cleared (`false`, the default).",
      valueType: "boolean",
      defaultValue: defaultProps.keepOnCancel,
    },
    dataAfterSubmit: {
      description:
        "Controls what happens to the form data after a successful submit. " +
        '`"keep"` (default) leaves the submitted data in the form. ' +
        '`"reset"` restores the form to its initial data (the value of the `data` property). ' +
        '`"clear"` empties the form as if no `data` property were set.',
      availableValues: ["keep", "reset", "clear"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: defaultProps.dataAfterSubmit,
    },
    submitPolicy: {
      description:
        "Concurrency policy applied when the user triggers a submit while a previous " +
        "submit is still running. `single-flight` (default) ignores extra clicks. " +
        "`drop-while-running` fires the `submitDropped` event without queuing. " +
        "`queue` is reserved for a future scheduler — currently behaves like `single-flight`.",
      availableValues: ["single-flight", "queue", "drop-while-running"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: defaultProps.submitPolicy,
    },
    csrfToken: {
      description:
        "A CSRF token attached to the submit request as an HTTP header. The header name " +
        "defaults to `X-CSRF-Token` and can be customized via `appGlobals.csrfHeaderName`. " +
        "When the form uses the built-in submit handler (i.e. `submitUrl` is set and no " +
        "custom `onSubmit` is provided), the token is added automatically. Custom " +
        "`onSubmit` handlers can read the value via the `$formCsrfToken` context variable.",
      valueType: "string",
    },
    idempotencyKey: {
      description:
        "An idempotency key attached to the submit request as an HTTP header (default " +
        "header name `Idempotency-Key`, configurable via `appGlobals.idempotencyHeaderName`). " +
        "Supply a string the server can use to de-duplicate retries. When the form uses the " +
        "built-in submit handler the header is added automatically; custom handlers can read " +
        "the value via the `$formIdempotencyKey` context variable.",
      valueType: "string",
    },
  },
  events: {
    willSubmit: {
      injectedVars: ["$data"],
      description:
        `The form infrastructure fires this event just before the form is submitted. The event receives ` +
        `two arguments: the cleaned form data (fields marked \`noSubmit\` excluded) and the complete form data ` +
        `(including all fields). The return value controls submission behavior: returning \`false\` cancels ` +
        `the submission; returning a plain object submits that object instead; returning \`null\`, \`undefined\`, ` +
        `an empty string, or any non-object value proceeds with normal submission.`,
      signature:
        "willSubmit(data: Record<string, any>, allData: Record<string, any>): false | Record<string, any> | null | undefined | void",
      parameters: {
        data: 'The form data to be submitted (fields marked with noSubmit="true" are excluded).',
        allData: "The complete form data including all fields, useful for cross-field validation.",
      },
    },
    submit: {
      injectedVars: ["$data"],
      description:
        `The form infrastructure fires this event when the form is submitted. The event argument ` +
        `is the current \`data\` value to save.`,
      signature: "submit(data: Record<string, any>): void",
      parameters: {
        data: "The current form data being submitted.",
      },
    },
    submitFailed: {
      injectedVars: ["$data"],
      description:
        `The form infrastructure fires this event when a submit attempt is rejected because ` +
        `at least one field failed validation. \`willSubmit\` and \`submit\` are NOT fired in ` +
        `this case; \`submitFailed\` is the only signal available to react to a failed submit.`,
      signature:
        "submitFailed(validationResult: { isValid: boolean, errors: any[], warnings: any[], validationResults: Record<string, any>, data: Record<string, any> }): void",
      parameters: {
        validationResult:
          "The validation result of the failed submit, including the per-field validation results.",
      },
      isInternal: true,
    },
    success: {
      injectedVars: ["$data"],
      description:
        "The form infrastructure fires this event when the form is submitted successfully.",
      signature: "success(response: any): void",
      parameters: {
        response: "The response from the successful form submission.",
      },
    },
    cancel: {
      injectedVars: ["$data"],
      description: `The form infrastructure fires this event when the form is canceled.`,
      signature: "cancel(): void",
      parameters: {},
    },
    reset: {
      injectedVars: ["$data"],
      description: `The form infrastructure fires this event when the form is reset.`,
      signature: "reset(): void",
      parameters: {},
    },
    submitError: {
      description:
        "Fires when the submit handler throws. The event receives the raw error and, " +
        "when the framework was able to extract a structured validation problem (RFC 7807, " +
        "Spring, Laravel, or the XMLUI legacy shape), the parsed problem object. The form " +
        "has already merged per-field errors into the validation results when this fires.",
      signature: "submitError(error: any, problem: any): void",
      parameters: {
        error: "The raw error thrown by the submit handler.",
        problem:
          "The parsed RFC 7807-style validation problem, or `undefined` if none could be extracted.",
      },
    },
    submitDropped: {
      description:
        "Fires when a submit attempt is suppressed because the configured `submitPolicy` " +
        "rejected it (for example `drop-while-running`).",
      signature: "submitDropped(reason: string): void",
      parameters: {
        reason: "Why the submit was dropped (e.g. `drop-while-running`).",
      },
    },
  },
  contextVars: {
    $data: d(
      `This property represents the value of the form data. You can access the fields of the form ` +
        `using the IDs in the \`bindTo\` property of nested \`FormItem\` instances. \`$data\` also ` +
        `provides an \`update\` method as a shortcut to the Form's exposed \`update\` method.`,
    ),
    $formCancel: d(
      `Available inside the form's \`onSubmit\` handler. Exposes the per-attempt ` +
        `\`AbortSignal\` (\`$formCancel.signal\`) that the framework aborts when ` +
        `\`Form.cancel()\` is invoked. Pass this signal to \`Actions.callApi({ signal: ... })\` ` +
        `or other cancellable operations to make your submit handler cooperatively cancellable.`,
    ),
    $formCsrfToken: d(
      `Available inside the form's \`onSubmit\` handler. Carries the value of the ` +
        `\`csrfToken\` prop so custom submit handlers can attach the CSRF header to their own ` +
        `requests. \`undefined\` when the prop is not set.`,
    ),
    $formIdempotencyKey: d(
      `Available inside the form's \`onSubmit\` handler. Carries the value of the ` +
        `\`idempotencyKey\` prop. \`undefined\` when the prop is not set.`,
    ),
  },
  apis: {
    reset: {
      description: "This method resets the form to its initial state, clearing all user input.",
      signature: "reset(): void",
    },
    update: {
      description:
        "You can pass a data object to update the form data. The properties in the passed data " +
        "object are updated to their values accordingly. Other form properties remain intact.",
      signature: "update(data: Record<string, any>): void",
      parameters: {
        data: "An object containing the form data to update.",
      },
    },
    validate: {
      description:
        "This method triggers validation on all form fields without submitting the form. " +
        "It displays validation errors and returns the validation result along with the cleaned form data. " +
        "This is useful for implementing custom submit buttons or performing operations that require " +
        "validated data without actually submitting the form.",
      signature:
        "validate(): Promise<{ isValid: boolean, data: Record<string, any>, errors: ValidationResult[], warnings: ValidationResult[], validationResults: Record<string, ValidationResult> }>",
      returns:
        "A promise that resolves to an object containing validation status, cleaned data, and detailed validation results.",
    },
    getData: {
      description:
        "This method returns a deep clone of the current form data object. Changes to the returned object do not affect the form's internal state.",
      signature: "getData(): Record<string, any>",
      returns: "A deep clone of the current form data object.",
    },
    cancel: {
      description:
        "Aborts the AbortController associated with the in-flight submit. The framework " +
        "still awaits the submit handler's promise — cancellation is cooperative; handlers " +
        "that wish to bail out early should observe the `$cancel` token / abort signal.",
      signature: "cancel(): void",
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

export const formComponentRenderer = wrapComponent(COMP, FormWithContextVar, FormMd, {
  customRender: (
    _props,
    {
      node,
      renderChild,
      extractValue,
      lookupEventHandler,
      classes,
      registerComponentApi,
      appContext,
    },
  ) => (
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
});
