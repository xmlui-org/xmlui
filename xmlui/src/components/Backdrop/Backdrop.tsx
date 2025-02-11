import styles from "./Backdrop.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { dComponent } from "../../components/metadata-helpers";
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
    backgroundColor: d("The background color of the backdrop.", null, "string", "black"),
    opacity: d("The opacity of the backdrop.", null, "number", 0.1),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const backdropComponentRenderer = createComponentRenderer(
  COMP,
  BackdropMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <Backdrop
        style={layoutCss}
        overlayTemplate={renderChild(node.props?.overlayTemplate)}
        backgroundColor={extractValue.asOptionalString(node.props.backgroundColor)}
        opacity={extractValue.asString(node.props.opacity)}
      >
        {renderChild(node.children)}
      </Backdrop>
    );
  },
);
