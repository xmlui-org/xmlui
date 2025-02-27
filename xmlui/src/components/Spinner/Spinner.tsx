import styles from "./Spinner.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { Spinner } from "./SpinnerNative";

const COMP = "Spinner";

export const SpinnerMd = createMetadata({
  description:
    `The \`${COMP}\` component is an animated indicator that represents a particular action ` +
    `in progress without a deterministic progress value.`,
  props: {
    delay: {
      description: `The delay in milliseconds before the spinner is displayed.`,
      valueType: "number",
      defaultValue: 400,
    },
    fullScreen: {
      description: `If set to \`true\`, the component will be rendered in a full screen container.`,
      valueType: "boolean",
      defaultValue: false,
    },
    themeColor: d(`(**NOT IMPLEMENTED YET**) The theme color of the component.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`size-${COMP}`]: "$space-10",
    [`thickness-${COMP}`]: "$space-0_5",
    light: {
      [`color-border-${COMP}`]: "$color-surface-400",
    },
    dark: {
      [`color-border-${COMP}`]: "$color-surface-600",
    },
  },
});

export const spinnerComponentRenderer = createComponentRenderer(
  COMP,
  SpinnerMd,
  ({ node, layoutCss, extractValue }) => {
    delete layoutCss.width;
    delete layoutCss.minWidth;
    delete layoutCss.maxWidth;
    delete layoutCss.height;
    delete layoutCss.minHeight;
    delete layoutCss.maxHeight;
    return (
      <Spinner
        style={layoutCss}
        delay={extractValue.asOptionalNumber(node.props.delay)}
        fullScreen={extractValue.asOptionalBoolean(node.props.fullScreen)}
      />
    );
  },
);
