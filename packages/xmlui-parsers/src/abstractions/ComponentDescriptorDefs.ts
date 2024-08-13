import type { ComponentDef } from "./ComponentDefs";

// A generic validation function that retrieves either a hint (the validation argument has
// issues) or undefined (the argument is valid).
export type IsValidFunction<T> = (propKey: string, propValue: T) => string | string[] | undefined | null;

// Describes the metadata of a particular component property
export type ComponentPropertyDescriptor = {
  // The display name of the property to display in the inspector view
  displayName?: string;

  // The category the property belongs to
  category?: string;

  // The markdown description to explain the property in the inspector view
  description?: string;

  // The value type of the property
  valueType?: PropertyValueType;

  // What are the available values of this property?
  availableValues?: any[];

  // The default property value (if there is any)
  defaultValue?: any;

  // The function that tests if the current property value is valid
  isValid?: IsValidFunction<any>;
};

// A hash object of component property descriptors
export type PropertyComponentDescriptorHash<T extends ComponentDef> = Partial<
  Record<keyof NonNullable<T["props"]> | keyof LayoutProps, ComponentPropertyDescriptor>
>;

// A hash object of component event descriptors
export type EventDescriptorHash<T extends ComponentDef> = Partial<
  Record<keyof NonNullable<T["events"]>, ComponentPropertyDescriptor>
>;

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

// The properties constituting a component's layout
export type LayoutProps = {
  // --- Context-dependent/non-CSS props
  horizontalAlignment?: string;
  verticalAlignment?: string;
  orientation?: string;

  // --- Dimensions
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  gap?: string;

  // --- Positions
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;

  // --- Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;

  // --- Border radius
  radius?: number | string;
  radiusTopLeft?: number | string;
  radiusTopRight?: number | string;
  radiusBottomLeft?: number | string;
  radiusBottomRight?: number | string;

  // --- Padding
  padding?: number | string;
  horizontalPadding?: number | string;
  verticalPadding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  // --- Margin
  margin?: number | string;
  horizontalMargin?: number | string;
  verticalMargin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;

  // --- Other
  backgroundColor?: string;
  background?: string;
  shadow?: string;
  direction?: string;
  horizontalOverflow?: string;
  verticalOverflow?: string;
  zIndex?: number | string;
  opacity?: string | number;

  // --- Typography
  color?: string;
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  italic?: boolean | string;
  textDecoration?: string;
  userSelect?: string;
  letterSpacing?: string;
  textTransform?: string;
  lineHeight?: string;
  textAlign?: string;
  textWrap?: string;
  textAlignLast?: string;

  // --- Content rendering
  wrapContent?: boolean | string;
  canShrink?: boolean | string;

  // --- Other
  cursor?: string;
};
