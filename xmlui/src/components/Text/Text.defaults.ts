import type { BreakMode, OverflowMode } from "../abstractions";

export const defaultProps = {
  maxLines: 0,
  preserveLinebreaks: false,
  ellipses: true,
  inline: false,
  overflowMode: undefined as OverflowMode | undefined,
  breakMode: undefined as BreakMode | undefined,
};
