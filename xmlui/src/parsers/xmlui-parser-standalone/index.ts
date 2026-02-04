/**
 * Standalone XMLUI Parser for Browser Use
 *
 * This is a minimal bundle of the XMLUI parser suitable for use in browser
 * environments like the Inspector viewer. It excludes heavy dependencies
 * like the scripting parser, React icons, and component definitions.
 *
 * Usage:
 *   import { parseXmlUiMarkup, SyntaxKind, DocumentCursor } from './xmlui-parser-standalone.js';
 *
 *   const source = '<Button id="myBtn" onClick="handleClick">Click me</Button>';
 *   const { node: ast, errors } = parseXmlUiMarkup(source);
 *   const cursor = new DocumentCursor(source);
 */

// Core parser
export { parseXmlUiMarkup, createXmlUiParser } from "../xmlui-parser/parser";
export type { ParseResult, GetText } from "../xmlui-parser/parser";

// AST node types
export {
  Node,
  ElementNode,
  AttributeNode,
  AttributeKeyNode,
  ContentListNode,
  AttributeListNode,
  TagNameNode,
} from "../xmlui-parser/syntax-node";

// Syntax kinds for node type checking
export { SyntaxKind, getSyntaxKindStrRepr } from "../xmlui-parser/syntax-kind";

// Utilities
export { findTokenAtOffset, tagNameNodesWithoutErrorsMatch } from "../xmlui-parser/utils";

// Document cursor for line/column tracking
export { DocumentCursor } from "../../language-server/base/text-document";

// Character codes (useful for custom scanning)
export { CharacterCodes } from "../xmlui-parser/CharacterCodes";

// =============================================================================
// INSPECTOR HELPER UTILITIES
// =============================================================================

import { parseXmlUiMarkup } from "../xmlui-parser/parser";
import { SyntaxKind } from "../xmlui-parser/syntax-kind";
import type { Node } from "../xmlui-parser/syntax-node";
import { DocumentCursor } from "../../language-server/base/text-document";

export interface FoundElement {
  node: Node;
  tagName: string;
  attributes: Record<string, string>;
  start: number;
  end: number;
  startLine: number;
  endLine: number;
  source: string;
}

export interface FoundAttribute {
  node: Node;
  key: string;
  value: string;
  start: number;
  end: number;
  line: number;
}

/**
 * Helper class for working with parsed XMLUI source.
 * Provides convenient methods for finding elements and attributes.
 */
export class XmluiSource {
  public readonly ast: Node;
  public readonly errors: any[];
  public readonly cursor: DocumentCursor;

  constructor(
    public readonly source: string,
    public readonly fileName: string = "source.xmlui"
  ) {
    const result = parseXmlUiMarkup(source);
    this.ast = result.node;
    this.errors = result.errors;
    this.cursor = new DocumentCursor(source);
  }

  /**
   * Get the source text for a node.
   */
  getText(node: Node): string {
    return this.source.slice(node.pos, node.end);
  }

  /**
   * Get the line number (1-indexed) for a position.
   */
  getLine(position: number): number {
    return this.cursor.positionAt(position).line + 1;
  }

  /**
   * Find an element by its id attribute.
   */
  findById(id: string): FoundElement | null {
    return this.findByAttribute("id", id);
  }

  /**
   * Find an element by any attribute value.
   */
  findByAttribute(attrName: string, attrValue: string): FoundElement | null {
    const walk = (node: Node): FoundElement | null => {
      if (node.kind === SyntaxKind.ElementNode) {
        const tagName = this.getNodeTagName(node);
        const attrList = node.children?.find(c => c.kind === SyntaxKind.AttributeListNode);

        // Check attributes for match
        for (const attr of attrList?.children || []) {
          if (attr.kind === SyntaxKind.AttributeNode) {
            const { key, value } = this.extractKeyValue(attr);
            if (key === attrName && value === attrValue) {
              return {
                node,
                tagName,
                attributes: this.getNodeAttributes(node),
                start: node.start,
                end: node.end,
                startLine: this.getLine(node.start),
                endLine: this.getLine(node.end),
                source: this.getText(node),
              };
            }
          }
        }
      }

      for (const child of node.children || []) {
        const found = walk(child);
        if (found) return found;
      }
      return null;
    };

    return walk(this.ast);
  }

  /**
   * Find all elements with a specific tag name.
   */
  findByTagName(tagName: string): FoundElement[] {
    const results: FoundElement[] = [];

    const walk = (node: Node): void => {
      if (node.kind === SyntaxKind.ElementNode) {
        const nodeTagName = this.getNodeTagName(node);
        if (nodeTagName === tagName) {
          results.push({
            node,
            tagName: nodeTagName,
            attributes: this.getNodeAttributes(node),
            start: node.start,
            end: node.end,
            startLine: this.getLine(node.start),
            endLine: this.getLine(node.end),
            source: this.getText(node),
          });
        }
      }

      for (const child of node.children || []) {
        walk(child);
      }
    };

    walk(this.ast);
    return results;
  }

