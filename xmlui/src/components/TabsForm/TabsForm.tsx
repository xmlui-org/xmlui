import { createMetadata, dEnabled } from "../../component-core/metadata/helpers";

export const TabsFormMd = createMetadata({
  status: "experimental",
  description:
    "`TabsForm` bundles a `Form` and a tabbed layout. `FormSegment` children become tabs.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    data: { description: "Initial form data.", valueType: "any" },
    saveLabel: { description: "The Save button label.", valueType: "string", defaultValue: "Save" },
    cancelLabel: { description: "The Cancel button label.", valueType: "string", defaultValue: "Cancel" },
    hideButtonRow: { description: "Hides the form button row.", valueType: "boolean", defaultValue: false },
    enableSubmit: { description: "Enables the Save button.", valueType: "boolean", defaultValue: true },
    tabsOrientation: {
      description: "The orientation of the tab headers.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    },
    tabsTabAlignment: {
      description: "The tab header alignment.",
      valueType: "string",
      availableValues: ["start", "end", "center", "stretch"],
      defaultValue: "start",
    },
    tabsAccordionView: { description: "Displays tabs in accordion view.", valueType: "boolean", defaultValue: false },
    tabsDistributeEvenly: { description: "Distributes tabs evenly.", valueType: "boolean", defaultValue: false },
    tabsActiveTab: { description: "The initially active tab index.", valueType: "number", defaultValue: 0 },
    enabled: dEnabled(true),
  },
  events: {
    submit: { description: "Fires when the inner form submits." },
    submitFailed: { description: "Fires when the inner form fails validation." },
    cancel: { description: "Fires when the inner form is canceled." },
  },
  apis: {
    reset: { description: "Resets the inner form." },
    update: { description: "Updates the inner form data." },
    getData: { description: "Returns the inner form data." },
    validate: { description: "Validates the inner form." },
  },
});
