import { createMetadata, dDidChange, dLabel } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Stepper.defaults";

const COMP = "Stepper";

const stepperStylesSource = `
$backgroundColor-Stepper: createThemeVar("backgroundColor-Stepper");
$padding-Stepper: createThemeVar("padding-Stepper");
$gap-Stepper: createThemeVar("gap-Stepper");
$size-icon-Stepper: createThemeVar("size-icon-Stepper");
$fontSize-icon-Stepper: createThemeVar("fontSize-icon-Stepper");
$fontWeight-icon-Stepper: createThemeVar("fontWeight-icon-Stepper");
$backgroundColor-icon-Stepper: createThemeVar("backgroundColor-icon-Stepper");
$textColor-icon-Stepper: createThemeVar("textColor-icon-Stepper");
$backgroundColor-icon-Stepper--active: createThemeVar("backgroundColor-icon-Stepper--active");
$textColor-icon-Stepper--active: createThemeVar("textColor-icon-Stepper--active");
$backgroundColor-icon-Stepper--completed: createThemeVar("backgroundColor-icon-Stepper--completed");
$textColor-icon-Stepper--completed: createThemeVar("textColor-icon-Stepper--completed");
$backgroundColor-icon-Stepper--error: createThemeVar("backgroundColor-icon-Stepper--error");
$textColor-icon-Stepper--error: createThemeVar("textColor-icon-Stepper--error");
$fontSize-label-Stepper: createThemeVar("fontSize-label-Stepper");
$fontWeight-label-Stepper: createThemeVar("fontWeight-label-Stepper");
$textColor-label-Stepper: createThemeVar("textColor-label-Stepper");
$textColor-label-Stepper--active: createThemeVar("textColor-label-Stepper--active");
$textColor-label-Stepper--completed: createThemeVar("textColor-label-Stepper--completed");
$textColor-label-Stepper--error: createThemeVar("textColor-label-Stepper--error");
$fontSize-description-Stepper: createThemeVar("fontSize-description-Stepper");
$textColor-description-Stepper: createThemeVar("textColor-description-Stepper");
$borderColor-connector-Stepper: createThemeVar("borderColor-connector-Stepper");
$borderColor-connector-Stepper--completed: createThemeVar("borderColor-connector-Stepper--completed");
$borderWidth-connector-Stepper: createThemeVar("borderWidth-connector-Stepper");
$borderStyle-connector-Stepper: createThemeVar("borderStyle-connector-Stepper");
$padding-content-Stepper: createThemeVar("padding-content-Stepper");
`;

export const StepperMd = createMetadata({
  status: "experimental",
  description:
    "`Stepper` displays a sequence of steps for a multi-step workflow or wizard. " +
    "Individual steps are declared with [Step](/components/Step) children. " +
    "Inspired by the Material UI Stepper, it supports horizontal and vertical " +
    "orientations, an alternative-label layout, and a nonLinear mode that allows " +
    "users to navigate between steps freely.",
  optimization: {
    isImplicitContainerByDefault: true,
  },
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
      isStrictEnum: true,
      defaultValue: defaultProps.orientation,
    },
    stackedLabel: {
      description:
        "When `true`, step labels are placed below the step icons instead of next to them. " +
        "Works in both horizontal and vertical orientations.",
      valueType: "boolean",
      defaultValue: defaultProps.stackedLabel,
    },
    nonLinear: {
      description:
        "When `true`, step headers become clickable so users can jump to any step. " +
        "Default is `false` (linear navigation via the `next`/`prev` APIs).",
      valueType: "boolean",
      defaultValue: defaultProps.nonLinear,
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
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
  themeVars: extractScssThemeVars(stepperStylesSource),
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
        "When `true`, the step header is rendered in the error state.",
      valueType: "boolean",
      defaultValue: false,
    },
    completed: {
      description:
        "When `true`, the step header is rendered in the completed state. Ignored when `error` is also `true`.",
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
