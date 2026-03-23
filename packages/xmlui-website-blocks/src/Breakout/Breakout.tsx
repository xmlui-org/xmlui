import { wrapComponent, createMetadata } from "xmlui";
import type { ComponentMetadata } from "xmlui";
import { Breakout } from "./BreakoutNative";

const COMP = "Breakout";

export const BreakoutMd: ComponentMetadata = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component creates a breakout section. It allows its child to ` +
    `occupy the entire width of the UI even if the app or the parent container constrains ` +
    `the maximum content width.`,
});

export const breakoutComponentRenderer = wrapComponent(COMP, Breakout, BreakoutMd);
