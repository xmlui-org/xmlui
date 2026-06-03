import type { BreakMode, OverflowMode } from "../abstractions";

export const defaultProps = {
  removeIndents: true,
  removeBr: false,
  overflowMode: undefined as OverflowMode | undefined,
  breakMode: "normal" as BreakMode | undefined,
};
