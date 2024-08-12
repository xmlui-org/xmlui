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

export interface SpacingNode extends BaseNode {
  type: "Spacing";
  spacingId?: string;
  value: number;
  unit: string;
}

export interface AlignmentNode extends BaseNode {
  type: "Alignment";
  value: string;
}

export interface TextAlignNode extends BaseNode {
  type: "TextAlign";
  value: string;
}

export interface UserSelectNode extends BaseNode {
  type: "UserSelect";
  value: string;
}

export interface TextTransformNode extends BaseNode {
  type: "TextTransform";
  value: string;
}

export interface OrientationNode extends BaseNode {
  type: "Orientation";
  value: string;
}

export interface CursorNode extends BaseNode {
  type: "Cursor";
  value: string;
}

export interface BooleanNode extends BaseNode {
  type: "Boolean";
  value: boolean;
}

export interface ContentAlignmentNode extends BaseNode {
  type: "ContentAlignment";
  horizontal: string;
  vertical: string;
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

export interface DirectionNode extends BaseNode {
  type: "Direction";
  value: string;
}

export interface FontFamilyNode extends BaseNode {
  type: "FontFamily";
  value: string;
}

export interface TextDecorationNode extends BaseNode {
  type: "TextDecoration";
  none?: boolean;
  color?: string | number;
  style?: string;
  line?: string;
  themeId1?: ThemeIdDescriptor;
  themeId2?: ThemeIdDescriptor;
  themeId3?: ThemeIdDescriptor;
}

export interface FontWeightNode extends BaseNode {
  type: "FontWeight";
  value: number | string;
}

export interface ZIndexNode extends BaseNode {
  type: "ZIndex";
  value: number | string;
}

export interface ScrollingNode extends BaseNode {
  type: "Scrolling";
  value: string;
}

export interface RadiusNode extends BaseNode {
  type: "Radius";
  value1: number;
  unit1: string;
  value2?: number;
  unit2?: string;
  themeId1?: ThemeIdDescriptor;
  themeId2?: ThemeIdDescriptor;
}

export type ShadowSegment = {
  inset?: boolean;
  offsetXValue: number;
  offsetXUnit: string;
  offsetYValue: number;
  offsetYUnit: string;
  blurRadiusValue?: number;
  blurRadiusUnit?: string;
  spreadRadiusValue?: number;
  spreadRadiusUnit?: string;
  color?: number | string;
};

export interface ShadowNode extends BaseNode {
  type: "Shadow";
  shadowId?: string;
  segments?: ShadowSegment[];
}

export interface ColorNode extends BaseNode {
  type: "Color";
  colorId?: string;
  value: string | number;
}

export type StyleNode =
  | SizeNode
  | SpacingNode
  | AlignmentNode
  | UserSelectNode
  | ContentAlignmentNode
  | BorderStyleNode
  | BorderNode
  | DirectionNode
  | FontFamilyNode
  | ScrollingNode
  | ShadowNode
  | ColorNode
  | FontWeightNode
  | RadiusNode
  | TextDecorationNode
  | TextTransformNode
  | OrientationNode
  | ZIndexNode
  | BooleanNode
  | CursorNode
  | TextAlignNode;
