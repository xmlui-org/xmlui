import styles from "./Spinner.module.scss";
import { createComponentRendererNew } from "@components-core/renderers";
import { createMetadata, d } from "@abstractions/ComponentDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import { ComponentThemeColor } from "@components/abstractions";
import { Spinner } from "./SopinnerNative";

const COMP = "Spinner";

export const SpinnerMd = createMetadata({
  description:
    `The \`${COMP}\` component is an animated indicator that represents a particular action ` +
    `in progress without a deterministic progress value.`,
  props: {
    delay: d(`The delay in milliseconds before the spinner is displayed.`),
    fullScreen: d(`If set to \`true\`, the component will be rendered in a full screen container.`),
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

export const spinnerComponentRenderer = createComponentRendererNew(
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
