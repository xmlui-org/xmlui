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
    [`size-${COMP}`]: "$space-10",
    [`thickness-${COMP}`]: "$space-0_5",
    [`borderColor-${COMP}`]: "$color-surface-400",
  },
});

export const spinnerComponentRenderer = createComponentRenderer(
  COMP,
  SpinnerMd,
  ({ node, className, extractValue }) => {
    // TODO: Remove this once the SpinnerNative is updated to use CSS variables
    // delete layoutCss.width;
    // delete layoutCss.minWidth;
    // delete layoutCss.maxWidth;
    // delete layoutCss.height;
    // delete layoutCss.minHeight;
    // delete layoutCss.maxHeight;
    return (
      <Spinner
        className={className}
        delay={extractValue.asOptionalNumber(node.props.delay)}
        fullScreen={extractValue.asOptionalBoolean(node.props.fullScreen)}
      />
    );
  },
);
