import styles from "./Form.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dComponent, dInternal } from "../metadata-helpers";
import { labelPositionMd } from "../abstractions";
import { FormWithContextVar } from "./FormNative";

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
    itemLabelPosition: d(
      `This property sets the position of the item labels within the form.` +
        `Individual \`FormItem\` instances can override this property.`,
      labelPositionMd,
      "string",
      "top",
    ),
    itemLabelWidth: d(
      `This property sets the width of the item labels within the form. Individual ` +
        `\`FormItem\` instances can override this property.`,
    ),
    itemLabelBreak: d(
      `This boolean value indicates if form item labels can be split into multiple ` +
        `lines if it would overflow the available label width. Individual \`FormItem\` ` +
        `instances can override this property.`,
    ),
    keepModalOpenOnSubmit: d(
      "This property prevents the modal from closing when the form is submitted.",
    ),
    data: d(
      `This property sets the initial value of the form's data structure. The form infrastructure ` +
        `uses this value to set the initial state of form items within the form.`,
    ),
    cancelLabel: d(`This property defines the label of the Cancel button, by default, "Cancel".`),
    saveLabel: d(`This property defines the label of the Save button, by default, "Save".`),
    saveInProgressLabel: d(
      "This property defines the label of the Save button to display during the " +
        "form data submit (save) operation. By default, the value of `saveLabel`.",
    ),
    swapCancelAndSave: d(
      `By default, the Cancel button is to the left of the Save button. Set this property to ` +
        `\`true\` to swap them or \`false\` to keep their original location.`,
    ),
    submitUrl: d(`URL to submit the form data.`),
    submitMethod: d(`HTTP method to use when submitting the form data.`),
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
        `using the IDs in the \`bindTo\` property of nested \`FormItem\` instances.`,
    ),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "gap-Form": "$space-4",
    "gap-buttonRow-Form": "$space-4",
    light: {
      "color-bg-ValidationDisplay-error": "$color-danger-100",
      "color-bg-ValidationDisplay-warning": "$color-warn-100",
      "color-bg-ValidationDisplay-info": "$color-primary-100",
      "color-bg-ValidationDisplay-valid": "$color-success-100",
      "color-accent-ValidationDisplay-error": "$color-error",
      "color-accent-ValidationDisplay-warning": "$color-warning",
      "color-accent-ValidationDisplay-info": "$color-info",
      "color-accent-ValidationDisplay-valid": "$color-valid",
      "color-text-ValidationDisplay-error": "$color-error",
      "color-text-ValidationDisplay-warning": "$color-warning",
      "color-text-ValidationDisplay-info": "$color-info",
      "color-text-ValidationDisplay-valid": "$color-valid",
    },
    dark: {
      "color-bg-ValidationDisplay-error": "$color-danger-900",
      "color-bg-ValidationDisplay-warning": "$color-warn-900",
      "color-bg-ValidationDisplay-info": "$color-secondary-800",
      "color-bg-ValidationDisplay-valid": "$color-success-900",
      "color-accent-ValidationDisplay-error": "$color-danger-500",
      "color-accent-ValidationDisplay-warning": "$color-warn-700",
      "color-accent-ValidationDisplay-info": "$color-surface-200",
      "color-accent-ValidationDisplay-valid": "$color-success-600",
      "color-text-ValidationDisplay-error": "$color-danger-500",
      "color-text-ValidationDisplay-warning": "$color-warn-700",
      "color-text-ValidationDisplay-info": "$color-secondary-200",
      "color-text-ValidationDisplay-valid": "$color-success-600",
    },
  },
});

export const formComponentRenderer = createComponentRenderer(
  COMP,
  FormMd,
  ({ node, renderChild, extractValue, layoutCss, lookupEventHandler, registerComponentApi }) => {
    return (
      <FormWithContextVar
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
        lookupEventHandler={lookupEventHandler as any}
        style={layoutCss}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
