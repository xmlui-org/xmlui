export type UemlNode = UemlComment | UemlElement | UemlAttribute | UemlText;

// The root type of all source tree nodes
export interface BaseNode {
  /**
   * Node type discriminator
   */
  type: UemlNode["type"];

  /**
   * Start position (inclusive) of the node
   */
  startPosition: number;

  /**
   * End position (exclusive)
   */
  endPosition: number;

  /**
   * Start line number of the start token of the node
   */
  startLine: number;

  /**
   * End line number of the end token of the node
   */
  endLine: number;

  /**
   * Start column number (inclusive) of the node
   */
  startColumn: number;

  /**
   * End column number (exclusive) of the node
   */
  endColumn: number;

  /**
   * The source code of the expression
   */
  source: string;
}

export interface UemlComment extends BaseNode {
  type: "Comment";
  text: string;
}

export interface UemlElement extends BaseNode {
  type: "Element";
  id: string;
  namespace?: string;
  attributes?: UemlAttribute[];
  childNodes?: UemlNode[];
}

export interface UemlAttribute extends BaseNode {
  type: "Attribute";
  namespace?: string;
  startSegment?: string;
  name: string;
  value: string;
}

export interface UemlText extends BaseNode {
  type: "Text";
  text: string;
}
