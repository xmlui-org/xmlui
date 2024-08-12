export type UemlNode = UemlComment | UemlAttribute | UemlElement;

export type UemlFragment = UemlNode | UemlNode[];

export interface UemlNodeBase {
  type: UemlNode["type"];
}

export interface UemlComment extends UemlNodeBase {
  type: "UemlComment";
  text?: string;
}

export interface UemlAttribute extends UemlNodeBase {
  type: "UemlAttribute";
  name: string;
  namespace?: string;
  value?: string;
  preserveQuotes?: boolean;
  preserveSpaces?: boolean;
}

export interface UemlElement extends UemlNodeBase {
  type: "UemlElement";
  name: string;
  namespace?: string;
  attributes?: UemlAttribute[];
  text?: string;
  preserveSpaces?: boolean;
  childNodes?: UemlNode[];
}
