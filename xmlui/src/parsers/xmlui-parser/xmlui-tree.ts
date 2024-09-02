export type XmlUiNode = XmlUiComment | XmlUiAttribute | XmlUiElement;

export type XmlUiFragment = XmlUiNode | XmlUiNode[];

export interface XmlUiNodeBase {
  type: XmlUiNode["type"];
}

export interface XmlUiComment extends XmlUiNodeBase {
  type: "XmlUiComment";
  text?: string;
}

export interface XmlUiAttribute extends XmlUiNodeBase {
  type: "XmlUiAttribute";
  name: string;
  namespace?: string;
  value?: string;
  preserveQuotes?: boolean;
  preserveSpaces?: boolean;
}

export interface XmlUiElement extends XmlUiNodeBase {
  type: "XmlUiElement";
  name: string;
  namespace?: string;
  attributes?: XmlUiAttribute[];
  text?: string;
  preserveSpaces?: boolean;
  childNodes?: XmlUiNode[];
}
