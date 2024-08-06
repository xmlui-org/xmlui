/**
 * This type represents the available types of property values
 */
export type PropertyValueType =
  | "boolean"
  | "string"
  | "number"
  | "numberOrString"
  | "OrientationOptions"
  | "AlignmentOptions"
  | "UserSelectOptions"  
  | "DirectionOptions"
  | "ScrollingOptions"
  | "CssFontFamily"
  | "CssFontWeight"
  | "CssSize"
  | "CssOpacity"  
  | "CssBorder"
  | "CssRadius"
  | "CssColor"
  | "CssShadow"
  | "CssTextDecoration"
  | "ActionSet"
  | "CssColorType"
  | "ComponentDef"
  | "ComponentDef[]"
  | "ComponentDefMap"
  | "IconPosition"
  | "CssUnit"
  | "TextTransformOptions"
  | "TextWrapOptions"
  | "Option[] | string[]"
  | "FieldValidator[]"
  | "SearchBoxDef"
  | TypographyHintValueType
  | ButtonHintValueType
  | "any";

export type TypographyHintValueType = "HeadingLevel" | "TextVariant";

export type ButtonHintValueType = "ButtonType" | "ButtonVariant" | "ButtonThemeColor" | "ButtonSize";
