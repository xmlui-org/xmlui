import styles from "./Backdrop.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dComponent } from "../../components/metadata-helpers";
import { Backdrop } from "./BackdropNative";

const COMP = "Backdrop";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/alerts/

export const BackdropMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component is a semi-transparent overlay that appears on ` +
    `top of its child component to obscure or highlight the content behind it.`,
  props: {
    overlayTemplate: dComponent(
      "This property defines the component template for an optional overlay to display " +
        "over the component.",
    ),
    backgroundColor: {
      description: "The background color of the backdrop.",
      valueType: "string",
    },
    opacity: {
      description: "The opacity of the backdrop.",
      valueType: "string",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "black",
    [`opacity-${COMP}`]: "0.1",
  }
});

export const backdropComponentRenderer = createComponentRenderer(
  COMP,
  BackdropMd,
  ({ node, extractValue, renderChild, className }) => {
    return (
      <Backdrop
        className={className}
        overlayTemplate={renderChild(node.props?.overlayTemplate)}
        backgroundColor={extractValue.asOptionalString(node.props.backgroundColor, undefined)}
        opacity={extractValue.asOptionalString(node.props.opacity, undefined)}
      >
        {renderChild(node.children)}
      </Backdrop>
    );
  },
);
