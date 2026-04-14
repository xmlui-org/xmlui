import styles from "./Stepper.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { StepperNative, defaultProps } from "./StepperNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "Stepper";

export const StepperMd = createMetadata({
  status: "experimental",
  description:
    "`Stepper` guides users through a sequential multi-step process. It shows a visual " +
    "progress indicator (numbered circles connected by separator lines) and displays " +
    "the content panel for the currently active step. Each step is defined by a " +
    "[Step](/components/Step) child component.",
  props: {
    activeStep: {
      description:
        "0-based index of the currently active step. Can be bound two-way via state.",
      valueType: "number",
      defaultValue: defaultProps.activeStep,
    },
    orientation: {
      description: "Layout direction of the step indicator strip.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
    allowNextStepsSelect: {
      description:
        "When `false`, clicking on a future (not yet reached) step is disabled. " +
        "Per-step control is available via the `Step.allowStepSelect` prop.",
      valueType: "boolean",
      defaultValue: defaultProps.allowNextStepsSelect,
    },
    linear: {
      description:
        "When `true`, the stepper enforces sequential step completion. Forward navigation " +
        "is blocked unless the current step allows skipping.",
      valueType: "boolean",
      defaultValue: defaultProps.linear,
    },
    completed: {
      description:
        "Explicitly marks the stepper as completed. When not set, falls back to " +
        "`activeStep >= stepCount`.",
      valueType: "boolean",
    },
    iconPosition: {
      description:
        "Side the step icon appears relative to the step label/description body. " +
        "Only applies in horizontal orientation.",
      valueType: "string",
      availableValues: ["left", "right"],
      defaultValue: defaultProps.iconPosition,
    },
  },
  events: {
    stepChange: {
      description: "Fires when the active step changes (user click or programmatic).",
      signature: "(index: number) => void",
      parameters: {
        index: "0-based index of the new active step.",
      },
    },
    complete: {
      description:
        "Fires when the stepper reaches the completed state (active step passes the last step).",
      signature: "() => void",
      parameters: {},
    },
  },
  apis: {
    next: {
      description: "Advance to the next step. No-op if already past the last step.",
      signature: "next(): void",
    },
    prev: {
      description: "Go back to the previous step. No-op if on the first step.",
      signature: "prev(): void",
    },
    goToStep: {
      description:
        "Jump to an arbitrary step index. Respects `allowNextStepsSelect` and per-step constraints.",
      signature: "goToStep(index: number): void",
    },
    reset: {
      description: "Return to step 0 and clear the highest-visited state.",
      signature: "reset(): void",
    },
  },
  contextVars: {
    activeStep: d("Current 0-based step index."),
    hasPrevStep: d("Whether `prev()` would move to a previous step."),
    hasNextStep: d("Whether `next()` would move to a next step."),
    isCompleted: d(
      "True when the `completed` prop is set, otherwise falls back to " +
        "`activeStep >= stepCount`.",
    ),
    stepCount: d("Total number of Step children."),
    percent: d("Progress as a 0–100 value (`activeStep / stepCount * 100`)."),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-indicator-${COMP}`]: "32px",
    [`borderWidth-indicator-${COMP}`]: "2px",
    [`color-indicator-active-${COMP}`]: "$color-primary-500",
    [`color-indicator-completed-${COMP}`]: "$color-primary-500",
    [`color-indicator-incomplete-${COMP}`]: "$color-surface-300",
    [`color-separator-${COMP}`]: "$color-surface-300",
    [`color-separator-completed-${COMP}`]: "$color-primary-500",
    [`thickness-separator-${COMP}`]: "2px",
    [`fontSize-label-${COMP}`]: "$fontSize-sm",
    [`fontSize-description-${COMP}`]: "$fontSize-xs",
    [`color-label-active-${COMP}`]: "$color-primary-700",
    [`color-label-completed-${COMP}`]: "$color-primary-600",
    [`color-label-incomplete-${COMP}`]: "$color-surface-500",
    [`gap-${COMP}`]: "$space-4",
    [`color-indicator-text-${COMP}`]: "$color-surface-500",
    [`color-indicator-text-active-${COMP}`]: "white",
  },
});

export const stepperComponentRenderer = wrapComponent(
  COMP,
  StepperNative,
  StepperMd,
  {
    exposeRegisterApi: true,
    exclude: [
      "activeStep",
      "orientation",
      "allowNextStepsSelect",
      "linear",
      "completed",
      "iconPosition",
    ],
    events: [],
    customRender(
      _props,
      { node, extractValue, renderChild, classes, registerComponentApi, lookupEventHandler, state, updateState },
    ) {
      return (
        <StepperNative
          id={node?.uid}
          classes={classes}
          activeStep={extractValue(node.props?.activeStep)}
          orientation={extractValue(node.props?.orientation)}
          allowNextStepsSelect={extractValue.asOptionalBoolean(
            node.props?.allowNextStepsSelect,
            defaultProps.allowNextStepsSelect,
          )}
          linear={extractValue.asOptionalBoolean(node.props?.linear, defaultProps.linear)}
          completed={extractValue.asOptionalBoolean(node.props?.completed)}
          iconPosition={extractValue.asOptionalString(
            node.props?.iconPosition,
            defaultProps.iconPosition,
          )}
          updateState={updateState}
          registerComponentApi={registerComponentApi}
          onStepChange={lookupEventHandler("stepChange")}
          onComplete={lookupEventHandler("complete")}
        >
          {renderChild(node.children)}
        </StepperNative>
      );
    },
  },
);
