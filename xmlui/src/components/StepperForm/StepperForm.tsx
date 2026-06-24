import { createMetadata, dEnabled } from "../../component-core/metadata/helpers";

export const StepperFormMd = createMetadata({
  status: "experimental",
  description:
    "`StepperForm` bundles a `Form` and a step-based layout. `FormSegment` children become steps.",
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    data: { description: "Initial form data.", valueType: "any" },
    backLabel: { description: "The Back button label.", valueType: "string", defaultValue: "Back" },
    nextLabel: { description: "The Next button label.", valueType: "string", defaultValue: "Next" },
    submitLabel: { description: "The Submit button label.", valueType: "string", defaultValue: "Submit" },
    stepperOrientation: {
      description: "The step header orientation.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    },
    stepperNonLinear: { description: "Allows clicking step headers.", valueType: "boolean", defaultValue: false },
    stepperStackedLabel: { description: "Stacks step labels.", valueType: "boolean", defaultValue: false },
    enabled: dEnabled(true),
  },
  events: {
    submit: { description: "Fires when the final step submits." },
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
