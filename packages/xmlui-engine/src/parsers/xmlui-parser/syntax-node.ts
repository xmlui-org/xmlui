import { SyntaxKind } from "./syntax-kind";

type NodeId = number;

interface ReadonlyTextRange {
  readonly pos: number;
  readonly end: number;
}

export interface Node extends ReadonlyTextRange {
  readonly kind: SyntaxKind;
  readonly start: number; // Start position of the node with trivia
  readonly triviaBefore?: Node[];
  readonly children?: Node[];
}
