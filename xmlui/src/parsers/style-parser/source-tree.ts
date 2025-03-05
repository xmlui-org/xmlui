// The root type of all source tree nodes
export interface BaseNode {
  type: StyleNode["type"];
  startPosition: number;
  endPosition: number;
  themeId?: ThemeIdDescriptor;
}

export type DefaultValueDescriptor = (string | ThemeIdDescriptor)[];

export type ThemeIdDescriptor = {
  id: string;
  defaultValue?: DefaultValueDescriptor;
};

export interface SizeNode extends BaseNode {
  type: "Size";
  value: number;
  unit: string;
  extSize?: string;
}

export interface BooleanNode extends BaseNode {
  type: "Boolean";
  value: boolean;
}

export interface BorderStyleNode extends BaseNode {
  type: "BorderStyle";
  value: string;
}

export interface BorderNode extends BaseNode {
  type: "Border";
  widthValue?: number;
  widthUnit?: string;
  color?: string | number;
  styleValue?: string;
  themeId1?: ThemeIdDescriptor;
  themeId2?: ThemeIdDescriptor;
  themeId3?: ThemeIdDescriptor;
}

export interface ColorNode extends BaseNode {
  type: "Color";
  colorId?: string;
  value: string | number;
}

export type StyleNode = SizeNode | BooleanNode | BorderStyleNode | BorderNode | ColorNode;
