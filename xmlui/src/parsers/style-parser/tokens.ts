// Token types used in layout parsing
export const enum StyleTokenType {
  Eof = -1,
  Ws = -2,
  Unknown = 0,

  // --- Binding Expression specific tokens
  Identifier,
  Star,
  Percentage,
  Number,

  LParent,
  RParent,
  Comma,
  Slash,

  Reset,
  None,
  UserSelect,
  SizeUnit,
  FitToContent,
  Auto,
  Alignment,
  TextAlignment,
  BorderStyle,
  Scrolling,
  TextTransform,
  Direction,
  Angle,
  HexaColor,
  ColorFunc,
  FontFamily,
  ColorName,
  FontWeight,
  DecorationLine,
  Orientation,
  Cursor,
  Default,
  Boolean,
  String
}

// Represents a generic token
export type StyleToken = {
  readonly text: string;
  readonly type: StyleTokenType;
  readonly start: number;
  readonly end: number;
};
