import styles from "./PositionedContainer.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { PositionedContainer } from "./PositionedContainerNative";
import { createMetadata, d } from "../metadata-helpers";

const COMP = "PositionedContainer";

export const PositionedContainerMd = createMetadata({
  status: "deprecated",
  description: "(**OBSOLETE**) This component was created for the ChatEngine app.",
  props: {
    visibleOnHover: d("No description"),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const positionedContainerComponentRenderer = createComponentRenderer(
  COMP,
  PositionedContainerMd,
  ({ node, extractValue, renderChild, className }) => {
    return (
      <PositionedContainer
        className={className}
        visibleOnHover={extractValue.asOptionalBoolean(node.props.visibleOnHover)}
      >
        {renderChild(node.children)}
      </PositionedContainer>
    );
  },
);
