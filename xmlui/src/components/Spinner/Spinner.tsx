import styles from "./Spinner.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Spinner, defaultProps } from "./SpinnerNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "Spinner";

export const SpinnerMd = createMetadata({
  status: "stable",
  description:
    "`Spinner` is an animated indicator that represents an action in progress " +
    "with no deterministic progress value.",
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
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-${COMP}`]: "2.5em",
    [`thickness-${COMP}`]: "0.125em",
    [`borderColor-${COMP}`]: "$color-surface-400",
  },
});

export const spinnerComponentRenderer = createComponentRenderer(
  COMP,
  SpinnerMd,
  ({ node, className, extractValue }) => {
    return (
      <Spinner
        className={className}
        delay={extractValue.asOptionalNumber(node.props.delay)}
        fullScreen={extractValue.asOptionalBoolean(node.props.fullScreen)}
      />
    );
  },
);
