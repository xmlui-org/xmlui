import { Breakout } from "./BreakoutNative";

import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";

const COMP = "Breakout";

export const BreakoutMd = createMetadata({
  description: `The \`${COMP}\` component is used to create a breakout section.`,
});

export const breakoutComponentRenderer = createComponentRenderer(
  COMP,
  BreakoutMd,
  ({ node, renderChild }) => {
    return <Breakout>{renderChild(node.children)}</Breakout>;
  },
);
