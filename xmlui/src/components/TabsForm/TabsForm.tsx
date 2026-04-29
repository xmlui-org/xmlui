import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, d, dEnabled, dInternal } from "../metadata-helpers";
import { labelPositionMd, requireLabelModeMd } from "../abstractions";
import { defaultProps as formDefaultProps } from "../Form/FormReact";
import type { ComponentDef } from "../../abstractions/ComponentDefs";

const COMP = "TabsForm";

export const TabsFormMd = createMetadata({
  status: "experimental",
  description:
    "`TabsForm` bundles a `Form` and a `Tabs` into a tabbed form layout. Pass " +
    "`FormSegment` children directly: each segment becomes a tab, with its `label` " +
    "shown in the tab header. The form's standard Save/Cancel button row is rendered " +
    "below the active tab and submits the data collected across all tabs. All `Form` " +
    "props, events, and methods are forwarded.",
  props: {
    data: {
      description:
        "Initial form data passed to the underlying `Form`. Same semantics as " +
        "`Form.data` — fields with `bindTo` matching keys in this object are " +
        "pre-populated and tracked across tabs.",
      valueType: "any",
    },
    saveLabel: {
      description: "Label for the Save button in the form's button row.",
      valueType: "string",
      defaultValue: formDefaultProps.saveLabel,
    },
    cancelLabel: {
      description: "Label for the Cancel button in the form's button row.",
      valueType: "string",
      defaultValue: formDefaultProps.cancelLabel,
    },
    saveInProgressLabel: {
      description: "Label shown on the Save button while the form is submitting.",
      valueType: "string",
      defaultValue: formDefaultProps.saveInProgressLabel,
    },
    swapCancelAndSave: {
      description:
        "By default, Cancel sits to the left of Save. Set this to `true` to swap them.",
      valueType: "boolean",
      defaultValue: formDefaultProps.swapCancelAndSave,
    },
    hideButtonRow: {
      description:
        "Hides the form's button row entirely. Useful when you want to drive submission " +
        "from a custom button placed outside or inside a tab.",
      valueType: "boolean",
      defaultValue: formDefaultProps.hideButtonRow,
    },
    hideButtonRowUntilDirty: {
      description: "Hides the button row until the form data is modified (dirty).",
      valueType: "boolean",
      defaultValue: formDefaultProps.hideButtonRowUntilDirty,
    },
    stickyButtonRow: {
      description:
        "When `true`, the button row sticks to the bottom of the scrollable content area.",
      valueType: "boolean",
      defaultValue: formDefaultProps.stickyButtonRow,
    },
    tabsOrientation: {
      description:
        "Layout orientation of the inner `Tabs`. In `horizontal` mode the tab headers " +
        "sit on top of the content panel; in `vertical` mode they sit on the side.",
      availableValues: ["horizontal", "vertical"],
      valueType: "string",
      defaultValue: "horizontal",
    },
    tabsTabAlignment: {
      description:
        "Alignment of the tab headers within the inner `Tabs` header strip in horizontal " +
        "orientation. Use `start` (default), `end`, `center`, or `stretch`.",
      availableValues: ["start", "end", "center", "stretch"],
      valueType: "string",
      defaultValue: "start",
    },
    tabsAccordionView: {
      description:
        "When `true`, displays the inner `Tabs` in an accordion-like view where tab " +
        "headers stack vertically and only the active tab's content is visible. When " +
        "enabled, `tabsOrientation` is ignored.",
      valueType: "boolean",
      defaultValue: false,
    },
    tabsDistributeEvenly: {
      description:
        "When `true`, distributes all tabs evenly across the full width of the inner " +
        "`Tabs` header strip. Equivalent to `tabsTabAlignment=\"stretch\"`.",
      valueType: "boolean",
      defaultValue: false,
    },
    tabsActiveTab: {
      description:
        "Zero-based index of the initially active tab in the inner `Tabs`. Defaults to 0.",
      valueType: "number",
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
        `This property controls whether the Save button is enabled. When set to false, ` +
        `the Save button is disabled and the form cannot be submitted.`,
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
    submit: {
      description:
        "Fires when the form is submitted. The handler receives the cleaned form data as " +
        "its only argument.",
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

const TABS_UID = "tabsFormTabs";
const SEGMENT_UID_PREFIX = "tabsFormSegment";

function buildTabItem(seg: ComponentDef, i: number): ComponentDef {
  const segUid = `${SEGMENT_UID_PREFIX}${i}`;
  // Re-uid the user's FormSegment so the submitFailed handler can reference it
  // by a stable, generated id.
  const segWithUid: ComponentDef = { ...seg, uid: segUid };
  return {
    type: "TabItem",
    props: {
      label: seg.props?.label,
    },
    children: [segWithUid],
  } as ComponentDef;
}

// Form props that TabsForm forwards to the inner Form. Unlike StepperForm, the standard
// button row is preserved (the Tabs component has no built-in per-step navigation), so
// `saveLabel`/`cancelLabel`/etc. are forwarded too.
const FORWARDED_FORM_PROPS = [
  "data",
  "_data_url",
  "saveLabel",
  "cancelLabel",
  "saveInProgressLabel",
  "swapCancelAndSave",
  "hideButtonRow",
  "hideButtonRowUntilDirty",
  "stickyButtonRow",
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

// Tabs props that TabsForm forwards to the inner Tabs. Keys are TabsForm prop names
// (prefixed with `tabs`); values are the Tabs's native prop names.
const FORWARDED_TABS_PROPS: Record<string, string> = {
  tabsOrientation: "orientation",
  tabsTabAlignment: "tabAlignment",
  tabsAccordionView: "accordionView",
  tabsDistributeEvenly: "distributeEvenly",
  tabsActiveTab: "activeTab",
};

export const tabsFormComponentRenderer = wrapComponent(
  COMP,
  () => null,
  TabsFormMd,
  {
    customRender: (_props, context) => {
      const { node, renderChild } = context;

      const segments: ComponentDef[] = (node.children ?? []).filter(
        (c: ComponentDef) => c.type === "FormSegment",
      );

      const tabItemNodes: ComponentDef[] = segments.map((seg, i) => buildTabItem(seg, i));

      const formProps: Record<string, unknown> = {};
      for (const key of FORWARDED_FORM_PROPS) {
        const v = node.props?.[key];
        if (v !== undefined) formProps[key] = v;
      }

      const tabsProps: Record<string, unknown> = {};
      for (const [tabsFormKey, tabsKey] of Object.entries(FORWARDED_TABS_PROPS)) {
        const v = node.props?.[tabsFormKey];
        if (v !== undefined) tabsProps[tabsKey] = v;
      }

      // Auto-validation on submit: when the underlying Form rejects a submit attempt,
      // jump to the first segment that is invalid. The handler runs only on failed
      // submits; valid submits flow through to the user's `onSubmit` normally.
      const submitFailedHandler = segments
        .map(
          (_seg, i) =>
            `if (!${SEGMENT_UID_PREFIX}${i}.isValid) { ${TABS_UID}.setActiveTabIndex(${i}); return; }`,
        )
        .join(" ");

      const synthetic: ComponentDef = {
        type: "Form",
        uid: node.uid,
        props: formProps,
        events: {
          ...(node.events ?? {}),
          submitFailed: submitFailedHandler,
        },
        children: [
          {
            type: "Tabs",
            uid: TABS_UID,
            props: tabsProps,
            children: tabItemNodes,
          } as ComponentDef,
        ],
      } as ComponentDef;

      return renderChild(synthetic);
    },
  },
);
