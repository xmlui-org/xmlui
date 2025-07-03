import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata, dComponent } from "../metadata-helpers";
import { HoverCardComponent } from "./HovercardNative";

const COMP = "HoverCard";

export const HoverCardMd = createMetadata({
  status: "deprecated",
  description: "(**OBSOLETE**) This component displays some content when its parent component is hovered.",
  props: {
    triggerTemplate: dComponent("The component that opens the hover card when hovered."),
  },
});

export const hoverCardComponentRenderer = createComponentRenderer(
  COMP,
  HoverCardMd,
  ({ node, extractValue, renderChild }) => {
    return (
      <HoverCardComponent triggerTemplate={renderChild(extractValue(node.props.triggerTemplate))}>
        {renderChild(node.children)}
      </HoverCardComponent>
    );
  },
);
