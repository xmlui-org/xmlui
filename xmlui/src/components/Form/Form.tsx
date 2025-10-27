import styles from "./Form.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dComponent, dEnabled, dInternal } from "../metadata-helpers";
import { labelPositionMd } from "../abstractions";
import { FormWithContextVar, defaultProps } from "./FormNative";

const COMP = "Form";

export const FormMd = createMetadata({
  status: "stable",
  description:
    "`Form` provides a structured container for collecting and validating user " +
    "input, with built-in data binding, validation, and submission handling. It " +
    "automatically manages form state and provides context for nested form controls " +
    "to work together.",
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
    _data_url: dInternal("when we have an api bound data prop, we inject the url here"),
  },
  events: {
    willSubmit: d(
      `The form infrastructure fires this event just before the form is submitted. The event argument ` +
        `is the current \`data\` value to be submitted. You can cancel the submission by returning ` +
        `\`false\` from the event handler.`,
    ),
    submit: d(
      `The form infrastructure fires this event when the form is submitted. The event argument ` +
        `is the current \`data\` value to save.`,
    ),
    success: d("The form infrastructure fires this event when the form is submitted successfully."),
    cancel: d(`The form infrastructure fires this event when the form is canceled.`),
    reset: d(`The form infrastructure fires this event when the form is reset.`),
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
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "gap-Form": "$space-4",
    "gap-buttonRow-Form": "$space-4",
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
    "marginTop-buttonRow-Form": "$space-4"
  },
});

export const formComponentRenderer = createComponentRenderer(
  COMP,
  FormMd,
  ({ node, renderChild, extractValue, className, lookupEventHandler, registerComponentApi }) => {
    return (
      <FormWithContextVar
        node={node as any}
        renderChild={renderChild}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        className={className}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
