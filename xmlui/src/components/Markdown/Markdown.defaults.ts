import type { BreakMode, OverflowMode } from "../abstractions";

export const defaultProps = {
  removeIndents: true,
  removeBr: false,
  interpolateBindings: true,
  allowHtml: true,
  overflowMode: undefined as OverflowMode | undefined,
  breakMode: "normal" as BreakMode | undefined,
};
