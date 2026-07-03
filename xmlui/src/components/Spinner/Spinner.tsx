import React from "react";

import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Spinner.defaults";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { Spinner } from "./SpinnerReact";

const COMP = "Spinner";

const spinnerStylesSource = `
$size-Spinner: createThemeVar("size-Spinner");
$thickness-Spinner: createThemeVar("thickness-Spinner");
$borderColor-Spinner: createThemeVar("borderColor-Spinner");
`;

export const SpinnerMd = createMetadata({
  status: "stable",
  description:
    "`Spinner` is an animated indicator that represents an action in progress " +
    "with no deterministic progress value.",
  parts: {
    ring: {
      description: "The animated ring element of the spinner.",
    },
  },
  props: {
    delay: {
      description: "The delay in milliseconds before the spinner is displayed.",
      valueType: "number",
      defaultValue: defaultProps.delay,
    },
    fullScreen: {
      description: "If set to `true`, the component will be rendered in a full screen container.",
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
    testId: {
      description: "Adds a test identifier to the component root.",
      valueType: "string",
    },
  },
  defaultAriaLabel: "Loading",
  themeVars: extractScssThemeVars(spinnerStylesSource),
  defaultThemeVars: {
    [`size-${COMP}`]: "2.5em",
    [`thickness-${COMP}`]: "0.125em",
    [`borderColor-${COMP}`]: "$color-surface-400",
  },
});

type ThemedSpinnerProps = React.ComponentProps<typeof Spinner> & { className?: string };
export const ThemedSpinner = React.forwardRef<HTMLDivElement, ThemedSpinnerProps>(
  function ThemedSpinner({ className, ...props }: ThemedSpinnerProps, ref) {
    const themeClass = useComponentThemeClass(SpinnerMd);
    return (
      <Spinner
        {...props}
        className={`${themeClass}${className ? ` ${className}` : ""}`}
        ref={ref}
      />
    );
  },
);
