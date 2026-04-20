import styles from "./Spinner.module.scss";

import React from "react";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Spinner, defaultProps } from "./SpinnerReact";
import { createMetadata } from "../metadata-helpers";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { wrapComponent } from "../../components-core/wrapComponent";

const COMP = "Spinner";

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
      description: `The delay in milliseconds before the spinner is displayed.`,
      valueType: "number",
      defaultValue: defaultProps.delay,
    },
    fullScreen: {
      description: `If set to \`true\`, the component will be rendered in a full screen container.`,
      valueType: "boolean",
      defaultValue: defaultProps.fullScreen,
    },
  },
  defaultAriaLabel: "Loading",
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-${COMP}`]: "2.5em",
    [`thickness-${COMP}`]: "0.125em",
    [`borderColor-${COMP}`]: "$color-surface-400",
  },
});

type ThemedSpinnerProps = Omit<React.ComponentProps<typeof Spinner>, "classes"> & { className?: string };
export const ThemedSpinner = React.forwardRef<HTMLDivElement, ThemedSpinnerProps>(
  function ThemedSpinner({ className, ...props }: ThemedSpinnerProps, ref) {
    const themeClass = useComponentThemeClass(SpinnerMd);
    const combinedClass = [themeClass, className].filter(Boolean).join(" ");
    return <Spinner {...props} classes={{ [COMPONENT_PART_KEY]: combinedClass }} ref={ref} />;
  },
);

export const spinnerComponentRenderer = wrapComponent(
  COMP,
  ThemedSpinner,
  SpinnerMd,
);
