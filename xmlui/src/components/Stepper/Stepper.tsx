import styles from "./Stepper.module.scss";

import { parseScssVar } from "../../components-core/theming/themeVars";
import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, dDidChange } from "../metadata-helpers";
import { Stepper, defaultProps } from "./StepperReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";

const COMP = "Stepper";

export const StepperMd = createMetadata({
  status: "experimental",
  description:
    "`Stepper` displays a sequence of steps for a multi-step workflow or wizard. " +
    "Individual steps are declared with [Step](/components/Step) children. " +
    "Inspired by the Material UI Stepper, it supports horizontal and vertical " +
    "orientations, an alternative-label layout, and a nonLinear mode that allows " +
    "users to navigate between steps freely.",
  props: {
    activeStep: {
      description:
        "The 0-based index of the currently active step. If not set, the first step " +
        "(index 0) is active. When out of range, it falls back to 0.",
      valueType: "number",
      defaultValue: defaultProps.activeStep,
    },
    orientation: {
      description:
        "Layout orientation of the stepper. In `horizontal` mode the step headers are " +
        "laid out in a row above a shared content area; only the active step's content " +
        "is shown. In `vertical` mode each step renders its own header with the active " +
        "step's content expanding beneath it.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
    alternativeLabel: {
      description:
        "When `true` (horizontal orientation only), step labels are placed below the " +
        "step icons instead of next to them.",
      valueType: "boolean",
      defaultValue: defaultProps.alternativeLabel,
    },
    nonLinear: {
      description:
        "When `true`, step headers become clickable so users can jump to any step. " +
        "Default is `false` (linear navigation via the `next`/`prev` APIs).",
      valueType: "boolean",
      defaultValue: defaultProps.nonLinear,
    },
  },
  events: {
    didChange: dDidChange(COMP),
  },
  apis: {
    next: {
      description:
        "Advances to the next step. If the current step is the last, no change occurs.",
      signature: "next(): void",
    },
    prev: {
      description:
        "Moves back to the previous step. If the current step is the first, no change occurs.",
      signature: "prev(): void",
    },
    reset: {
      description: "Resets the stepper back to the first step (index 0).",
      signature: "reset(): void",
    },
    setActiveStep: {
      description: "Sets the active step by its 0-based index.",
      signature: "setActiveStep(index: number): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "transparent",
    [`padding-${COMP}`]: "0",
    [`gap-${COMP}`]: "0",

    [`size-icon-${COMP}`]: "28px",
    [`fontSize-icon-${COMP}`]: "$fontSize-small",
    [`fontWeight-icon-${COMP}`]: "$fontWeight-bold",

    [`backgroundColor-icon-${COMP}`]: "$color-surface-300",
    [`textColor-icon-${COMP}`]: "$color-surface-50",

    [`backgroundColor-icon-${COMP}--active`]: "$color-primary-500",
    [`textColor-icon-${COMP}--active`]: "$color-surface-50",

    [`backgroundColor-icon-${COMP}--completed`]: "$color-primary-500",
    [`textColor-icon-${COMP}--completed`]: "$color-surface-50",

    [`backgroundColor-icon-${COMP}--error`]: "$color-danger-500",
    [`textColor-icon-${COMP}--error`]: "$color-surface-50",

    [`fontSize-label-${COMP}`]: "$fontSize-base",
    [`fontWeight-label-${COMP}`]: "$fontWeight-normal",
    [`textColor-label-${COMP}`]: "$textColor-secondary",
    [`textColor-label-${COMP}--active`]: "$textColor-primary",
    [`textColor-label-${COMP}--completed`]: "$textColor-primary",
    [`textColor-label-${COMP}--error`]: "$color-danger-600",

    [`fontSize-description-${COMP}`]: "$fontSize-small",
    [`textColor-description-${COMP}`]: "$textColor-secondary",

    [`borderColor-connector-${COMP}`]: "$borderColor",
    [`borderColor-connector-${COMP}--completed`]: "$color-primary-500",
    [`borderWidth-connector-${COMP}`]: "1px",
    [`borderStyle-connector-${COMP}`]: "solid",

    [`padding-content-${COMP}`]: "$space-4 0",
  },
});

type ThemedStepperProps = React.ComponentPropsWithoutRef<typeof Stepper>;

export const ThemedStepper = React.forwardRef<React.ElementRef<typeof Stepper>, ThemedStepperProps>(
  function ThemedStepper({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(StepperMd);
    return (
      <Stepper
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const stepperComponentRenderer = wrapComponent(COMP, ThemedStepper, StepperMd, {
  exposeRegisterApi: true,
});
