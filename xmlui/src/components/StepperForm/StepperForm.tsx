import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, d, dEnabled, dInternal } from "../metadata-helpers";
import { labelPositionMd, requireLabelModeMd } from "../abstractions";
import { defaultProps as formDefaultProps } from "../Form/FormReact";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

const COMP = "StepperForm";

export const StepperFormMd = createMetadata({
  status: "experimental",
  description:
    "`StepperForm` bundles a `Form` and a `Stepper` into a multi-step wizard. Pass " +
    "`FormSegment` children directly: each segment becomes a step, with its `label` " +
    "shown in the stepper header, its validity automatically driving the step's " +
    "`error`/`completed` indicators, and Back/Next/Submit buttons auto-rendered " +
    "below the segment. All `Form` props, events, and methods are forwarded.",
  props: {
    data: {
      description:
        "Initial form data passed to the underlying `Form`. Same semantics as " +
        "`Form.data` — fields with `bindTo` matching keys in this object are " +
        "pre-populated and tracked across steps.",
      valueType: "any",
    },
    backLabel: {
      description: "Label for the auto-generated Back button on every step except the first.",
      valueType: "string",
      defaultValue: "Back",
    },
    nextLabel: {
      description: "Label for the auto-generated Next button on every step except the last.",
      valueType: "string",
      defaultValue: "Next",
    },
    submitLabel: {
      description: "Label for the auto-generated Submit button on the last step.",
      valueType: "string",
      defaultValue: "Submit",
    },
    itemLabelPosition: {
      description:
        `This property sets the position of the item labels within the form. ` +
        `Individual \`FormItem\` instances can override this property.`,
      availableValues: labelPositionMd,
      valueType: "string",
      defaultValue: formDefaultProps.itemLabelPosition,
    },
    itemLabelWidth: {
      description:
        "This property sets the width of the item labels within the form. Individual " +
        "`FormItem` instances can override this property.",
      valueType: "string",
    },
    itemLabelBreak: {
      description:
        `This boolean value indicates if form item labels can be split into multiple ` +
        `lines if it would overflow the available label width. Individual \`FormItem\` ` +
        `instances can override this property.`,
      valueType: "boolean",
      defaultValue: formDefaultProps.itemLabelBreak,
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
      defaultValue: formDefaultProps.keepModalOpenOnSubmit,
    },
    enableSubmit: {
      description:
        `This property controls whether the auto-generated Submit button is enabled. When set to ` +
        `false, the submit button is disabled and the form cannot be submitted.`,
      valueType: "boolean",
      defaultValue: formDefaultProps.enableSubmit,
    },
    submitUrl: d(`URL to submit the form data.`),
    submitMethod: {
      description:
        "This property sets the HTTP method to use when submitting the form data. If not " +
        "defined, `put` is used when the form has initial data; otherwise, `post`.",
    },
    inProgressNotificationMessage: d(
      "This property sets the message to display when the form is being submitted.",
    ),
    completedNotificationMessage: d(
      "This property sets the message to display when the form is submitted successfully.",
    ),
    errorNotificationMessage: d(
      "This property sets the message to display when the form submission fails.",
    ),
    enabled: dEnabled(),
    itemRequireLabelMode: {
      description:
        `This property controls how required indicators are displayed for required form items. ` +
        `Individual \`FormItem\` instances can override this property.`,
      availableValues: requireLabelModeMd,
      defaultValue: formDefaultProps.itemRequireLabelMode,
      valueType: "string",
    },
    _data_url: dInternal("when we have an api bound data prop, we inject the url here"),
    persist: {
      description:
        "When set to `true` (or a non-empty string), the form temporarily saves its data to " +
        "localStorage as the user types, so that unsaved changes survive a page reload or crash.",
      valueType: "boolean",
    },
    storageKey: {
      description:
        "The key used to save the form's temporary data in localStorage when `persist` is enabled.",
      valueType: "string",
    },
    doNotPersistFields: {
      description:
        "An optional list of field names that should be excluded from the temporary localStorage save.",
      type: "string[]",
    },
    keepOnCancel: {
      description:
        "When `persist` is enabled and the user cancels the form, this property controls " +
        "whether the temporarily saved data is kept (`true`) or cleared (`false`, the default).",
      valueType: "boolean",
      defaultValue: formDefaultProps.keepOnCancel,
    },
    dataAfterSubmit: {
      description:
        "Controls what happens to the form data after a successful submit. " +
        "`\"keep\"` (default) leaves the submitted data in the form. " +
        "`\"reset\"` restores the form to its initial data. " +
        "`\"clear\"` empties the form as if no `data` property were set.",
      availableValues: ["keep", "reset", "clear"],
      valueType: "string",
      defaultValue: formDefaultProps.dataAfterSubmit,
    },
  },
  events: {
    willSubmit: {
      description:
        `Fired just before the form is submitted. Returning \`false\` cancels the submission; ` +
        `returning a plain object submits that object instead.`,
      signature:
        "willSubmit(data: Record<string, any>, allData: Record<string, any>): false | Record<string, any> | null | undefined | void",
    },
    submit: {
      description:
        "Fires when the wizard's final step submits the form. The handler receives the cleaned " +
        "form data as its only argument.",
      signature: "submit(data: Record<string, any>): void",
    },
    success: {
      description: "Fires when the form is submitted successfully.",
      signature: "success(response: any): void",
    },
    cancel: {
      description: "Fires when the underlying `Form` is canceled.",
      signature: "cancel(): void",
    },
    reset: {
      description: "Fires when the underlying `Form` is reset.",
      signature: "reset(): void",
    },
  },
  apis: {
    reset: {
      description: "Resets the underlying form to its initial state, clearing all user input.",
      signature: "reset(): void",
    },
    update: {
      description: "Updates the form data; only the keys present in the argument are changed.",
      signature: "update(data: Record<string, any>): void",
    },
    validate: {
      description:
        "Triggers validation on all form fields without submitting the form. Returns the cleaned " +
        "form data and detailed validation results.",
      signature:
        "validate(): Promise<{ isValid: boolean, data: Record<string, any>, errors: ValidationResult[], warnings: ValidationResult[] }>",
    },
    getData: {
      description: "Returns a deep clone of the current form data object.",
      signature: "getData(): Record<string, any>",
    },
  },
});

