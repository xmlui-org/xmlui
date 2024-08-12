import React, { CSSProperties, ReactNode } from "react";
import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./PositionedContainer.module.scss";
import classnames from "@components-core/utils/classnames";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

function PositionedContainer({
  children,
  top,
  right,
  bottom,
  left,
  visibleOnHover = false,
}: {
  children: ReactNode;
  top: CSSProperties["top"];
  right: CSSProperties["right"];
  bottom: CSSProperties["bottom"];
  left: CSSProperties["left"];
  visibleOnHover: boolean;
}) {
  return (
    <div
      style={{ top, right, bottom, left }}
      className={classnames(styles.wrapper, {
        [styles.visibleOnHover]: visibleOnHover,
      })}
    >
      {children}
    </div>
  );
}

interface PositionedContainerComponentDef extends ComponentDef<"PositionedContainer"> {
  props: {
    visibleOnHover?: string;
  };
}

const metadata: ComponentDescriptor<PositionedContainerComponentDef> = {
  displayName: "PositionedContainer",
  description: "",
  props: {
    visibleOnHover: desc(""),
  },
  themeVars: parseScssVar(styles.themeVars),
};

export const positionedContainerComponentRenderer = createComponentRenderer<PositionedContainerComponentDef>(
  "PositionedContainer",
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
  metadata
);

export default PositionedContainer;
