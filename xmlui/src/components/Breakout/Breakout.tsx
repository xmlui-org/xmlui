import { createComponentRenderer } from "../../components-core/renderers";
import { createMetadata } from "../metadata-helpers";
import { Breakout } from "./BreakoutNative";

const COMP = "Breakout";

export const BreakoutMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component creates a breakout section. It allows its child to ` +
    `occupy the entire width of the UI even if the app or the parent container constrains ` +
    `the maximum content width.`,
});

export const breakoutComponentRenderer = createComponentRenderer(
  COMP,
  BreakoutMd,
  ({ node, renderChild }) => {
    return <Breakout>{renderChild(node.children)}</Breakout>;
  },
);