  /**
   * Find all handler attributes (on* attributes) in the document.
   */
  findHandlers(eventName?: string): FoundAttribute[] {
    const results: FoundAttribute[] = [];
    const pattern = eventName
      ? new RegExp(`^on${eventName}$`, "i")
      : /^on[A-Z]/;

    const walk = (node: Node): void => {
      if (node.kind === SyntaxKind.ElementNode) {
        const attrList = node.children?.find(c => c.kind === SyntaxKind.AttributeListNode);
        for (const attr of attrList?.children || []) {
          if (attr.kind === SyntaxKind.AttributeNode && attr.children) {
            const { key, value } = this.extractKeyValue(attr);
            if (key && pattern.test(key)) {
              results.push({
                node: attr,
                key,
                value: value || "",
                start: attr.start,
                end: attr.end,
                line: this.getLine(attr.start),
              });
            }
          }
        }
      }

      for (const child of node.children || []) {
        walk(child);
      }
    };

    walk(this.ast);
    return results;
  }

  /**
   * Find a specific handler on a specific element.
   */
  findHandler(elementId: string, eventName: string): FoundAttribute | null {
    const element = this.findById(elementId);
    if (!element) return null;

    const attrList = element.node.children?.find(c => c.kind === SyntaxKind.AttributeListNode);
    const targetKey = `on${eventName}`;

    for (const attr of attrList?.children || []) {
      if (attr.kind === SyntaxKind.AttributeNode) {
        const { key, value } = this.extractKeyValue(attr);
        if (key && key.toLowerCase() === targetKey.toLowerCase()) {
          return {
            node: attr,
            key,
            value: value || "",
            start: attr.start,
            end: attr.end,
            line: this.getLine(attr.start),
          };
        }
      }
    }

    return null;
  }

  /**
   * Get all attributes from an element node.
   */
  getNodeAttributes(elementNode: Node): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrList = elementNode.children?.find(c => c.kind === SyntaxKind.AttributeListNode);

    for (const attr of attrList?.children || []) {
      if (attr.kind === SyntaxKind.AttributeNode) {
        const { key, value } = this.extractKeyValue(attr);
        if (key) {
          attrs[key] = value || "";
        }
      }
    }

    return attrs;
  }

  /**
   * Get the tag name from an element node.
   */
  getNodeTagName(elementNode: Node): string {
    const tagNameNode = elementNode.children?.find(c => c.kind === SyntaxKind.TagNameNode);
    if (tagNameNode) {
      return this.source.slice(tagNameNode.pos, tagNameNode.end);
    }
    return "";
  }

  /**
   * Get source with line numbers, optionally highlighting a range.
   */
  getSourceWithLineNumbers(
    highlightStart?: number,
    highlightEnd?: number
  ): string {
    const lines = this.source.split("\n");
    const highlightStartLine = highlightStart !== undefined
      ? this.getLine(highlightStart)
      : -1;
    const highlightEndLine = highlightEnd !== undefined
      ? this.getLine(highlightEnd)
      : -1;

    return lines
      .map((line, i) => {
        const lineNum = i + 1;
        const prefix = (lineNum >= highlightStartLine && lineNum <= highlightEndLine)
          ? "→ "
          : "  ";
        return `${prefix}${String(lineNum).padStart(4)}: ${line}`;
      })
      .join("\n");
  }

  /**
   * Extract key and value from an AttributeNode.
   * AttributeNode children are: [AttributeKeyNode, Equal, StringLiteral]
   */
  private extractKeyValue(attrNode: Node): { key: string | null; value: string | null } {
    if (!attrNode.children) return { key: null, value: null };

    let key: string | null = null;
    let value: string | null = null;

    for (const child of attrNode.children) {
      if (child.kind === SyntaxKind.AttributeKeyNode) {
        key = this.source.slice(child.pos, child.end);
      } else if (child.kind === SyntaxKind.StringLiteral) {
        const rawVal = this.source.slice(child.pos, child.end);
        value = this.stripQuotes(rawVal);
      }
    }

    return { key, value };
  }

  /**
   * Strip surrounding quotes from a string value.
   */
  private stripQuotes(value: string): string {
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    // Handle binding expressions like {foo}
    if (value.startsWith("{") && value.endsWith("}")) {
      return value; // Keep as-is for bindings
    }
    return value;
  }
}
