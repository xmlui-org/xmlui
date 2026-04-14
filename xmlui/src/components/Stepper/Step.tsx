import { wrapComponent } from "../../components-core/wrapComponent";
import { StepNative, defaultProps } from "./StepNative";
import { createMetadata, d, dComponent, dLabel } from "../metadata-helpers";
import { MemoizedItem } from "../container-helpers";

const COMP = "Step";

export const StepMd = createMetadata({
  status: "experimental",
  description:
    "`Step` defines an individual step within a [Stepper](/components/Stepper) component. " +
    "It provides the step header label, description, and the content that displays " +
    "when the step is active.",
  docFolder: "Stepper",
  props: {
    label: dLabel(),
    description: {
      description: "Subtitle or secondary text shown below the label in the step indicator.",
      valueType: "string",
    },
    icon: {
      description:
        "XMLUI icon name to show inside the step indicator when the step is active " +
        "or incomplete. Defaults to the 1-based step number.",
      valueType: "string",
    },
    completedIcon: {
      description: "Icon shown inside the indicator when the step is completed.",
      valueType: "string",
      defaultValue: defaultProps.completedIcon,
    },
    loading: {
      description:
        "When `true`, replaces the step icon with a spinner to indicate async work in progress.",
      valueType: "boolean",
      defaultValue: defaultProps.loading,
    },
    allowSkip: {
      description:
        "Allows this step to be skipped when the parent Stepper's `linear` mode is enabled.",
      valueType: "boolean",
      defaultValue: defaultProps.allowSkip,
    },
    allowStepSelect: {
      description:
        "Per-step override for whether the user can click this step's indicator to navigate to it. " +
        "Takes precedence over the parent Stepper's `allowNextStepsSelect`. When not set, the global setting applies.",
      valueType: "boolean",
    },
    headerTemplate: {
      ...dComponent(
        "Slot for fully custom step header content. Receives `$step` context " +
          "(index, label, isActive, isCompleted, isFirst, isLast).",
      ),
    },
  },
  events: {
    activate: {
      description: "This event fires when this step becomes the active step.",
      signature: "(): void",
      parameters: {},
    },
  },
  contextVars: {
    $step: d(
      "Context value representing the step state with props: index, label, isActive, isCompleted, isFirst, isLast.",
    ),
  },
});

export const stepComponentRenderer = wrapComponent(
  COMP,
  StepNative,
  StepMd,
  {
    exclude: [
      "label",
      "description",
      "icon",
      "completedIcon",
      "loading",
      "allowSkip",
      "allowStepSelect",
      "headerTemplate",
    ],
    events: [],
    customRender(_props, { node, extractValue, renderChild, lookupEventHandler }) {
      return (
        <StepNative
          label={extractValue.asOptionalString(node.props.label)}
          description={extractValue.asOptionalString(node.props.description)}
          icon={extractValue.asOptionalString(node.props.icon)}
          completedIcon={extractValue.asOptionalString(
            node.props.completedIcon,
            defaultProps.completedIcon,
          )}
          loading={extractValue.asOptionalBoolean(node.props.loading, defaultProps.loading)}
          allowSkip={extractValue.asOptionalBoolean(node.props.allowSkip, defaultProps.allowSkip)}
          allowStepSelect={extractValue.asOptionalBoolean(node.props.allowStepSelect)}
          onActivate={lookupEventHandler("activate")}
          headerRenderer={
            node.props.headerTemplate
              ? (stepContext) => (
                  <MemoizedItem
                    node={node.props.headerTemplate}
                    contextVars={{ $step: stepContext }}
                    renderChild={renderChild}
                  />
                )
              : undefined
          }
        >
          {renderChild(node.children)}
        </StepNative>
      );
    },
  },
);
