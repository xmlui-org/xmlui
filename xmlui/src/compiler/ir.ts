export type SourceRange = {
  start: number;
  end: number;
};

export type XmluiDocument = XmluiAppDocument | XmluiComponentDocument;

export type XmluiAppDocument = {
  kind: "app";
  root: XmluiElement;
};

export type XmluiComponentDocument = {
  kind: "component";
  name: string;
  root: XmluiElement;
};

export type XmluiNode = XmluiElement | XmluiText;

export type XmluiElement = {
  kind: "element";
  type: string;
  props: Record<string, string>;
  vars: Record<string, string>;
  globals: Record<string, string>;
  events: Record<string, string>;
  children: XmluiNode[];
  range: SourceRange;
};

export type XmluiText = {
  kind: "text";
  value: string;
  range: SourceRange;
};
