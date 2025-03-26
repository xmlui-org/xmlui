import styles from "./Form.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dComponent, dInternal } from "../metadata-helpers";
import { labelPositionMd } from "../abstractions";
import { FormWithContextVar, defaultProps } from "./FormNative";

const COMP = "Form";

export const FormMd = createMetadata({
  status: "experimental",
  description:
    `A \`${COMP}\` is a fundamental component that displays user interfaces that allow users to input ` +
    `(or change) data and submit it to the app (a server) for further processing.`,
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
        `This property sets the width of the item labels within the form. Individual ` +
        `\`FormItem\` instances can override this property.`,
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
        `This property sets the initial value of the form's data structure. The form infrastructure ` +
        `uses this value to set the initial state of form items within the form.`,
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
    },
    submitUrl: d(`URL to submit the form data.`),
    submitMethod: {
      description:
        "This property sets the HTTP method to use when submitting the form data. If not " +
        "defined, `put` is used when the form has initial data; otherwise, `post`.",
    },
    enabled: d(`Whether the form is enabled or not. The default value is \`true\`.`),
    _data_url: dInternal("when we have an api bound data prop, we inject the url here"),
  },
  events: {
    submit: d(
      `The form infrastructure fires this event when the form is submitted. The event argument ` +
        `is the current \`data\` value to save.`,
    ),
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
    reset: d(`Call this event to reset the form to its initial state.`),
    update: d(
      "You can pass a data object to update the form data. The properties in the passed data " +
        "object are updated to their values accordingly. Other form properties remain intact.",
    ),
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
  },
});

export const formComponentRenderer = createComponentRenderer(
  COMP,
  FormMd,
  ({ node, renderChild, extractValue, layoutCss, lookupEventHandler, registerComponentApi }) => {
    return (
      <FormWithContextVar
        node={node as any}
        renderChild={renderChild}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        style={layoutCss}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