const STEPPER_UID = "stepper";
const SEGMENT_UID_PREFIX = "segment";

function buildStep(seg: ComponentDef, i: number, total: number, labels: {
  back: string;
  next: string;
  submit: string;
}): ComponentDef {
  const segUid = `${SEGMENT_UID_PREFIX}${i}`;
  const isFirst = i === 0;
  const isLast = i === total - 1;

  // Re-uid the user's FormSegment so we can reference it from the Step expression bindings.
  const segWithUid: ComponentDef = { ...seg, uid: segUid };

  const navChildren: ComponentDef[] = [];
  if (!isFirst) {
    navChildren.push({
      type: "Button",
      props: { label: labels.back, variant: "outlined" },
      events: { click: `${STEPPER_UID}.prev()` },
    } as ComponentDef);
  }
  navChildren.push({ type: "SpaceFiller" } as ComponentDef);
  if (isLast) {
    navChildren.push({
      type: "Button",
      props: {
        label: labels.submit,
        type: "submit",
        variant: "solid",
        themeColor: "primary",
        enabled: `{${segUid}.isValid}`,
      },
    } as ComponentDef);
  } else {
    navChildren.push({
      type: "Button",
      props: { label: labels.next, enabled: `{${segUid}.isValid}` },
      events: { click: `${STEPPER_UID}.next()` },
    } as ComponentDef);
  }

  return {
    type: "Step",
    props: {
      label: seg.props?.label,
      error: `{${segUid}.isDirty && !${segUid}.isValid}`,
      completed: `{${segUid}.isDirty && ${segUid}.isValid && ${STEPPER_UID}.activeStep !== ${i}}`,
    },
    children: [segWithUid, { type: "HStack", children: navChildren } as ComponentDef],
  } as ComponentDef;
}

// Form props that StepperForm forwards to the inner Form. The button-row and styling
// props that no longer make sense (StepperForm hides the button row and renders its own
// per-step buttons) are intentionally omitted.
const FORWARDED_FORM_PROPS = [
  "data",
  "_data_url",
  "itemLabelPosition",
  "itemLabelWidth",
  "itemLabelBreak",
  "verboseValidationFeedback",
  "validationIconSuccess",
  "validationIconError",
  "keepModalOpenOnSubmit",
  "enableSubmit",
  "submitUrl",
  "submitMethod",
  "inProgressNotificationMessage",
  "completedNotificationMessage",
  "errorNotificationMessage",
  "enabled",
  "itemRequireLabelMode",
  "persist",
  "storageKey",
  "doNotPersistFields",
  "keepOnCancel",
  "dataAfterSubmit",
] as const;

export const stepperFormComponentRenderer = wrapComponent(
  COMP,
  () => null,
  StepperFormMd,
  {
    customRender: (_props, context) => {
      const { node, renderChild, extractValue } = context;

      const segments: ComponentDef[] = (node.children ?? []).filter(
        (c: ComponentDef) => c.type === "FormSegment",
      );

      const labels = {
        back: extractValue.asOptionalString(node.props?.backLabel) ?? "Back",
        next: extractValue.asOptionalString(node.props?.nextLabel) ?? "Next",
        submit: extractValue.asOptionalString(node.props?.submitLabel) ?? "Submit",
      };

      const stepNodes: ComponentDef[] = segments.map((seg, i) =>
        buildStep(seg, i, segments.length, labels),
      );

      const formProps: Record<string, unknown> = { hideButtonRow: true };
      for (const key of FORWARDED_FORM_PROPS) {
        const v = node.props?.[key];
        if (v !== undefined) formProps[key] = v;
      }

      const synthetic: ComponentDef = {
        type: "Form",
        uid: node.uid,
        props: formProps,
        events: node.events,
        children: [
          {
            type: "Stepper",
            uid: STEPPER_UID,
            children: stepNodes,
          } as ComponentDef,
        ],
      } as ComponentDef;

      return renderChild(synthetic);
    },
  },
);
