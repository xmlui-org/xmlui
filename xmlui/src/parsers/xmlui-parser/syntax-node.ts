import { SyntaxKind } from "./syntax-kind";
import { findTokenAtPos } from "./utils";

export class Node {
  public readonly kind: SyntaxKind;
  /** Start position of the node including it's trivia */
  public readonly start: number;
  public readonly pos: number;
  public readonly end: number;
  public readonly triviaBefore?: Node[];
  public readonly children?: Node[];

  constructor(
    kind: SyntaxKind,
    pos: number,
    end: number,
    triviaBefore?: Node[],
    children?: Node[],
  ) {
    this.kind = kind;
    this.pos = pos;
    this.end = end;
    this.triviaBefore = triviaBefore;
    this.children = children;

    if (triviaBefore) {
      this.start = triviaBefore[0]?.start ?? pos;
    } else if (children) {
      this.start = children[0]?.start ?? pos;
    } else {
      this.start = pos;
    }
  }

  isElementNode(): this is ElementNode {
    return this.kind === SyntaxKind.ElementNode;
  }

  isAttributeNode(): this is AttributeNode {
    return this.kind === SyntaxKind.AttributeNode;
  }

  isAttributeKeyNode(): this is AttributeKeyNode {
    return this.kind === SyntaxKind.AttributeKeyNode;
  }

  isContentListNode(): this is ContentListNode {
    return this.kind === SyntaxKind.ContentListNode;
  }

  isAttributeListNode(): this is AttributeListNode {
    return this.kind === SyntaxKind.AttributeListNode;
  }

  isTagNameNode(): this is TagNameNode {
    return this.kind === SyntaxKind.TagNameNode;
  }

  findTokenAtPos(position: number) {
    return findTokenAtPos(this, position);
  }
}

export class ElementNode extends Node {
  getAttributeListNode() {
    return this.children!.find((c) => c.isContentListNode());
  }
}

export class AttributeNode extends Node {}
export class AttributeKeyNode extends Node {}
export class ContentListNode extends Node {}
export class AttributeListNode extends Node {}
export class TagNameNode extends Node {}
