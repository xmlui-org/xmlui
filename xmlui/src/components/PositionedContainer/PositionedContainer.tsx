import { createMetadata, d } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import styles from "./PositionedContainer.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { PositionedContainer } from "./PositionedContainerNative";

const COMP = "PositionedContainer";

export const PositionedContainerMd = createMetadata({
  description: "No description",
  props: {
    visibleOnHover: d("No description"),
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const positionedContainerComponentRenderer = createComponentRendererNew(
  COMP,
  PositionedContainerMd,
  ({ node, extractValue, renderChild, layoutCss }) => {
    return (
      <PositionedContainer
        top={layoutCss.top}
        right={layoutCss.right}
        bottom={layoutCss.bottom}
        left={layoutCss.left}
        visibleOnHover={extractValue.asOptionalBoolean(node.props.visibleOnHover)}
      >
        {renderChild(node.children)}
      </PositionedContainer>
    );
  },
);
