import { wrapComponent } from "../../components-core/wrapComponent";
import { createMetadata, dLabel } from "../metadata-helpers";
import { Step } from "./StepReact";
import React from "react";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { StepperMd } from "./Stepper";

const COMP = "Step";

export const StepMd = createMetadata({
  status: "experimental",
  description:
    "`Step` defines an individual step within a [Stepper](/components/Stepper) component. " +
    "It provides the step header (label, description, icon) and the content shown when the step is active.",
  docFolder: "Stepper",
  props: {
    label: dLabel(),
    description: {
      description: "Optional secondary text shown under the step label.",
      valueType: "string",
    },
    icon: {
      description:
        "Optional icon name to display in the step indicator instead of the step number.",
      valueType: "string",
    },
    error: {
      description:
        "When `true`, the step header is rendered in the error state (red icon and label, " +
        "with an `!` glyph in place of the step number).",
      valueType: "boolean",
      defaultValue: false,
    },
    completed: {
      description:
        "When `true`, the step header is rendered in the completed state (a checkmark glyph " +
        "and the completed color). Ignored when `error` is also `true`.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  events: {
    activated: {
      description: "Fires whenever this step becomes the active step.",
      signature: "activated(): void",
      parameters: {},
    },
  },
  themeVars: StepperMd.themeVars,
});

type ThemedStepProps = React.ComponentPropsWithoutRef<typeof Step>;

export const ThemedStep = React.forwardRef<React.ElementRef<typeof Step>, ThemedStepProps>(
  function ThemedStep({ className, ...props }, ref) {
    const themeClass = useComponentThemeClass(StepMd);
    return (
      <Step
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);

export const stepComponentRenderer = wrapComponent(COMP, ThemedStep, StepMd, {
  events: { activated: "activated" },
});
