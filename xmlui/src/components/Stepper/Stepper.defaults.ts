import type { StepperOrientation } from "./StepperContext";

export const defaultProps = {
  activeStep: 0,
  orientation: "horizontal" as StepperOrientation,
  stackedLabel: false,
  nonLinear: false,
};
