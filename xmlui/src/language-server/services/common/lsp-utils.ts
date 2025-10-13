import type { Position, Range } from "vscode-languageserver";

type OffsetRange = { pos: number, end: number };

export function offsetToPosRange(offsetToPos: (number) => Position, range: OffsetRange): Range {
  return {
    start: offsetToPos(range.pos),
    end: offsetToPos(range.end),
  }
}
